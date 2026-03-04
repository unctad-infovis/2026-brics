import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef
} from 'react';
import PropTypes from 'prop-types';
import {
  drag,
  extent,
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceRadial,
  forceSimulation,
  scaleSymlog,
  scalePow,
  select
} from 'd3';
import 'intersection-observer';
import { useIsVisible } from 'react-is-visible';

import edges_2003 from './data/figure1_data_2003_edges.json';
import edges_2024 from './data/figure2_data_2024_edges.json';
import nodes_2003 from './data/figure1_data_2003_nodes.json';
import nodes_2024 from './data/figure2_data_2024_nodes.json';

const ForceNetwork = forwardRef(({ value, dimensions }, ref) => {
  const svgRef = useRef();
  const svgContainerRef = useRef();
  const chartRef = useRef();
  const isVisible = useIsVisible(chartRef, { once: true });

  const simulationRef = useRef(null);
  const nodesMapRef = useRef({}); // keep nodes by id to preserve positions

  const chart = useCallback(() => {
    const width = Math.max(Math.min(Math.min(dimensions.height, dimensions.width), 700), 700);
    const height = Math.max(Math.min(Math.min(dimensions.height, dimensions.width), 600), 600);

    const margin = {
      top: 20, right: 20, bottom: 20, left: 20
    };
    const svg = select(svgRef.current)
      .attr('height', height - margin.top - margin.bottom)
      .attr('width', width - margin.left - margin.right)
      .attr('viewBox', [0, 0, width, height]);

    const allNodes = [...nodes_2024];
    const dragNodes = drag()
      .on('start', (event, d) => {
        if (!event.active) simulationRef.current.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulationRef.current.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    // --- Legend ---
    svg.selectAll('.legend').remove(); // clear old legend on update

    const legendData = [
      { label: (value === '1') ? 'In 2024' : 'In 2003', color: '#000', group: 'title' }
    ];

    // Legend group
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', 'translate(40, 40)');

    // One row per item
    const items = legend.selectAll('.legend-item')
      .data(legendData)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 24})`)
      .style('cursor', (d) => ((d.group === '') ? 'normal' : 'pointer'))
      .style('opacity', 1);

    // Circle symbol
    items.append('circle')
      .attr('r', (d) => ((d.group) === 'title' ? 0 : 7))
      .attr('cx', 7)
      .attr('cy', 7)
      .attr('fill', d => d.color);

    // Text label
    items.append('text')
      .attr('x', (d) => ((d.group) === 'title' ? 0 : 22))
      .attr('y', 11)
      .attr('fill', '#000')
      .attr('class', (d) => ((d.group) === 'title' ? 'legend-item-year' : ''))
      .style('font-weight', (d) => ((d.group) === 'title' ? '700' : '400'))
      .style('font-size', (d) => ((d.group) === 'title' ? '26px' : '16px'))
      .text(d => d.label);

    const nodesData = nodes_2024;
    let linksData = edges_2024;

    // attach source/target status to link objects for easy lookup
    linksData = linksData.map(l => ({
      ...l,
      sourceStatus: nodesData.find(n => n.id === l.source)?.status,
      targetStatus: nodesData.find(n => n.id === l.target)?.status
    }));

    // --- Preserve previous positions ---
    allNodes.forEach(d => {
      if (nodesMapRef.current[d.id]) {
        d.x = nodesMapRef.current[d.id].x;
        d.y = nodesMapRef.current[d.id].y;
        d.vx = nodesMapRef.current[d.id].vx;
        d.vy = nodesMapRef.current[d.id].vy;
      }
    });
    nodesMapRef.current = Object.fromEntries(nodesData.map(d => [d.id, d]));

    // --- Simulation ---
    const centerForce = forceRadial(
      d => 10 / Math.sqrt(d.value),
      width / 2,
      height / 2
    ).strength(0.07); // stronger radial pull
    if (!simulationRef.current) {
      simulationRef.current = forceSimulation(nodesData)
        .force('link', forceLink(linksData).id(d => d.id).distance(400))
        .force('charge', forceManyBody().strength(d => -250 / Math.sqrt(d.value)))
        .force('center', forceCenter(width / 2, height / 2))
        .force('collide', forceCollide(d => d.r))
        .force('radial', centerForce);
    } else {
      simulationRef.current.nodes(nodesData);
      simulationRef.current.force('link').links(linksData);
      simulationRef.current.alpha(1).restart();
    }

    // --- Links ---
    const allEdgeValues = [
      ...edges_2003.map(d => d.value),
      ...edges_2024.map(d => d.value)
    ];

    const strokeScale = scalePow()
      .exponent(4) // stronger effect
      .domain(extent(allEdgeValues))
      .range([2, 30]);

    const opacityScale = scaleSymlog()
      .constant(1)
      .domain(extent(allEdgeValues))
      .range([0.7, 0.7]);

    // Use <g> groups to contain curve + arrow
    const linkPairs = {};
    linksData = linksData.map(d => {
      const forwardKey = `${d.source}-${d.target}`;
      const reverseKey = `${d.target}-${d.source}`;

      if (linkPairs[reverseKey]) {
        // Bidirectional: mark one forward, one reverse
        d.curveDir = 1; // current edge curves one way
        linkPairs[reverseKey].curveDir = -1; // previous edge curves opposite
      } else {
        d.curveDir = 0; // single edge, no special curve
        linkPairs[forwardKey] = d;
      }
      return d;
    });
    const linkSel = svg.selectAll('.link-group').data(
      linksData.map(d => ({
        ...d,
        sid: typeof d.source === 'object' ? d.source.id : d.source,
        tid: typeof d.target === 'object' ? d.target.id : d.target
      })),
      d => `${d.sid}-${d.tid}`
    );

    const linkEnter = linkSel.enter()
      .append('g')
      .attr('class', 'link-group');

    // The actual curved path
    linkEnter.append('path')
      .attr('class', d => `link link_${d.sourceStatus}_${d.targetStatus}`)
      .attr('fill', 'none')
      .attr('stroke', '#FFD48E');

    // Arrow at midpoint
    linkEnter.append('path')
      .attr('class', 'arrow')
      .attr('fill', '#666')
      .attr('d', 'M-10,-4 L0,0 L-10,4 Z');

    const linkUpdate = linkEnter.merge(linkSel);

    // Update stroke + opacity
    linkUpdate.select('.link')
      .transition()
      .duration(300)
      .attr('stroke-width', d => strokeScale(d.value))
      .attr('opacity', d => Math.max(0.03, opacityScale(d.value)));

    linkUpdate.select('.arrow')
      .transition()
      .duration(300)
      .attr('opacity', d => Math.max(0.03, opacityScale(d.value)));

    // Remove old links
    linkSel.exit()
      .transition()
      .duration(300)
      .attr('opacity', 0)
      .remove();

    // --- Nodes ---
    const nodeSel = svg.selectAll('.node').data(nodesData, d => d.id);

    const nodeEnter = nodeSel.enter()
      .append('circle')
      .attr('class', d => `node node_${d.status}`)
      .attr('r', 0)
      .attr('fill', d => (d.status === 'active' ? '#009edb' : '#ffcb05'))
      .attr('opacity', 0)
      .call(dragNodes);

    const allValues = [
      ...nodes_2003.map(d => d.value),
      ...nodes_2024.map(d => d.value)
    ];

    const radiusScale = scalePow()
      .exponent(0.5) // increase for stronger effect
      .domain(extent(allValues)) // min → max across both datasets
      .range([1, 40]); // tweak to your liking

    const mergedNode = nodeEnter.merge(nodeSel);
    mergedNode
      .transition()
      .duration(500)
      .attr('r', d => radiusScale(d.value))
      .attr('opacity', 0.95)
      .each((d, i, elements) => select(elements[i]).raise());

    nodeSel.exit()
      .transition()
      .duration(500)
      .attr('r', 0)
      .attr('opacity', 0)
      .remove();

    // --- Labels ---
    const textScale = scaleSymlog()
      .constant(1)
      .domain(extent(allValues)) // smallest → largest across both datasets
      .range([14, 20]); // adjust these pixel sizes as needed
    const labelSel = svg.selectAll('.nodelabel').data(nodesData, d => d.id);
    const labelEnter = labelSel.enter()
      .append('text')
      .attr('fill', '#fff')
      .attr('class', d => `nodelabel node_${d.status}`)
      .attr('text-anchor', 'middle')
      .attr('dy', 0)
      .attr('opacity', 0)
      .style('font-size', (d) => textScale(d.value))
      .text(d => d.id);

    const mergedLabel = labelEnter.merge(labelSel);
    mergedLabel
      .transition()
      .duration(500)
      .attr('opacity', 1)
      .each((d, i, elements) => select(elements[i]).raise());

    labelSel.exit()
      .transition()
      .duration(500)
      .attr('opacity', 0)
      .remove();

    simulationRef.current.on('tick', () => {
      svg.selectAll('.link-group').each((d, i, nodes) => {
        const sx = d.source?.x;
        const sy = d.source?.y;
        const tx = d.target?.x;
        const ty = d.target?.y;

        if (!Number.isFinite(sx) || !Number.isFinite(sy)
        || !Number.isFinite(tx) || !Number.isFinite(ty)) return;

        const dx = tx - sx;
        const dy = ty - sy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const mx = (sx + tx) / 2;
        const my = (sy + ty) / 2;
        const norm = dist || 1;

        const fixedOffset = 40; // pixels, tweak to your liking
        const direction = d.curveDir === 0 ? 1 : d.curveDir;

        const offsetX = (-dy / norm) * fixedOffset * direction;
        const offsetY = (dx / norm) * fixedOffset * direction;

        const cx = mx + offsetX;
        const cy = my + offsetY;

        // Update curved path
        select(nodes[i]).select('.link')
          .attr('d', `M${sx},${sy} Q${cx},${cy} ${tx},${ty}`);

        // Midpoint for arrow
        const t = 0.5;
        const x = ((1 - t) ** 2) * sx + (2 * (1 - t) * t) * cx + (t ** 2) * tx;
        const y = ((1 - t) ** 2) * sy + (2 * (1 - t) * t) * cy + (t ** 2) * ty;

        // Tangent for rotation
        const dx2 = (2 * (1 - t) * (cx - sx)) + (2 * t * (tx - cx));
        const dy2 = (2 * (1 - t) * (cy - sy)) + (2 * t * (ty - cy));
        const angle = (Math.atan2(dy2, dx2) * 180) / Math.PI;

        select(nodes[i]).select('.arrow')
          .attr('transform', `translate(${x},${y}) rotate(${angle})`);
      });

      // Update nodes
      svg.selectAll('.node')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      // Update labels
      svg.selectAll('.nodelabel')
        .attr('x', d => d.x)
        .attr('y', d => d.y - radiusScale(d.value) - 2);
    });
  }, [value, dimensions]);

  useEffect(() => {
    if (!svgRef.current && svgContainerRef.current) {
      const svg = select(svgContainerRef.current).append('svg');
      svgRef.current = svg.node();
    }
    if (isVisible) chart();
  }, [chart, isVisible]);

  return (
    <div ref={chartRef}>
      <div className="app" ref={ref}>
        {isVisible && (<div className="svg_container figure2" ref={svgContainerRef} />)}
      </div>
    </div>
  );
});

ForceNetwork.propTypes = {
  dimensions: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired
  }).isRequired,
  value: PropTypes.string.isRequired
};

export default ForceNetwork;

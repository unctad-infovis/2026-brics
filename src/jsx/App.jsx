import React, { /* useState, useEffect */useRef } from 'react';
import '../styles/styles.less';

// Load figures.
import Figure1 from './figures/Figure1.jsx';
import Figure2 from './figures/Figure2.jsx';

function App() {
  const chartFigure1 = useRef(null);
  const chartFigure2 = useRef(null);
  const dimensions = {
    height: window.innerHeight,
    width: window.innerWidth
  };
  return (
    <div className="app">
      <div className="figure_container">
        <div className="title_container">
          <div className="text_container">
            <div className="main_title_container">
              <img src="https://static.dwcdn.net/custom/themes/unctad-2024-rebrand/Blue%20arrow.svg" className="logo" alt="UN Trade and Development logo" width="44" height="44" />
              <div className="title">
                <h3>Trade between BRICS countries has grown rapidly since 2003</h3>
              </div>
            </div>
            <h4>Intra-BRICS trade flows, export side, 2003 and 2024</h4>
          </div>
        </div>
        <Figure1 ref={chartFigure1} value="0" dimensions={dimensions} />
        <Figure2 ref={chartFigure2} value="1" dimensions={dimensions} />
        <div className="caption_container">
          <em>Source:</em>
          {' '}
          UN Trade and Development (UNCTAD) based on UNCTADstat.
          <br />
          <em>Note:</em>
          {' '}
          This network graph shows intra-BRICS export flows in 2003 and 2024. Node size is proportional to each country’s total exports to other BRICS members. Edge thickness is proportional to the bilateral export values, with only flows above 100 million US dollars displayed. Both node sizes and edge thickness are power scaled. Arrows indicate export directions.
          <br />
        </div>
      </div>
    </div>
  );
}

export default App;

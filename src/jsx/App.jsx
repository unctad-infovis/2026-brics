import '@unctad-infovis/general-tools/styles/styles.css';
import '../styles/styles.css';

import ChartHeader from './components/ChartHeader.jsx';
import ChartMeta from './components/ChartMeta.jsx';
import Figure1 from './figures/Figure1.jsx';
import Figure2 from './figures/Figure2.jsx';

function App() {
  return (
    <div className="app">
      <div className="figure_container">
        <ChartHeader title="Trade between BRICS countries has grown rapidly since 2003" subtitle="Intra-BRICS trade flows, export side, 2003 and 2024" />
        <Figure1 value="0" />
        <Figure2 value="1" />
        <ChartMeta
          source="UN Trade and Development (UNCTAD) based on UNCTADstat."
          note="This network graph shows intra-BRICS export flows in 2003 and 2024. Node size is proportional to each country’s total exports to other BRICS members. Edge thickness is proportional to the bilateral export values, with only flows above 100 million US dollars displayed. Both node sizes and edge thickness are power scaled. Arrows indicate export directions."
        />
      </div>
    </div>
  );
}

export default App;

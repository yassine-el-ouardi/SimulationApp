// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import { DragAndDropSidebar } from './components/DragAndDropSidebar';
import { SelectedSidebar } from './components/SelectedSidebar';
import CheckPortsButton from './components/CheckPortsButton';
import { chartSimple } from './misc/exampleChartState';
import { IChart } from './types/chart';

//import MotherComp from './components/dashboard/MotherComp';
//import Concentrate from './components/dashboard/Concentrate';
//import Tailing from './components/dashboard/Tailing';

const App = () => {
  const [chart, setChart] = React.useState<IChart>(chartSimple);
  console.log("hello");

  const onStateChange = (newChart: IChart) => {
    setChart(newChart);
  }

  return (
    <>
      <DragAndDropSidebar onStateChange={onStateChange} />
      <SelectedSidebar />
      <CheckPortsButton chart={chart} />
      {/* You might want to include your dashboard components here as well */}
    </>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));

import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { DragAndDropSidebar } from './components/DragAndDropSidebar';
//import CheckPortsButton from './components/CheckPortsButton';
import { chartSimple } from './misc/exampleChartState';
import { IChart } from './types/chart';
import { SelectedSidebar } from './components/SelectedSidebar';
import MotherComp from './components/dashboard/MotherComp';

import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

const SidebarMenu = () => (
  <div style={{ width: 200, height: '100vh', position: 'fixed', backgroundColor: '#f0f0f0' }}>
    <ul style={{ listStyleType: 'none', padding: 20 }}>
      <li><Link to="/">Home</Link></li>
      <li><Link to="/flowsheet">Flowsheet Drawing</Link></li>
      <li><Link to="/simulation">Simulation and Data Analytics</Link></li>
      <li><Link to="/dashboard">Main Dashboard</Link></li>
      {/* More links as needed */}
    </ul>
  </div>
);

const App = () => {
  const [chart, setChart] = useState<IChart>(chartSimple);

  const onStateChange = (newChart: IChart) => {
    setChart(newChart);
  };

  return (
    <BrowserRouter>
      <SidebarMenu />
      <div style={{ marginLeft: 200 }}>
        <Routes>
          <Route path="/" element={<DragAndDropSidebar onStateChange={onStateChange} />} />
          <Route path="/flowsheet" element={<DragAndDropSidebar onStateChange={onStateChange} />} />
          <Route path="/simulation" element={<SelectedSidebar />} />
          <Route path="/dashboard" element={<MotherComp />} />
          {/* More routes as needed */}
        </Routes>
      </div>
    </BrowserRouter>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));

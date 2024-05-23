import React from 'react';
import { useAppContext } from '../AppContext'; // Adjust the import path as necessary
import SelectedSidebar from './SelectedSidebar'; // Adjust the import path as necessary

const SelectedSidebarWrapper: React.FC = () => {
  const { chartState, setChartState, selection, setSelection } = useAppContext();

  return (
    <SelectedSidebar
      chartState={chartState}
      setChartState={setChartState}
      selection={selection}
      setSelection={setSelection}
    />
  );
};

export default SelectedSidebarWrapper;
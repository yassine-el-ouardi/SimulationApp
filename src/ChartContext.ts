import React, { createContext, useContext, useState, ReactElement } from 'react';
import { IChart } from './types/chart'; // Adjust the path if necessary
import { chartSimple } from './misc/exampleChartState';

interface ChartContextType {
  chart: IChart;
  setChart: React.Dispatch<React.SetStateAction<IChart>>;
}

const ChartContext = createContext<ChartContextType | any>(any);

export const useChart = () => {
  const context = useContext(ChartContext);
  if (!context) {
    throw new Error('useChart must be used within a ChartProvider');
  }
  return context;
};

interface ChartProviderProps {
  children: React.ReactNode;
}

export const ChartProvider: React.FC<ChartProviderProps> = ({ children }): ReactElement => {
  const [chart, setChart] = useState<IChart>(chartSimple);

  // Correct usage of the context provider
  return (
    <ChartContext.Provider value={{ chart, setChart }}>
      {children}
    </ChartContext.Provider>
  );
};

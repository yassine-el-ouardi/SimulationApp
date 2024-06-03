import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IChart } from './types';
import { chartSimple } from './misc/exampleChartState';

// Define the shape of the context state
interface AppState {
  chartState: IChart;
  setChartState: (chart: IChart) => void;
}

// Create the context with default value as undefined to enforce provider usage
const AppContext = createContext<AppState | undefined>(undefined);

// Create a custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};

// Define the AppProvider props
interface AppProviderProps {
  children: ReactNode;
}

// Create the provider component
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [chartState, setChartState] = useState<IChart>(() => {
    // Initialize state from local storage if available
    const savedState = localStorage.getItem('chartState');
    return savedState ? JSON.parse(savedState) : chartSimple; // Default to chartSimple if no saved state
  });

  useEffect(() => {
    // Save chartState to local storage whenever it changes
    localStorage.setItem('chartState', JSON.stringify(chartState));
  }, [chartState]);

  const handleSetChartState = (newChart: IChart) => {
    setChartState(newChart);
    console.log("Context setChartState called with:", newChart);
  };

  return (
    <AppContext.Provider value={{ chartState, setChartState: handleSetChartState }}>
      {children}
    </AppContext.Provider>
  );
};
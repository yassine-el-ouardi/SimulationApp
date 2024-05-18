import React, { createContext, useContext, useState, ReactNode } from 'react';
import { IChart } from './types';
import { chartSimple } from './misc/exampleChartState';

// Define the shape of the context state
interface AppState {
    chart: IChart;
    setChart: (chart: IChart) => void;
}

// Create the context with default value as undefined to enforce provider usage
const AppContext = createContext<AppState | undefined>(undefined);

// Create a custom hook to use the context
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useAppContext must be used within a AppProvider');
    return context;
};

// Define the AppProvider props
interface AppProviderProps {
  children: ReactNode;
}

// Create the provider component
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const [chart, setChart] = useState<IChart>(chartSimple);



    const handleSetChart = (newChart: IChart) => {
        setChart(newChart);
        console.log("Context setChart called with:", newChart);
    };

    return (
        <AppContext.Provider value={{ chart, setChart: handleSetChart }}>
            {children}
        </AppContext.Provider>
    );
};

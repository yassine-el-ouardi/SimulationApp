import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
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
        const savedState = localStorage.getItem('chartState');
        return savedState ? JSON.parse(savedState) : chartSimple;
    });

    useEffect(() => {
        localStorage.setItem('chartState', JSON.stringify(chartState));
    }, [chartState]);

    const memoizedSetChartState = useMemo(() => (newChart: IChart) => {
        setChartState(newChart);
        console.log("Context setChartState called with:", newChart);
    }, []);

    return (
        <AppContext.Provider value={{ chartState, setChartState: memoizedSetChartState }}>
            {children}
        </AppContext.Provider>
    );
};
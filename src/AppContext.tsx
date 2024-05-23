import React, { createContext, useContext, useState, ReactNode } from 'react';
import { IChart, ISelection } from './types';
import { chartSimple } from './misc/exampleChartState';

// Define the shape of the context state
interface AppState {
    chartState: IChart;
    setChartState: (chart: IChart) => void;
    selection: ISelection;
    setSelection: (selection: ISelection) => void;
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
    const [chartState, setChartState] = useState<IChart>(chartSimple);
    const [selection, setSelection] = useState<ISelection>({ selected: {}, hovered: {} });

    const handleSetChartState = (newChart: IChart) => {
        setChartState(newChart);
        console.log("Context setChartState called with:", newChart);
    };

    const handleSetSelection = (newSelection: ISelection) => {
        setSelection(newSelection);
        console.log("Context setSelection called with:", newSelection);
    };

    return (
        <AppContext.Provider value={{ chartState, setChartState: handleSetChartState, selection, setSelection: handleSetSelection }}>
            {children}
        </AppContext.Provider>
    );
};
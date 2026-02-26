import { create } from 'zustand';

export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1D' | '1W' | '1M';

export interface StockInfo {
    symbol: string;
    name: string;
    price: number;
    changePercent: number;
    volume: number;
}

export interface AIPrediction {
    targetPrice: number;
    confidence: number;
    trend: 'bullish' | 'bearish' | 'neutral';
    modelExplanation: string;
    probabilityOfIncrease: number;
    timeframe: string;
}

interface TerminalState {
    // Current Configuration
    selectedSymbol: string;
    selectedTimeframe: Timeframe;

    // Real-time Data
    currentStockData: StockInfo | null;
    predictionData: AIPrediction | null;

    // Watchlist
    watchlist: StockInfo[];

    // Actions
    setSymbol: (symbol: string) => void;
    setTimeframe: (tf: Timeframe) => void;
    updateStockData: (data: Partial<StockInfo>) => void;
    setPredictionData: (data: AIPrediction) => void;
    addToWatchlist: (stock: StockInfo) => void;
    removeFromWatchlist: (symbol: string) => void;
}

export const useTerminalStore = create<TerminalState>((set) => ({
    selectedSymbol: 'AAPL', // Default stock
    selectedTimeframe: '1D',

    currentStockData: {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        price: 173.50,
        changePercent: 1.25,
        volume: 54300000,
    },

    predictionData: null,

    watchlist: [
        { symbol: 'AAPL', name: 'Apple Inc.', price: 173.50, changePercent: 1.25, volume: 54300000 },
        { symbol: 'MSFT', name: 'Microsoft Corp.', price: 405.12, changePercent: -0.45, volume: 22100000 },
        { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 875.28, changePercent: 4.30, volume: 46100000 },
        { symbol: 'TSLA', name: 'Tesla Inc.', price: 175.34, changePercent: -2.10, volume: 102000000 },
    ],

    setSymbol: (symbol) => set({ selectedSymbol: symbol }),

    setTimeframe: (tf) => set({ selectedTimeframe: tf }),

    updateStockData: (data) => set((state) => ({
        currentStockData: state.currentStockData ? { ...state.currentStockData, ...data } : (data as StockInfo)
    })),

    setPredictionData: (data) => set({ predictionData: data }),

    addToWatchlist: (stock) => set((state) => ({
        // Prevent duplicates
        watchlist: state.watchlist.some(s => s.symbol === stock.symbol)
            ? state.watchlist
            : [...state.watchlist, stock]
    })),

    removeFromWatchlist: (symbol) => set((state) => ({
        watchlist: state.watchlist.filter(s => s.symbol !== symbol)
    })),
}));

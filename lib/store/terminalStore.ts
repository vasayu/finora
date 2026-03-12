import { create } from 'zustand';

export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1D' | '1W' | '1M';

export interface StockInfo {
    symbol: string;
    name: string;
    price: number;
    changePercent: number;
    volume: number;
}

export interface WatchlistItem {
    id: string;
    symbol: string;
    name: string;
    addedAt: string;
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

    // Watchlists (hydrated from API)
    watchlist: WatchlistItem[];
    orgWatchlist: WatchlistItem[];

    // Actions
    setSymbol: (symbol: string) => void;
    setTimeframe: (tf: Timeframe) => void;
    updateStockData: (data: Partial<StockInfo>) => void;
    setPredictionData: (data: AIPrediction) => void;
    setWatchlist: (items: WatchlistItem[]) => void;
    setOrgWatchlist: (items: WatchlistItem[]) => void;
    addToWatchlist: (item: WatchlistItem) => void;
    removeFromWatchlist: (symbol: string) => void;
    addToOrgWatchlist: (item: WatchlistItem) => void;
    removeFromOrgWatchlist: (symbol: string) => void;
}

export const useTerminalStore = create<TerminalState>((set) => ({
    selectedSymbol: 'RELIANCE',
    selectedTimeframe: '1D',

    currentStockData: {
        symbol: 'RELIANCE',
        name: 'Reliance Industries Ltd.',
        price: 2450.75,
        changePercent: 1.25,
        volume: 12500000,
    },

    predictionData: null,

    watchlist: [],
    orgWatchlist: [],

    setSymbol: (symbol) => set({ selectedSymbol: symbol }),

    setTimeframe: (tf) => set({ selectedTimeframe: tf }),

    updateStockData: (data) => set((state) => ({
        currentStockData: state.currentStockData ? { ...state.currentStockData, ...data } : (data as StockInfo)
    })),

    setPredictionData: (data) => set({ predictionData: data }),

    setWatchlist: (items) => set({ watchlist: items }),

    setOrgWatchlist: (items) => set({ orgWatchlist: items }),

    addToWatchlist: (item) => set((state) => ({
        watchlist: state.watchlist.some(s => s.symbol === item.symbol)
            ? state.watchlist
            : [item, ...state.watchlist]
    })),

    removeFromWatchlist: (symbol) => set((state) => ({
        watchlist: state.watchlist.filter(s => s.symbol !== symbol)
    })),

    addToOrgWatchlist: (item) => set((state) => ({
        orgWatchlist: state.orgWatchlist.some(s => s.symbol === item.symbol)
            ? state.orgWatchlist
            : [item, ...state.orgWatchlist]
    })),

    removeFromOrgWatchlist: (symbol) => set((state) => ({
        orgWatchlist: state.orgWatchlist.filter(s => s.symbol !== symbol)
    })),
}));

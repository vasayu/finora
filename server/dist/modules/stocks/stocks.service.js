"use strict";
// server/src/modules/stocks/stocks.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.stocksService = exports.StocksService = void 0;
const STOCK_LIST = [
    { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.' },
    { symbol: 'TCS', name: 'Tata Consultancy Services Ltd.' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.' },
    { symbol: 'INFY', name: 'Infosys Ltd.' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.' },
    { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd.' },
    { symbol: 'SBIN', name: 'State Bank of India' },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd.' },
    { symbol: 'ITC', name: 'ITC Ltd.' },
    { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd.' },
    { symbol: 'LT', name: 'Larsen & Toubro Ltd.' },
    { symbol: 'AXISBANK', name: 'Axis Bank Ltd.' },
    { symbol: 'WIPRO', name: 'Wipro Ltd.' },
    { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd.' },
    { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd.' },
    { symbol: 'HCLTECH', name: 'HCL Technologies Ltd.' },
    { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.' },
    { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Ind. Ltd.' },
    { symbol: 'TITAN', name: 'Titan Company Ltd.' },
    { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd.' },
    { symbol: 'NTPC', name: 'NTPC Ltd.' },
    { symbol: 'POWERGRID', name: 'Power Grid Corp. of India Ltd.' },
    { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd.' },
    { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd.' },
    { symbol: 'TATASTEEL', name: 'Tata Steel Ltd.' },
    { symbol: 'ONGC', name: 'Oil & Natural Gas Corp. Ltd.' },
    { symbol: 'TECHM', name: 'Tech Mahindra Ltd.' },
    { symbol: 'JSWSTEEL', name: 'JSW Steel Ltd.' },
    { symbol: 'INDUSINDBK', name: 'IndusInd Bank Ltd.' },
    { symbol: 'DRREDDY', name: 'Dr. Reddys Laboratories Ltd.' },
];
class StocksService {
    /**
     * Search stocks by symbol or name
     */
    searchStocks(query, limit = 10) {
        const q = query.toLowerCase();
        return STOCK_LIST.filter((s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)).slice(0, limit);
    }
    /**
     * Generates realistic mock historical data for candlestick charts
     */
    async getHistory(symbol, timeframe, limit = 100) {
        // Base prices for common Indian NSE symbols (in ₹)
        const basePrices = {
            'RELIANCE': 2450, 'TCS': 3850, 'HDFCBANK': 1620, 'INFY': 1580,
            'ICICIBANK': 1050, 'HINDUNILVR': 2520, 'SBIN': 780, 'BHARTIARTL': 1150,
            'ITC': 440, 'KOTAKBANK': 1780, 'LT': 3420, 'AXISBANK': 1100,
            'WIPRO': 480, 'BAJFINANCE': 6800, 'MARUTI': 10500, 'HCLTECH': 1450,
            'TATAMOTORS': 720, 'SUNPHARMA': 1680, 'TITAN': 3250, 'ADANIENT': 2900,
            'NTPC': 350, 'POWERGRID': 290, 'ULTRACEMCO': 10200, 'ASIANPAINT': 2850,
            'TATASTEEL': 145, 'ONGC': 260, 'TECHM': 1320, 'JSWSTEEL': 880,
            'INDUSINDBK': 1450, 'DRREDDY': 5800,
        };
        let currentPrice = basePrices[symbol] || 100;
        // Volatility based on timeframe
        let volatility = 0.02; // Default daily
        let msPerCandle = 24 * 60 * 60 * 1000;
        if (timeframe === '1m') {
            volatility = 0.001;
            msPerCandle = 60 * 1000;
        }
        if (timeframe === '5m') {
            volatility = 0.002;
            msPerCandle = 5 * 60 * 1000;
        }
        if (timeframe === '15m') {
            volatility = 0.003;
            msPerCandle = 15 * 60 * 1000;
        }
        if (timeframe === '1h') {
            volatility = 0.005;
            msPerCandle = 60 * 60 * 1000;
        }
        if (timeframe === '4h') {
            volatility = 0.01;
            msPerCandle = 4 * 60 * 60 * 1000;
        }
        if (timeframe === '1W') {
            volatility = 0.05;
            msPerCandle = 7 * 24 * 60 * 60 * 1000;
        }
        if (timeframe === '1M') {
            volatility = 0.1;
            msPerCandle = 30 * 24 * 60 * 60 * 1000;
        }
        const now = Date.now();
        // Round to nearest candle time
        const currentPeriodTime = now - (now % msPerCandle);
        const startTime = currentPeriodTime - (limit * msPerCandle);
        const data = [];
        // Simulate a random walk to generate historical candles
        for (let i = 0; i < limit; i++) {
            const time = (startTime + (i * msPerCandle)) / 1000; // Unix timestamp in seconds required by lightweight-charts
            // Random walk step
            const change = currentPrice * volatility * (Math.random() - 0.5) * 2;
            const open = currentPrice;
            const close = open + change;
            // High/low must encapsulate open/close with some noise
            const maxOC = Math.max(open, close);
            const minOC = Math.min(open, close);
            const high = maxOC + (Math.abs(change) * Math.random());
            const low = minOC - (Math.abs(change) * Math.random());
            // Volume 
            const volumeMultiplier = basePrices[symbol] ? 1000000 : 10000;
            const volume = Math.floor(Math.random() * volumeMultiplier * 10) + (volumeMultiplier * 2);
            data.push({ time, open, high, low, close, value: volume }); // Lightweight charts uses 'value' for histogram series
            currentPrice = close;
        }
        return data;
    }
    /**
     * Generates a mock AI prediction curve extending from the current price
     */
    async getPrediction(symbol, currentPrice, timeframe) {
        // Generate an algorithmic prediction
        const isBullish = Math.random() > 0.4; // Slightly bullish bias
        const trend = isBullish ? 'bullish' : (Math.random() > 0.8 ? 'neutral' : 'bearish');
        const confidence = Math.floor(Math.random() * 30) + 65; // 65-95%
        const probability = Math.floor(Math.random() * 20) + (isBullish ? 60 : 20);
        // Future target price
        const volatilityExpected = 0.05; // 5% move expected
        const direction = trend === 'bullish' ? 1 : (trend === 'bearish' ? -1 : 0);
        const targetMove = currentPrice * volatilityExpected * direction;
        const targetPrice = currentPrice + targetMove + (currentPrice * 0.01 * (Math.random() - 0.5));
        // Generate the step-by-step curve for the chart overlay (next 20 periods)
        let msPerCandle = 24 * 60 * 60 * 1000; // Default daily
        if (timeframe === '1h')
            msPerCandle = 60 * 60 * 1000;
        const now = Date.now();
        const currentPeriodTime = now - (now % msPerCandle);
        const curve = [];
        let pathPrice = currentPrice;
        const totalSteps = 20;
        const stepTarget = (targetPrice - currentPrice) / totalSteps;
        for (let i = 1; i <= totalSteps; i++) {
            // Add step forward + some noise
            const noise = (Math.random() - 0.5) * (targetPrice * 0.002);
            pathPrice = pathPrice + stepTarget + noise;
            curve.push({
                time: (currentPeriodTime + (i * msPerCandle)) / 1000,
                value: pathPrice
            });
        }
        // Generate upper and lower confidence bounds for the area series
        const bounds = curve.map(point => {
            // Bounds get wider further into the future
            const timeIndex = point.time - (currentPeriodTime / 1000);
            const stepsRatio = timeIndex / (msPerCandle / 1000) / totalSteps;
            const spreadAmount = point.value * 0.02 * stepsRatio * (1 - (confidence / 100));
            return {
                time: point.time,
                top: point.value + spreadAmount,
                bottom: point.value - spreadAmount
            };
        });
        const modelExplanation = trend === 'bullish'
            ? `Quantum LSTM ensemble detects strong accumulation phases mirroring Q3 2023 breakouts. RSI divergence neutralized on the ${timeframe} timeframe.`
            : trend === 'bearish'
                ? `Transformer attention heads identify institutional distribution. Volume profile indicates weak support at current levels down to ${Math.floor(targetPrice)}.`
                : `Models are conflicting. Time-series analysis shows consolidation while sentiment NLP algorithms detect upcoming volatility.`;
        return {
            prediction: {
                targetPrice: Number(targetPrice.toFixed(2)),
                confidence,
                trend,
                probabilityOfIncrease: probability,
                modelExplanation,
                timeframe: 'Next 20 periods'
            },
            curve,
            bounds
        };
    }
    /**
     * Generates real-time tick updates (mock socket replacement for REST polling)
     */
    async getRealtime(symbol, currentPrice) {
        const noise = currentPrice * 0.0005 * (Math.random() - 0.5); // 0.05% fluctuation
        const newPrice = currentPrice + noise;
        const time = Date.now() / 1000;
        return {
            time,
            price: Number(newPrice.toFixed(2)),
            volume: Math.floor(Math.random() * 500)
        };
    }
}
exports.StocksService = StocksService;
exports.stocksService = new StocksService();

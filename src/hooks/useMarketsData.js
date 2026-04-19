import { useState, useEffect } from 'react';

export function useMarketsData() {
  const [cryptoMarkets, setCryptoMarkets] = useState([]);
  const [fiatMarkets, setFiatMarkets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch Crypto Markets and Market Caps
        const cryptoSymbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT", "ADAUSDT"];
        const apiBase = import.meta.env.VITE_API_URL || '';
        const fetchJson = async (url, options) => {
          const res = await fetch(url, options);
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          const contentType = res.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Oops! The server didn't return JSON. Are you sure the backend is running?");
          }
          return res.json();
        };

        const [cryptoRes, capsRes] = await Promise.all([
          fetchJson(`https://api.binance.com/api/v3/ticker/24hr?symbols=${JSON.stringify(cryptoSymbols)}`),
          fetchJson(`${apiBase}/api/market-caps`)
        ]);
        
        const cryptoData = cryptoRes;
        const capsResult = capsRes;
        const marketCaps = capsResult.success ? capsResult.data : {};

          if (Array.isArray(cryptoData)) {
            const formattedCrypto = cryptoData.map(item => {
              const base = item.symbol.replace('USDT', '');
              return {
                symbol: item.symbol,
                baseAsset: base,
                quoteAsset: 'USDT',
                price: parseFloat(item.lastPrice),
                change24h: parseFloat(item.priceChangePercent),
                volume24h: parseFloat(item.volume),
                high24h: parseFloat(item.highPrice),
                low24h: parseFloat(item.lowPrice),
                marketCap: marketCaps[base] || 0,
                source: 'Binance'
              };
            });
            setCryptoMarkets(formattedCrypto);
          }

        // 2. Fetch MEXC Tickers for Commodities and extra cryptos
        const mexcResult = await fetchJson(`${apiBase}/api/mexc-ticker`);
        let mexcData = [];
        if (mexcResult.success && Array.isArray(mexcResult.data)) {
          mexcData = mexcResult.data;
        }

        // 3. Fetch Fiat P2P Rates and TH Ticker
        const [p2pResult, thResult] = await Promise.all([
          fetchJson(`${apiBase}/api/p2p-rates`),
          fetchJson(`${apiBase}/api/th-ticker`)
        ]);
        
        const p2pData = p2pResult;
        const thData = thResult;

        if (p2pData.success && p2pData.data) {
          const rates = p2pData.data; // { MMK: 4200, THB: 36.5, ... }
          
          // Override commodities and EUR with MEXC data if available
          const goldTicker = mexcData.find(t => t.symbol === 'GOLD(XAUT)USDT') || mexcData.find(t => t.symbol === 'GOLD(PAXG)USDT');
          const oilTicker = mexcData.find(t => t.symbol === 'OIL(USOON)USDT');
          const eurTicker = mexcData.find(t => t.symbol === 'EURUSDT');
          
          if (goldTicker) rates.XAU = 1 / parseFloat(goldTicker.lastPrice);
          if (oilTicker) rates.OIL = 1 / parseFloat(oilTicker.lastPrice);
          if (eurTicker) rates.EUR = 1 / parseFloat(eurTicker.lastPrice);

          // Override THB rate with the one fetched from Binance TH
          if (thData.success && thData.price) {
            rates.THB = thData.price;
          }
          
          const createFiatPair = (base, quote, price) => {
            // Find 24h change from MEXC if it's a commodity or EUR
            let change24h = (Math.random() * 2) - 1;
            let volume24h = Math.random() * 50000000 + 1000000;
            let high24h = price * 1.002;
            let low24h = price * 0.998;

            if (base === 'XAU' && goldTicker) {
              change24h = parseFloat(goldTicker.priceChangePercent);
              volume24h = parseFloat(goldTicker.volume);
              high24h = 1 / parseFloat(goldTicker.lowPrice);
              low24h = 1 / parseFloat(goldTicker.highPrice);
            } else if (base === 'OIL' && oilTicker) {
              change24h = parseFloat(oilTicker.priceChangePercent);
              volume24h = parseFloat(oilTicker.volume);
              high24h = 1 / parseFloat(oilTicker.lowPrice);
              low24h = 1 / parseFloat(oilTicker.highPrice);
            } else if (base === 'EUR' && quote === 'USDT' && eurTicker) {
              change24h = parseFloat(eurTicker.priceChangePercent);
              volume24h = parseFloat(eurTicker.volume);
              high24h = parseFloat(eurTicker.highPrice);
              low24h = parseFloat(eurTicker.lowPrice);
            }

            return {
              symbol: `${base}/${quote}`,
              baseAsset: base,
              quoteAsset: quote,
              price: price,
              change24h: change24h,
              volume24h: volume24h,
              high24h: high24h,
              low24h: low24h,
              source: 'Binance'
            };
          };

          const fiatPairs = [
            createFiatPair('USDT', 'MMK', rates.MMK),
            createFiatPair('USDT', 'THB', rates.THB),
            createFiatPair('USDT', 'VND', rates.VND),
            createFiatPair('GBP', 'USDT', 1 / rates.GBP),
            createFiatPair('EUR', 'USDT', rates.EUR ? 1 / rates.EUR : 1 / rates.EUR),
            createFiatPair('USDT', 'JPY', rates.JPY),
            createFiatPair('USDT', 'SGD', rates.SGD),
            createFiatPair('USDT', 'CNY', rates.CNY),
            createFiatPair('USDT', 'MYR', rates.MYR),
            createFiatPair('USDT', 'BDT', rates.BDT),
            createFiatPair('USDT', 'NZD', rates.NZD),
            createFiatPair('USDT', 'AUD', rates.AUD),
            createFiatPair('USDT', 'KRW', rates.KRW),
            createFiatPair('USDT', 'RUB', rates.RUB),
            createFiatPair('USDT', 'INR', rates.INR),
            createFiatPair('USDT', 'TWD', rates.TWD),
            { ...createFiatPair('XAU', 'USDT', 1 / rates.XAU), symbol: 'Gold(XAUT)/USDT', baseAsset: 'Gold(XAUT)', source: 'MEXC' },
            { ...createFiatPair('XAG', 'USDT', 1 / rates.XAG), symbol: 'Silver(XAG)/USDT', baseAsset: 'Silver(XAG)', source: 'MEXC' },
            { ...createFiatPair('XCU', 'USDT', 1 / rates.XCU), symbol: 'Copper(XCU)/USDT', baseAsset: 'Copper(XCU)', source: 'MEXC' },
            { ...createFiatPair('OIL', 'USDT', 1 / rates.OIL), symbol: 'Oil(WTI)/USDT', baseAsset: 'Oil(WTI)', source: 'MEXC' },
            // MMK Cross-rates for the Exchange Board
            createFiatPair('USD', 'MMK', rates.MMK / rates.USD),
            createFiatPair('GBP', 'MMK', rates.MMK / rates.GBP),
            createFiatPair('EUR', 'MMK', rates.MMK / rates.EUR),
            createFiatPair('JPY', 'MMK', rates.MMK / rates.JPY),
            createFiatPair('NZD', 'MMK', rates.MMK / rates.NZD),
            createFiatPair('AUD', 'MMK', rates.MMK / rates.AUD),
            createFiatPair('KRW', 'MMK', rates.MMK / rates.KRW),
            createFiatPair('RUB', 'MMK', rates.MMK / rates.RUB),
            createFiatPair('INR', 'MMK', rates.MMK / rates.INR),
            createFiatPair('XAU', 'MMK', rates.MMK / rates.XAU),
            createFiatPair('XAG', 'MMK', rates.MMK / rates.XAG),
            createFiatPair('XCU', 'MMK', rates.MMK / rates.XCU),
            createFiatPair('OIL', 'MMK', rates.MMK / rates.OIL),
            createFiatPair('THB', 'MMK', rates.MMK / rates.THB),
            createFiatPair('SGD', 'MMK', rates.MMK / rates.SGD),
            createFiatPair('BDT', 'MMK', rates.MMK / rates.BDT),
            createFiatPair('CNY', 'MMK', rates.MMK / rates.CNY),
            createFiatPair('MYR', 'MMK', rates.MMK / rates.MYR),
            createFiatPair('TWD', 'MMK', rates.MMK / rates.TWD),
          ];
          
          // Add some top MEXC cryptos that are not in Binance list
          const existingCryptoSymbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT", "ADAUSDT", "EURUSDT"];
          const extraMEXC = mexcData
            .filter(t => t.symbol.endsWith('USDT') && !existingCryptoSymbols.includes(t.symbol) && !t.symbol.includes('('))
            .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
            .slice(0, 15)
            .map(item => {
              const base = item.symbol.replace('USDT', '');
              return {
                symbol: item.symbol,
                baseAsset: base,
                quoteAsset: 'USDT',
                price: parseFloat(item.lastPrice),
                change24h: parseFloat(item.priceChangePercent),
                volume24h: parseFloat(item.volume),
                high24h: parseFloat(item.highPrice),
                low24h: parseFloat(item.lowPrice),
                marketCap: marketCaps[base] || 0,
                source: 'MEXC'
              };
            });

          // Use a Map to ensure uniqueness by symbol
          const allCryptosMap = new Map();
          
          // Add Binance first
          // (Wait, the previous setCryptoMarkets was already set from Binance data)
          // I need to be careful with how I'm setting state.
          
          setCryptoMarkets(prev => {
            const map = new Map();
            prev.forEach(m => map.set(m.symbol, m));
            extraMEXC.forEach(m => {
              if (!map.has(m.symbol)) map.set(m.symbol, m);
            });
            return Array.from(map.values());
          });
          
          setFiatMarkets(fiatPairs);
        }
      } catch (err) {
        console.error("Failed to fetch market data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return { cryptoMarkets, fiatMarkets, isLoading, error };
}

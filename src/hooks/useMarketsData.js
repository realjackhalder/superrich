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
        // 1. Fetch Crypto Markets
        const cryptoSymbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT", "ADAUSDT"];
        const cryptoRes = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${JSON.stringify(cryptoSymbols)}`);
        const cryptoData = await cryptoRes.json();

        const circulatingSupply = {
          BTC: 19700000,
          ETH: 120000000,
          BNB: 147000000,
          SOL: 460000000,
          XRP: 55000000000,
          ADA: 35000000000
        };

        if (Array.isArray(cryptoData)) {
          const formattedCrypto = cryptoData.map(item => ({
            symbol: item.symbol,
            baseAsset: item.symbol.replace('USDT', ''),
            quoteAsset: 'USDT',
            price: parseFloat(item.lastPrice),
            change24h: parseFloat(item.priceChangePercent),
            volume24h: parseFloat(item.volume),
            high24h: parseFloat(item.highPrice),
            low24h: parseFloat(item.lowPrice),
            marketCap: parseFloat(item.lastPrice) * (circulatingSupply[item.symbol.replace('USDT', '')] || 0),
          }));
          setCryptoMarkets(formattedCrypto);
        }

        // 2. Fetch Fiat P2P Rates and TH Ticker
        const [p2pRes, thRes] = await Promise.all([
          fetch('http://localhost:3001/api/p2p-rates'),
          fetch('http://localhost:3001/api/th-ticker')
        ]);
        
        const p2pData = await p2pRes.json();
        const thData = await thRes.json();

        if (p2pData.success && p2pData.data) {
          const rates = p2pData.data; // { MMK: 4200, THB: 36.5, VND: 25000 }
          
          // Override THB rate with the one fetched from Binance TH
          if (thData.success && thData.price) {
            rates.THB = thData.price;
          }
          
          // Calculate requested cross-rates
          // USDT/THB = rates.THB
          // USDT/VND = rates.VND
          // USDT/MMK = rates.MMK
          // THB/MMK = USDT/MMK / USDT/THB
          // THB/VND = USDT/VND / USDT/THB
          // VND/MMK = USDT/MMK / USDT/VND
          
          const createFiatPair = (base, quote, price) => {
            // Generate a slight 0.5% mock variance for high/low to match the table aesthetic
            const mockHigh = price * 1.002;
            const mockLow = price * 0.998;
            // Generate a fake volume (e.g., between 1M and 50M)
            const mockVolume = Math.random() * 50000000 + 1000000;
            const mockChange = (Math.random() * 2) - 1; // -1% to +1%
            
            return {
              symbol: `${base}/${quote}`,
              baseAsset: base,
              quoteAsset: quote,
              price: price,
              change24h: mockChange,
              volume24h: mockVolume,
              high24h: mockHigh,
              low24h: mockLow,
            };
          };

          const fiatPairs = [
            createFiatPair('USDT', 'MMK', rates.MMK),
            createFiatPair('USDT', 'THB', rates.THB),
            createFiatPair('USDT', 'VND', rates.VND),
            createFiatPair('GBP', 'USDT', 1 / rates.GBP),
            createFiatPair('EUR', 'USDT', 1 / rates.EUR),
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
            createFiatPair('XAU', 'USDT', 1 / rates.XAU),  // Gold per USDT
            createFiatPair('XAG', 'USDT', 1 / rates.XAG),  // Silver per USDT
            createFiatPair('XCU', 'USDT', 1 / rates.XCU),  // Copper per USDT
            createFiatPair('OIL', 'USDT', 1 / rates.OIL),  // Oil per USDT
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
          ];
          
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

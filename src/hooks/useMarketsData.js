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

        if (Array.isArray(cryptoData)) {
          const formattedCrypto = cryptoData.map(item => ({
            symbol: item.symbol,
            baseAsset: item.symbol.replace('USDT', ''),
            quoteAsset: 'USDT',
            price: parseFloat(item.lastPrice),
            change24h: parseFloat(item.priceChangePercent),
            volume24h: parseFloat(item.volume),
          }));
          setCryptoMarkets(formattedCrypto);
        }

        // 2. Fetch Fiat P2P Rates
        const p2pRes = await fetch('http://localhost:3001/api/p2p-rates');
        const p2pData = await p2pRes.json();

        if (p2pData.success && p2pData.data) {
          const rates = p2pData.data; // { MMK: 4200, THB: 36.5, VND: 25000 }
          
          // Calculate requested cross-rates
          // USDT/THB = rates.THB
          // USDT/VND = rates.VND
          // USDT/MMK = rates.MMK
          // THB/MMK = USDT/MMK / USDT/THB
          // THB/VND = USDT/VND / USDT/THB
          // VND/MMK = USDT/MMK / USDT/VND
          
          const fiatPairs = [
            {
              symbol: 'USDT/THB',
              baseAsset: 'USDT',
              quoteAsset: 'THB',
              price: rates.THB,
              change24h: null,
              volume24h: null,
            },
            {
              symbol: 'USDT/VND',
              baseAsset: 'USDT',
              quoteAsset: 'VND',
              price: rates.VND,
              change24h: null,
              volume24h: null,
            },
            {
              symbol: 'THB/MMK',
              baseAsset: 'THB',
              quoteAsset: 'MMK',
              price: rates.MMK / rates.THB,
              change24h: null,
              volume24h: null,
            },
            {
              symbol: 'THB/VND',
              baseAsset: 'THB',
              quoteAsset: 'VND',
              price: rates.VND / rates.THB,
              change24h: null,
              volume24h: null,
            },
            {
              symbol: 'VND/MMK',
              baseAsset: 'VND',
              quoteAsset: 'MMK',
              price: rates.MMK / rates.VND,
              change24h: null,
              volume24h: null,
            }
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
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  return { cryptoMarkets, fiatMarkets, isLoading, error };
}

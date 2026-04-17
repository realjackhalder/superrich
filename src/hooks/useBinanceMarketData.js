import { useState, useEffect, useRef } from 'react';

// For this example, we use USDT/BRL as the base and apply a dynamic multiplier to simulate MMK.

export function useBinanceMarketData(symbol = 'usdtbrl', interval = '1m') {
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceChange24h, setPriceChange24h] = useState(0);
  const [klines, setKlines] = useState([]);
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  const [isError, setIsError] = useState(false);
  
  const wsRef = useRef(null);
  const multiplierRef = useRef(900); // Default fallback

  useEffect(() => {
    let apiSymbol = symbol;
    const isFiat = symbol.includes('/');
    if (isFiat) apiSymbol = 'USDTBRL';

    // 1. Fetch live P2P rate and initial historical kline data via REST API
    const fetchHistoricalData = async () => {
      try {
        let targetRate = null;

        if (isFiat) {
          try {
            const p2pRes = await fetch('http://localhost:3001/api/p2p-rates');
            const p2pData = await p2pRes.json();
            if (p2pData.success && p2pData.data) {
              const r = p2pData.data;
              // Add THB rate properly via th-ticker if needed, or rely on p2p-rates fallback
              if (symbol === 'USDT/MMK') targetRate = r.MMK;
              else if (symbol === 'USDT/THB') {
                const th = await fetch('http://localhost:3001/api/th-ticker').then(res => res.json());
                targetRate = th.success && th.price ? th.price : r.THB;
              }
              else if (symbol === 'USDT/VND') targetRate = r.VND;
              else if (symbol === 'THB/MMK') targetRate = r.MMK / r.THB;
              else if (symbol === 'THB/VND') targetRate = r.VND / r.THB;
              else if (symbol === 'MMK/VND') targetRate = r.VND / r.MMK;
              else if (symbol === 'SGD/MMK') targetRate = r.MMK / r.SGD;
              else if (symbol === 'EUR/MMK') targetRate = r.MMK / r.EUR;
              else if (symbol === 'BDT/MMK') targetRate = r.MMK / r.BDT;
              else if (symbol === 'CNY/MMK') targetRate = r.MMK / r.CNY;
              else if (symbol === 'MYR/MMK') targetRate = r.MMK / r.MYR;
            }
          } catch (e) {
            console.warn("Failed to fetch P2P rates, using fallback shape.");
          }
        }

        const res = await fetch(`https://data-api.binance.vision/api/v3/klines?symbol=${apiSymbol.toUpperCase()}&interval=${interval}&limit=100`);
        const data = await res.json();
        
        let multiplier = 1;
        if (isFiat) {
          const latestBaseClose = parseFloat(data[data.length - 1][4]);
          multiplier = (targetRate || 4200) / latestBaseClose;
        }
        multiplierRef.current = multiplier;
        
        const formattedKlines = data.map(d => ({
          time: d[0] / 1000,
          open: parseFloat(d[1]) * multiplier,
          high: parseFloat(d[2]) * multiplier,
          low: parseFloat(d[3]) * multiplier,
          close: parseFloat(d[4]) * multiplier,
          volume: parseFloat(d[5]), // Volume is in base asset
        }));
        
        setKlines(formattedKlines);
        
        const lastClose = formattedKlines[formattedKlines.length - 1].close;
        const firstOpen = formattedKlines[0].open;
        setCurrentPrice(lastClose);
        setPriceChange24h(((lastClose - firstOpen) / firstOpen) * 100);
        
        generateSimulatedOrderBook(lastClose);
      } catch (err) {
        console.error("Failed to fetch historical data:", err);
        setIsError(true);
      }
    };

    fetchHistoricalData();

    // 2. Connect to Binance WebSocket for live kline updates
    const wsUrl = `wss://stream.binance.com:9443/ws/${apiSymbol.toLowerCase()}@kline_${interval}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.e === 'kline') {
        setIsError(false); // Clear error if WS connects successfully
        
        const k = message.k;
        const multiplier = multiplierRef.current;
        const newKline = {
          time: k.t / 1000,
          open: parseFloat(k.o) * multiplier,
          high: parseFloat(k.h) * multiplier,
          low: parseFloat(k.l) * multiplier,
          close: parseFloat(k.c) * multiplier,
          volume: parseFloat(k.v)
        };

        setCurrentPrice(newKline.close);
        
        setKlines(prev => {
          const updated = [...prev];
          if (updated.length > 0 && updated[updated.length - 1].time === newKline.time) {
            updated[updated.length - 1] = newKline; // Update current candle
          } else {
            updated.push(newKline); // Add new candle
            if (updated.length > 100) updated.shift();
          }
          return updated;
        });

        // Regenerate fake orderbook around new price
        generateSimulatedOrderBook(newKline.close);
      }
    };

    ws.onerror = () => {
      setIsError(true);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [symbol, interval]);

  // Helper to simulate order book data around the current price
  const generateSimulatedOrderBook = (basePrice) => {
    if (!basePrice) return;
    
    const bids = [];
    const asks = [];
    
    // Generate 10 levels of bids (lower than price) and asks (higher than price)
    for (let i = 1; i <= 15; i++) {
      const bidPrice = basePrice - (i * 1.5);
      const askPrice = basePrice + (i * 1.5);
      
      bids.push({
        price: bidPrice.toFixed(2),
        amount: (Math.random() * 5000 + 100).toFixed(2), // random volume
        total: 0
      });
      
      asks.push({
        price: askPrice.toFixed(2),
        amount: (Math.random() * 5000 + 100).toFixed(2),
        total: 0
      });
    }

    // Calculate totals
    let bidTotal = 0;
    bids.forEach(b => {
      bidTotal += parseFloat(b.amount);
      b.total = bidTotal.toFixed(2);
    });

    let askTotal = 0;
    asks.forEach(a => {
      askTotal += parseFloat(a.amount);
      a.total = askTotal.toFixed(2);
    });

    // Binance order book usually shows highest asks at top, lowest at bottom, bids highest at top
    // For rendering ease, we'll just pass sorted arrays. 
    // Asks: descending price. Bids: descending price.
    setOrderBook({
      asks: asks.sort((a, b) => b.price - a.price),
      bids: bids.sort((a, b) => b.price - a.price)
    });
  };

  return { currentPrice, priceChange24h, klines, orderBook, isError };
}

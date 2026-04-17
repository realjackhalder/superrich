import React, { useState, useEffect } from 'react';

export default function MarketTrades({ currentPrice }) {
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    if (!currentPrice) return;

    // Generate initial trades
    const initialTrades = Array.from({ length: 20 }).map((_, i) => ({
      price: currentPrice + (Math.random() - 0.5) * (currentPrice * 0.001),
      amount: Math.random() * 5000 + 10,
      time: new Date(Date.now() - i * 5000),
      isBuyer: Math.random() > 0.5,
    }));
    
    setTrades(initialTrades);

    // Simulate incoming trades
    const interval = setInterval(() => {
      const newTrade = {
        price: currentPrice + (Math.random() - 0.5) * (currentPrice * 0.001),
        amount: Math.random() * 5000 + 10,
        time: new Date(),
        isBuyer: Math.random() > 0.5,
      };

      setTrades(prev => [newTrade, ...prev].slice(0, 50));
    }, 2000);

    return () => clearInterval(interval);
  }, [currentPrice]);

  return (
    <div className="flex flex-col h-full bg-[#181A20] text-sm overflow-hidden">
      {/* Header */}
      <div className="flex space-x-4 p-2 border-b border-[#2B3139] text-xs font-medium">
        <button className="text-[#FCD535]">Market Trades</button>
        <button className="text-textMuted hover:text-textMain">My Trades</button>
      </div>

      {/* Table Headers */}
      <div className="flex justify-between px-3 py-1 text-xs text-textMuted border-b border-[#2B3139]">
        <span className="w-1/3">Price</span>
        <span className="w-1/3 text-right">Amount</span>
        <span className="w-1/3 text-right">Time</span>
      </div>

      {/* Trades List */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {trades.map((trade, index) => {
          const timeString = trade.time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
          
          return (
            <div key={index} className="flex justify-between items-center px-3 py-1 text-xs hover:bg-[#2B3139]/50 transition-colors">
              <span className={`w-1/3 font-medium ${trade.isBuyer ? 'text-emeraldGreen' : 'text-roseRed'}`}>
                {trade.price > 1000 ? trade.price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : trade.price.toFixed(2)}
              </span>
              <span className="w-1/3 text-right text-textMain">
                {trade.amount > 1000 ? (trade.amount / 1000).toFixed(2) + 'K' : trade.amount.toFixed(2)}
              </span>
              <span className="w-1/3 text-right text-textMuted">{timeString}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { ArrowDownUp, Info } from 'lucide-react';

export default function ExchangeCalculator({ currentPrice }) {
  const SPREAD_PERCENTAGE = 0.01; // 1% spread fee for exchange
  
  const [direction, setDirection] = useState('buy'); // 'buy' means spending MMK to get USDT, 'sell' means spending USDT to get MMK
  const [payAmount, setPayAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');

  // Rate calculations
  // If buying USDT: User pays MMK. Exchange rate is currentPrice * (1 + spread)
  // If selling USDT: User pays USDT. Exchange rate is currentPrice * (1 - spread)
  
  const getExchangeRate = () => {
    if (!currentPrice) return 0;
    return direction === 'buy' 
      ? currentPrice * (1 + SPREAD_PERCENTAGE) 
      : currentPrice * (1 - SPREAD_PERCENTAGE);
  };

  const handlePayChange = (e) => {
    const val = e.target.value;
    setPayAmount(val);
    if (!val || isNaN(val) || !currentPrice) {
      setReceiveAmount('');
      return;
    }

    const rate = getExchangeRate();
    if (direction === 'buy') {
      // Paying MMK, receiving USDT
      setReceiveAmount((parseFloat(val) / rate).toFixed(2));
    } else {
      // Paying USDT, receiving MMK
      setReceiveAmount((parseFloat(val) * rate).toFixed(2));
    }
  };

  const handleReceiveChange = (e) => {
    const val = e.target.value;
    setReceiveAmount(val);
    if (!val || isNaN(val) || !currentPrice) {
      setPayAmount('');
      return;
    }

    const rate = getExchangeRate();
    if (direction === 'buy') {
      // Receiving USDT, calculating MMK
      setPayAmount((parseFloat(val) * rate).toFixed(2));
    } else {
      // Receiving MMK, calculating USDT
      setPayAmount((parseFloat(val) / rate).toFixed(2));
    }
  };

  const toggleDirection = () => {
    setDirection(prev => prev === 'buy' ? 'sell' : 'buy');
    setPayAmount('');
    setReceiveAmount('');
  };

  // Recalculate if price changes
  useEffect(() => {
    if (payAmount && !isNaN(payAmount) && currentPrice) {
      const rate = getExchangeRate();
      if (direction === 'buy') {
        setReceiveAmount((parseFloat(payAmount) / rate).toFixed(2));
      } else {
        setReceiveAmount((parseFloat(payAmount) * rate).toFixed(2));
      }
    }
  }, [currentPrice]);

  return (
    <div className="bg-panel rounded-lg p-5 w-full h-full flex flex-col">
      <div className="flex space-x-4 mb-6">
        <button 
          onClick={() => { setDirection('buy'); setPayAmount(''); setReceiveAmount(''); }}
          className={`flex-1 py-2 text-center rounded font-medium transition-colors ${direction === 'buy' ? 'bg-emeraldGreen text-white' : 'bg-[#2B3139] text-textMuted hover:text-textMain'}`}
        >
          Buy USDT
        </button>
        <button 
          onClick={() => { setDirection('sell'); setPayAmount(''); setReceiveAmount(''); }}
          className={`flex-1 py-2 text-center rounded font-medium transition-colors ${direction === 'sell' ? 'bg-roseRed text-white' : 'bg-[#2B3139] text-textMuted hover:text-textMain'}`}
        >
          Sell USDT
        </button>
      </div>

      <div className="flex-1 space-y-4">
        {/* Pay Field */}
        <div>
          <label className="text-xs text-textMuted mb-1 block">You Pay</label>
          <div className="flex items-center bg-[#2B3139] rounded-md px-3 py-2 border border-transparent focus-within:border-emeraldGreen transition-colors">
            <input 
              type="text" 
              value={payAmount}
              onChange={handlePayChange}
              placeholder="0.00"
              className="bg-transparent text-textMain outline-none flex-1 font-medium text-lg min-w-0"
            />
            <span className="text-textMain font-medium ml-2">
              {direction === 'buy' ? 'MMK' : 'USDT'}
            </span>
          </div>
        </div>

        <div className="flex justify-center -my-2 relative z-10">
          <button 
            onClick={toggleDirection}
            className="bg-panel p-2 rounded-full border border-[#2B3139] hover:bg-[#2B3139] transition-colors"
          >
            <ArrowDownUp size={16} className="text-textMuted" />
          </button>
        </div>

        {/* Receive Field */}
        <div>
          <label className="text-xs text-textMuted mb-1 block">You Receive</label>
          <div className="flex items-center bg-[#2B3139] rounded-md px-3 py-2 border border-transparent focus-within:border-emeraldGreen transition-colors">
            <input 
              type="text" 
              value={receiveAmount}
              onChange={handleReceiveChange}
              placeholder="0.00"
              className="bg-transparent text-textMain outline-none flex-1 font-medium text-lg min-w-0"
            />
            <span className="text-textMain font-medium ml-2">
              {direction === 'buy' ? 'USDT' : 'MMK'}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Info */}
      <div className="mt-6 bg-[#2B3139]/50 rounded p-3 space-y-2 text-xs text-textMuted">
        <div className="flex justify-between">
          <span>Exchange Rate</span>
          <span className="text-textMain font-medium">
            1 USDT ≈ {getExchangeRate() ? getExchangeRate().toFixed(2) : '---'} MMK
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="flex items-center">Estimated Fee <Info size={12} className="ml-1" /></span>
          <span className="text-textMain">1.00%</span>
        </div>
      </div>

      <button className={`w-full mt-6 py-3 rounded-md font-bold text-white transition-opacity hover:opacity-90 ${direction === 'buy' ? 'bg-emeraldGreen' : 'bg-roseRed'}`}>
        {direction === 'buy' ? 'Buy USDT' : 'Sell USDT'}
      </button>
    </div>
  );
}

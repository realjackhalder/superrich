import React, { useState } from 'react';

export default function OrderBook({ currentPrice, orderBook }) {
  const { bids = [], asks = [] } = orderBook || {};
  const [viewMode, setViewMode] = useState('all'); // 'all', 'bids', 'asks'

  return (
    <div className="flex flex-col bg-panel rounded-lg w-full h-full min-h-[400px] overflow-hidden text-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#2B3139]">
        <h3 className="text-textMain font-medium">Order Book</h3>
        <div className="flex space-x-2 text-xs">
          <button 
            onClick={() => setViewMode('all')}
            className={`px-2 py-1 rounded transition-colors ${viewMode === 'all' ? 'bg-[#2B3139] text-textMain' : 'text-textMuted hover:text-textMain'}`}
          >
            All
          </button>
          <button 
            onClick={() => setViewMode('bids')}
            className={`px-2 py-1 rounded transition-colors ${viewMode === 'bids' ? 'bg-[#2B3139] text-emeraldGreen' : 'text-emeraldGreen hover:bg-[#2B3139]'}`}
          >
            Bids
          </button>
          <button 
            onClick={() => setViewMode('asks')}
            className={`px-2 py-1 rounded transition-colors ${viewMode === 'asks' ? 'bg-[#2B3139] text-roseRed' : 'text-roseRed hover:bg-[#2B3139]'}`}
          >
            Asks
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-2">
        {/* Table Header */}
        <div className="flex justify-between text-xs text-textMuted px-2 py-1">
          <div className="w-1/3 text-left">Price(MMK)</div>
          <div className="w-1/3 text-right">Amount(USDT)</div>
          <div className="w-1/3 text-right">Total</div>
        </div>

        {/* Asks (Sell Orders - Red) */}
        {(viewMode === 'all' || viewMode === 'asks') && (
          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col justify-end">
            {asks.slice(0, viewMode === 'all' ? 12 : 24).map((ask, i) => (
              <div key={`ask-${i}`} className="flex justify-between text-xs px-2 py-1 hover:bg-[#2B3139] cursor-pointer relative group">
                {/* Fake depth bar */}
                <div 
                  className="absolute right-0 top-0 h-full bg-roseRed/10 transition-all" 
                  style={{ width: `${Math.min(100, (ask.total / asks[asks.length-1]?.total) * 100)}%` }}
                ></div>
                <div className="w-1/3 text-left text-roseRed z-10">{ask.price}</div>
                <div className="w-1/3 text-right text-textMain z-10">{ask.amount}</div>
                <div className="w-1/3 text-right text-textMain z-10">{ask.total}</div>
              </div>
            ))}
          </div>
        )}

        {/* Current Price Display */}
        <div className="flex items-center space-x-2 py-2 px-2 my-1 border-y border-[#2B3139]">
          <span className="text-lg font-bold text-emeraldGreen">
            {currentPrice ? currentPrice.toFixed(2) : '---'}
          </span>
          <span className="text-xs text-textMuted">MMK</span>
        </div>

        {/* Bids (Buy Orders - Green) */}
        {(viewMode === 'all' || viewMode === 'bids') && (
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {bids.slice(0, viewMode === 'all' ? 12 : 24).map((bid, i) => (
              <div key={`bid-${i}`} className="flex justify-between text-xs px-2 py-1 hover:bg-[#2B3139] cursor-pointer relative group">
                <div 
                  className="absolute right-0 top-0 h-full bg-emeraldGreen/10 transition-all" 
                  style={{ width: `${Math.min(100, (bid.total / bids[bids.length-1]?.total) * 100)}%` }}
                ></div>
                <div className="w-1/3 text-left text-emeraldGreen z-10">{bid.price}</div>
                <div className="w-1/3 text-right text-textMain z-10">{bid.amount}</div>
                <div className="w-1/3 text-right text-textMain z-10">{bid.total}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

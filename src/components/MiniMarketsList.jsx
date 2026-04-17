import React, { useState } from 'react';
import { Search, Star } from 'lucide-react';
import { useMarketsData } from '../hooks/useMarketsData';

export default function MiniMarketsList({ selectedMarket, onSelectMarket }) {
  const { cryptoMarkets, fiatMarkets } = useMarketsData();
  const [activeTab, setActiveTab] = useState('THB');
  const [searchQuery, setSearchQuery] = useState('');

  const allMarkets = [...fiatMarkets, ...cryptoMarkets];

  // Filter based on tab and search
  const filteredMarkets = allMarkets.filter(m => {
    const matchesSearch = m.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    
    if (activeTab === 'Fiat') return m.symbol.includes('/');
    return m.quoteAsset === activeTab || m.baseAsset === activeTab;
  });

  return (
    <div className="flex flex-col h-full bg-[#181A20] text-sm overflow-hidden">
      {/* Header Tabs & Search */}
      <div className="p-2 border-b border-[#2B3139]">
        <div className="flex items-center bg-[#2B3139] rounded px-2 py-1 mb-2">
          <Search className="w-4 h-4 text-textMuted mr-2" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none text-xs text-textMain w-full placeholder-textMuted"
          />
        </div>
        <div className="flex space-x-3 text-xs font-medium text-textMuted overflow-x-auto no-scrollbar">
          <button className="hover:text-textMain"><Star className="w-3 h-3" /></button>
          {['THB', 'USDT', 'MMK', 'Fiat'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${activeTab === tab ? 'text-[#FCD535]' : 'hover:text-textMain'} whitespace-nowrap`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table Headers */}
      <div className="flex justify-between px-3 py-1 text-xs text-textMuted border-b border-[#2B3139]">
        <span className="w-1/3">Pair</span>
        <span className="w-1/3 text-right">Price</span>
        <span className="w-1/3 text-right">Change</span>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {filteredMarkets.map((item, index) => {
          const isPositive = item.change24h >= 0;
          const isSelected = selectedMarket === item.symbol;
          
          return (
            <div
              key={index}
              onClick={() => onSelectMarket && onSelectMarket(item.symbol)}
              className={`flex justify-between items-center px-3 py-1.5 cursor-pointer text-xs transition-colors ${
                isSelected ? 'bg-[#2B3139]' : 'hover:bg-[#2B3139]/50'
              }`}
            >
              <div className="w-1/3 flex items-center space-x-1">
                <Star className="w-3 h-3 text-textMuted hover:text-[#FCD535]" />
                <span className="font-bold text-textMain">{item.baseAsset}</span>
                <span className="text-[10px] text-textMuted">/{item.quoteAsset}</span>
              </div>
              <div className="w-1/3 text-right font-medium text-textMain">
                {item.price > 1000 ? item.price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : item.price.toFixed(2)}
              </div>
              <div className={`w-1/3 text-right font-medium ${isPositive ? 'text-emeraldGreen' : 'text-roseRed'}`}>
                {item.change24h !== null ? `${isPositive ? '+' : ''}${item.change24h.toFixed(2)}%` : '-'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

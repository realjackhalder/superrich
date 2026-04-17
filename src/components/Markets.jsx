import React, { useState, useEffect, useRef } from 'react';
import { Loader, Star, Search, ArrowRightLeft, X } from 'lucide-react';
import { useMarketsData } from '../hooks/useMarketsData';

export default function Markets({ onSelectMarket }) {
  const { cryptoMarkets, fiatMarkets, isLoading, error } = useMarketsData();
  const [activeTab, setActiveTab] = useState('All');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('superrich_favorites') || '[]');
    } catch { return []; }
  });
  const searchInputRef = useRef(null);

  // Persist favorites to localStorage
  useEffect(() => {
    localStorage.setItem('superrich_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Auto-focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const toggleFavorite = (symbol, e) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol) 
        : [...prev, symbol]
    );
  };

  if (isLoading && cryptoMarkets.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-textMuted flex-col space-y-4">
        <Loader className="w-12 h-12 animate-spin text-emeraldGreen" />
        <p>Loading market data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center text-roseRed flex-col space-y-4">
        <p>Failed to load markets: {error}</p>
      </div>
    );
  }

  // Format helpers
  const formatNumberWithSuffix = (num) => {
    if (num >= 1000000000000) return (num / 1000000000000).toFixed(2) + 'T';
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
    return num.toFixed(2);
  };

  const formatPrice = (price) => {
    if (price < 1) return price.toFixed(6);
    if (price > 1000) return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return price.toFixed(2);
  };

  // Base filtering: drop all MMK pairs except USDT/MMK for the list
  const cleanFiatMarkets = fiatMarkets.filter(m => {
    if (m.quoteAsset === 'MMK' && m.baseAsset !== 'USDT') return false;
    if (m.baseAsset === 'MMK' && m.quoteAsset !== 'USDT') return false;
    return true;
  });

  const allMarkets = [...cleanFiatMarkets, ...cryptoMarkets];
  
  let filteredData = allMarkets;

  // Tab filtering
  if (activeTab === 'Currency') {
    const commoditySymbols = ['XAU', 'XAG', 'XCU', 'OIL', 'Gold(XAUT)', 'Silver(XAG)', 'Copper(XCU)', 'Oil(WTI)'];
    filteredData = cleanFiatMarkets.filter(m => !commoditySymbols.includes(m.baseAsset));
  } else if (activeTab === 'Commodities') {
    const commoditySymbols = ['XAU', 'XAG', 'XCU', 'OIL', 'Gold(XAUT)', 'Silver(XAG)', 'Copper(XCU)', 'Oil(WTI)'];
    filteredData = cleanFiatMarkets.filter(m => commoditySymbols.includes(m.baseAsset));
  } else if (activeTab === 'Spot Markets') {
    filteredData = cryptoMarkets;
  } else if (activeTab === 'Hot') {
    filteredData = [...cryptoMarkets].sort((a, b) => b.change24h - a.change24h).slice(0, 10);
  } else if (activeTab === 'Favorites') {
    filteredData = allMarkets.filter(m => favorites.includes(m.symbol));
  }

  // Search filtering
  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    filteredData = filteredData.filter(m => 
      m.symbol.toLowerCase().includes(q) ||
      m.baseAsset.toLowerCase().includes(q) ||
      m.quoteAsset.toLowerCase().includes(q)
    );
  }

  return (
    <div className="flex-1 p-4 lg:p-8 overflow-y-auto w-full max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-textMain mb-6">Markets Overview</h1>
        
        {/* Main Tabs */}
        <div className="flex items-center justify-between border-b border-[#2B3139] mb-4 overflow-x-auto no-scrollbar pb-2">
          <div className="flex space-x-6 text-sm font-medium">
            {['All', 'Favorites', 'Currency', 'Commodities', 'Spot Markets', 'Hot'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap transition-colors pb-2 -mb-[9px] ${
                  activeTab === tab 
                    ? 'text-textMain border-b-2 border-[#FCD535]' 
                    : 'text-textMuted hover:text-textMain'
                }`}
              >
                {tab === 'Favorites' && <Star className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />}
                {tab}
              </button>
            ))}
          </div>

          {/* Search Toggle */}
          <div className="flex items-center ml-4">
            {searchOpen ? (
              <div className="flex items-center bg-[#2B3139] rounded-lg border border-[#474D57] overflow-hidden transition-all w-64">
                <Search className="w-4 h-4 text-[#848E9C] ml-3 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search pairs..."
                  className="bg-transparent text-white text-sm px-3 py-2 outline-none w-full placeholder:text-[#848E9C]"
                />
                <button 
                  onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                  className="text-[#848E9C] hover:text-white px-2 shrink-0 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setSearchOpen(true)}
                className="text-textMuted hover:text-textMain cursor-pointer transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-panel rounded-lg overflow-hidden border border-[#2B3139] w-full">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-textMuted bg-[#181A20] border-b border-[#2B3139]">
                <tr>
                  <th className="px-4 py-4 font-medium">Crypto</th>
                  <th className="px-4 py-4 font-medium text-right">Price</th>
                  <th className="px-4 py-4 font-medium text-right">24h Change</th>
                  <th className="px-4 py-4 font-medium text-right">24h High/24h Low</th>
                  <th className="px-4 py-4 font-medium text-right">24h Volume</th>
                  <th className="px-4 py-4 font-medium text-right">Market Cap</th>
                  <th className="px-4 py-4 font-medium text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B3139]">
                {filteredData.map((item, index) => {
                  const isPositive = item.change24h >= 0;
                  const formattedHigh = item.high24h ? formatPrice(item.high24h) : '-';
                  const formattedLow = item.low24h ? formatPrice(item.low24h) : '-';
                  const isFav = favorites.includes(item.symbol);

                  return (
                    <tr 
                      key={index} 
                      onClick={() => {
                        if (item.source === 'Binance') {
                          window.open('https://www.binance.com/register?ref=199653366', '_blank');
                        } else if (item.source === 'MEXC') {
                          window.open('https://www.mexc.com/acquisition/custom-sign-up?shareCode=mexc-3cu5N', '_blank');
                        }
                        onSelectMarket && onSelectMarket(item.symbol);
                      }}
                      className="hover:bg-[#2B3139]/50 transition-colors cursor-pointer group"
                    >
                      {/* Crypto / Pair */}
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-3">
                          <Star 
                            className={`w-4 h-4 transition-colors cursor-pointer shrink-0 ${
                              isFav 
                                ? 'text-[#FCD535] fill-[#FCD535]' 
                                : 'text-textMuted hover:text-[#FCD535]'
                            }`}
                            onClick={(e) => toggleFavorite(item.symbol, e)}
                          />
                          <div className="flex items-center">
                            <span className="font-bold text-textMain text-base">{item.baseAsset}</span>
                            <span className="text-textMuted text-xs ml-1">/{item.quoteAsset}</span>
                          </div>
                        </div>
                      </td>
                      
                      {/* Price */}
                      <td className="px-4 py-4 text-right">
                        <span className="font-medium text-textMain">{formatPrice(item.price)}</span>
                      </td>
                      
                      {/* 24h Change */}
                      <td className="px-4 py-4 text-right">
                        {item.change24h !== null ? (
                          <span className={`font-medium ${isPositive ? 'text-emeraldGreen' : 'text-roseRed'}`}>
                            {isPositive ? '+' : ''}{item.change24h.toFixed(2)}%
                          </span>
                        ) : (
                          <span className="text-textMuted">-</span>
                        )}
                      </td>
                      
                      {/* 24h High/Low */}
                      <td className="px-4 py-4 text-right text-textMain">
                        {formattedHigh} / {formattedLow}
                      </td>
                      
                      {/* 24h Volume */}
                      <td className="px-4 py-4 text-right text-textMain">
                        {item.volume24h !== null ? formatNumberWithSuffix(item.volume24h) : '-'}
                      </td>
                      
                      {/* Market Cap */}
                      <td className="px-4 py-4 text-right text-textMain">
                        {item.marketCap ? '$' + formatNumberWithSuffix(item.marketCap) : '-'}
                      </td>
                      
                      {/* Action */}
                      <td className="px-4 py-4 text-center">
                        <div className="flex justify-center text-textMuted group-hover:text-[#FCD535] transition-colors">
                          <ArrowRightLeft className="w-4 h-4" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {filteredData.length === 0 && (
              <div className="w-full py-12 text-center text-textMuted">
                {activeTab === 'Favorites' 
                  ? 'No favorites yet. Click the ★ icon on any pair to add it.' 
                  : searchQuery 
                    ? `No results for "${searchQuery}"` 
                    : 'No markets found matching the selected criteria.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

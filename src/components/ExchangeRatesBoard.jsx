import React, { useState, useEffect } from 'react';
import { RefreshCw, Printer, Calendar } from 'lucide-react';
import { useMarketsData } from '../hooks/useMarketsData';

export default function ExchangeRatesBoard() {
  const { fiatMarkets, isLoading } = useMarketsData();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Converter State
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [amount, setAmount] = useState('');
  const [isBuying, setIsBuying] = useState(true);

  // Update clock every second for Myanmar Standard Time (UTC+6:30)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getMyanmarTime = (date) => {
    // MST is UTC + 6 hours and 30 minutes
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    const mst = new Date(utc + (3600000 * 6.5));
    
    return {
      dateStr: mst.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
      timeStr: mst.toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
  };

  const { dateStr, timeStr } = getMyanmarTime(currentTime);

  const flagMap = {
    USD: 'us', GBP: 'gb', EUR: 'eu', JPY: 'jp', SGD: 'sg', 
    THB: 'th', VND: 'vn', BDT: 'bd', CNY: 'cn', MYR: 'my',
    NZD: 'nz', AUD: 'au', KRW: 'kr', RUB: 'ru', INR: 'in'
  };

  const metalEmojis = {
    XAU: '🥇', // Gold
    XAG: '🥈', // Silver
    XCU: '🥉', // Copper
    OIL: '🛢️', // Oil
  };

  const displayCurrencies = ['USD', 'GBP', 'EUR', 'JPY', 'SGD', 'THB', 'CNY', 'MYR', 'BDT', 'VND', 'NZD', 'AUD', 'KRW', 'RUB', 'INR', 'XAU', 'XAG', 'XCU', 'OIL'];

  // Filter and map fiat markets to get Buying/Selling rates
  const rateData = displayCurrencies.map(cur => {
    // Find the pair like USD/MMK
    const pair = fiatMarkets.find(m => m.symbol === `${cur}/MMK`);
    const basePrice = pair ? pair.price : 0;
    
    // Simulate a spread: Buy rate is slightly lower than mid, Sell is slightly higher
    const buyingRate = basePrice * 0.995;
    const sellingRate = basePrice * 1.005;

    return {
      currency: cur,
      flagCode: flagMap[cur],
      buyingRate,
      sellingRate,
      basePrice
    };
  }).filter(r => r.basePrice > 0);

  // Converter Logic
  const activeRateObj = rateData.find(r => r.currency === selectedCurrency);
  const activeRate = activeRateObj ? (isBuying ? activeRateObj.buyingRate : activeRateObj.sellingRate) : 0;
  
  // If Buying: Foreign to MMK (User sells foreign to shop, shop buys)
  // If Selling: MMK to Foreign (User buys foreign from shop, shop sells)
  const numAmount = parseFloat(amount) || 0;
  const convertedAmount = isBuying ? (numAmount * activeRate) : (numAmount / activeRate);

  return (
    <div className="flex-1 bg-[#0B0E11] text-[#EAECEF] flex flex-col font-sans overflow-y-auto">
      {/* Top Banner - Currency Converter */}
      <div className="bg-gradient-to-r from-[#181A20] to-[#2B3139] px-8 py-6 shadow-md border-b border-[#2B3139]">
        <h2 className="text-sm font-bold tracking-wider mb-6 flex items-center text-white">
          <span className="bg-[#FCD535] text-black px-1.5 py-0.5 rounded mr-2">&gt;</span>
          CURRENCY CONVERTER
        </h2>
        
        <div className="flex flex-wrap items-center gap-4">
          <select 
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="bg-[#2B3139] text-white px-4 py-2.5 rounded border border-[#474D57] shadow-sm outline-none w-48 hover:border-[#FCD535] transition-colors"
          >
            {rateData.map(r => (
              <option key={r.currency} value={r.currency}>{r.currency}</option>
            ))}
          </select>

          <div className="flex bg-[#181A20] rounded border border-[#474D57] overflow-hidden ml-4">
            <button 
              onClick={() => setIsBuying(true)}
              className={`px-6 py-2.5 text-sm font-medium transition-colors ${isBuying ? 'bg-[#FCD535] text-black' : 'bg-transparent text-[#848E9C] hover:text-white'}`}
            >
              <div className="font-bold">Buying Rate</div>
              <div className="text-xs opacity-80 mt-1">Foreign Currencies<br/>to MMK</div>
            </button>
            <button 
              onClick={() => setIsBuying(false)}
              className={`px-6 py-2.5 text-sm font-medium border-l border-[#474D57] transition-colors ${!isBuying ? 'bg-[#FCD535] text-black' : 'bg-transparent text-[#848E9C] hover:text-white'}`}
            >
              <div className="font-bold">Selling Rate</div>
              <div className="text-xs opacity-80 mt-1">MMK<br/>to Foreign Currencies</div>
            </button>
          </div>

          <div className="flex items-center space-x-4 ml-auto">
            <div className="flex bg-[#2B3139] border border-[#474D57] text-white rounded shadow-sm overflow-hidden w-64 items-center focus-within:border-[#FCD535] transition-colors">
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2.5 outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                placeholder="0"
              />
              <span className="px-4 font-bold text-[#848E9C]">{isBuying ? selectedCurrency : 'MMK'}</span>
            </div>
            <span className="font-bold text-xl text-[#FCD535]">=</span>
            <div className="font-bold text-xl w-48 text-[#FCD535]">
              {convertedAmount > 0 ? convertedAmount.toLocaleString(undefined, { maximumFractionDigits: 2 }) : 0} {isBuying ? 'MMK' : selectedCurrency}
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="max-w-6xl mx-auto w-full px-4 py-8">
        
        {/* Info Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#2B3139]">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-[#2B3139] rounded flex items-center justify-center text-[#FCD535]">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            </div>
            <div className="text-sm font-medium text-[#FCD535] tracking-widest uppercase">
              Live Exchange Rates
            </div>
          </div>
          <div className="flex items-center space-x-6 text-sm font-medium text-[#848E9C]">
            <span>Date: <span className="text-white">{dateStr}</span></span>
            <span>Time: <span className="text-white">{timeStr}</span></span>
            <button className="flex items-center text-[#FCD535] hover:opacity-80 transition-opacity">
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
            </button>
          </div>
        </div>



        {/* The Rates Table */}
        <div className="bg-[#181A20] border border-[#2B3139] rounded-lg shadow-xl overflow-hidden">
          <table className="w-full text-center">
            <thead className="bg-[#2B3139] text-[#848E9C] text-xs uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6 text-left font-bold w-1/3">Asset</th>
                <th className="py-4 px-6 font-bold w-1/3">Buying Rate (MMK)</th>
                <th className="py-4 px-6 font-bold w-1/3">Selling Rate (MMK)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B3139]">
              {isLoading ? (
                <tr><td colSpan="3" className="py-12 text-[#848E9C]">Loading live rates...</td></tr>
              ) : rateData.length === 0 ? (
                <tr><td colSpan="3" className="py-12 text-[#848E9C]">No rates available.</td></tr>
              ) : (
                rateData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#2B3139]/50 transition-colors">
                    <td className="py-4 px-6 text-left">
                      <div className="flex items-center space-x-4">
                        {metalEmojis[row.currency] ? (
                          <div className="w-8 h-8 flex items-center justify-center text-2xl bg-[#2B3139] rounded-full">
                            {metalEmojis[row.currency]}
                          </div>
                        ) : (
                          <img 
                            src={`https://flagcdn.com/w40/${row.flagCode}.png`} 
                            alt={row.currency}
                            className="w-8 shadow-sm rounded-sm"
                          />
                        )}
                        <div className="font-bold text-white text-lg">
                          {row.currency === 'XAU' ? 'GOLD' : row.currency === 'XAG' ? 'SILVER' : row.currency === 'XCU' ? 'COPPER' : row.currency}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-[#0ECB81] text-xl">
                        {row.buyingRate < 10 ? row.buyingRate.toFixed(4) : row.buyingRate.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-[#F6465D] text-xl">
                        {row.sellingRate < 10 ? row.sellingRate.toFixed(4) : row.sellingRate.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

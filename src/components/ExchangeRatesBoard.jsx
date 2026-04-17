import React, { useState, useEffect } from 'react';
import { RefreshCw, Printer, Calendar } from 'lucide-react';
import { useMarketsData } from '../hooks/useMarketsData';

export default function ExchangeRatesBoard() {
  const { fiatMarkets, isLoading, error } = useMarketsData();
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
      <div className="bg-gradient-to-r from-[#181A20] to-[#2B3139] px-4 sm:px-8 py-4 sm:py-6 shadow-md border-b border-[#2B3139]">
        <h2 className="text-xs sm:text-sm font-bold tracking-wider mb-4 sm:mb-6 flex items-center text-white">
          <span className="bg-[#FCD535] text-black px-1.5 py-0.5 rounded mr-2">&gt;</span>
          CURRENCY CONVERTER
        </h2>

        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="bg-[#2B3139] text-white px-4 py-2.5 rounded border border-[#474D57] shadow-sm outline-none w-full sm:w-48 hover:border-[#FCD535] transition-colors"
            >
              {rateData.map(r => (
                <option key={r.currency} value={r.currency}>{r.currency}</option>
              ))}
            </select>

            <div className="flex bg-[#181A20] rounded border border-[#474D57] overflow-hidden w-full sm:w-auto">
              <button
                onClick={() => setIsBuying(true)}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-medium transition-colors ${isBuying ? 'bg-[#FCD535] text-black' : 'bg-transparent text-[#848E9C] hover:text-white'}`}
              >
                <div className="font-bold">Buying</div>
                <div className="text-[10px] opacity-80 mt-0.5 leading-tight">Foreign to MMK</div>
              </button>
              <button
                onClick={() => setIsBuying(false)}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-medium border-l border-[#474D57] transition-colors ${!isBuying ? 'bg-[#FCD535] text-black' : 'bg-transparent text-[#848E9C] hover:text-white'}`}
              >
                <div className="font-bold">Selling</div>
                <div className="text-[10px] opacity-80 mt-0.5 leading-tight">MMK to Foreign</div>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:ml-auto w-full lg:w-auto">
            <div className="flex bg-[#2B3139] border border-[#474D57] text-white rounded shadow-sm overflow-hidden w-full sm:w-64 items-center focus-within:border-[#FCD535] transition-colors">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2.5 outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="0"
              />
              <span className="px-4 font-bold text-[#848E9C]">{isBuying ? selectedCurrency : 'MMK'}</span>
            </div>
            <span className="hidden sm:inline font-bold text-xl text-[#FCD535]">=</span>
            <div className="font-bold text-lg sm:text-xl text-[#FCD535] bg-[#181A20] sm:bg-transparent px-4 sm:px-0 py-2 sm:py-0 rounded sm:rounded-none w-full sm:w-auto text-center sm:text-left">
              <span className="sm:hidden text-xs text-textMuted mr-2 font-normal uppercase">Result:</span>
              {convertedAmount > 0 ? convertedAmount.toLocaleString(undefined, { maximumFractionDigits: 2 }) : 0} {isBuying ? 'MMK' : selectedCurrency}
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="max-w-6xl mx-auto w-full px-2 sm:px-4 py-4 sm:py-8">

        {/* Info Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-[#2B3139] gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#2B3139] rounded flex items-center justify-center text-[#FCD535]">
              <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            </div>
            <div className="text-xs sm:text-sm font-medium text-[#FCD535] tracking-widest uppercase">
              Live Exchange Rates
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#848E9C]">
            <div className="flex space-x-4">
              <span>Date: <span className="text-white">{dateStr}</span></span>
              <span>Time: <span className="text-white">{timeStr}</span></span>
            </div>
            <button className="flex items-center text-[#FCD535] hover:opacity-80 transition-opacity">
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
            </button>
          </div>
        </div>



        {/* The Rates Table */}
        <div className="bg-[#181A20] border border-[#2B3139] rounded-lg shadow-xl overflow-hidden">
          <table className="w-full text-center">
            <thead className="bg-[#2B3139] text-[#848E9C] text-[10px] sm:text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 sm:py-4 px-2 sm:px-6 text-left font-bold w-1/3">Asset</th>
                <th className="py-3 sm:py-4 px-2 sm:px-6 font-bold w-1/3">Buying Rate (MMK)</th>
                <th className="py-3 sm:py-4 px-2 sm:px-6 font-bold w-1/3">Selling Rate (MMK)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B3139]">
              {isLoading ? (
                <tr><td colSpan="3" className="py-12 text-[#848E9C]">Loading live rates...</td></tr>
              ) : error ? (
                <tr><td colSpan="3" className="py-12 text-roseRed px-4">{error}</td></tr>
              ) : rateData.length === 0 ? (
                <tr><td colSpan="3" className="py-12 text-[#848E9C]">No rates available.</td></tr>
              ) : (
                rateData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#2B3139]/50 transition-colors">
                    <td className="py-3 sm:py-4 px-2 sm:px-6 text-left">
                      <div className="flex items-center space-x-2 sm:space-x-4">
                        {metalEmojis[row.currency] ? (
                          <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xl sm:text-2xl bg-[#2B3139] rounded-full shrink-0">
                            {metalEmojis[row.currency]}
                          </div>
                        ) : (
                          <img
                            src={`https://flagcdn.com/w40/${row.flagCode}.png`}
                            alt={row.currency}
                            className="w-6 sm:w-8 shadow-sm rounded-sm shrink-0"
                          />
                        )}
                        <div className="font-bold text-white text-sm sm:text-lg truncate">
                          {row.currency === 'XAU' ? 'GOLD' : row.currency === 'XAG' ? 'SILVER' : row.currency === 'XCU' ? 'COPPER' : row.currency}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 sm:py-4 px-2 sm:px-6">
                      <span className="font-bold text-[#0ECB81] text-base sm:text-xl">
                        {row.buyingRate < 10 ? row.buyingRate.toFixed(4) : row.buyingRate.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 sm:py-4 px-2 sm:px-6">
                      <span className="font-bold text-[#F6465D] text-base sm:text-xl">
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

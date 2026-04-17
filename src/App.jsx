import React, { useState } from 'react';
import { Shield, Menu, User, Wallet, Bell, Loader } from 'lucide-react';
import ChartWidget from './components/ChartWidget';
import OrderBook from './components/OrderBook';
import ExchangeCalculator from './components/ExchangeCalculator';
import Markets from './components/Markets';
import ExchangeRatesBoard from './components/ExchangeRatesBoard';
import MiniMarketsList from './components/MiniMarketsList';
import MarketTrades from './components/MarketTrades';
import { useBinanceMarketData } from './hooks/useBinanceMarketData';
import { useBinanceAccount } from './hooks/useBinanceAccount';
import { SpeedInsights } from "@vercel/speed-insights/react"

function App() {
  const [chartInterval, setChartInterval] = useState('1m');
  const [selectedMarket, setSelectedMarket] = useState('USDT/MMK');
  const { currentPrice, priceChange24h, klines, orderBook, isError } = useBinanceMarketData(selectedMarket, chartInterval);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('Exchange Rates');
  const { balances, isLoading: isLoadingBalance } = useBinanceAccount(isLoggedIn);

  const isPriceUp = priceChange24h >= 0;

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Navbar */}
      <header className="h-16 flex items-center justify-between px-4 lg:px-6 bg-[#181A20] border-b border-[#2B3139]">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 text-[#FCD535] font-bold text-xl tracking-tight">
            <Shield className="w-8 h-8" />
            <span>SuperRich</span>
          </div>
          <nav className="hidden md:flex space-x-4 text-sm font-medium text-textMuted">
            {['Exchange Rates', 'Markets', 'Wallet'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`transition-colors ${activeTab === tab ? 'text-textMain font-bold' : 'hover:text-textMain'}`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center space-x-4 text-textMuted">
          <div className="hidden md:flex items-center space-x-3 text-sm">
            {isLoggedIn ? (
              <>
                <button className="bg-[#2B3139] hover:bg-[#2B3139]/80 text-textMain px-3 py-1.5 rounded font-medium transition-colors">
                  Deposit
                </button>
                <div className="flex items-center space-x-2 text-textMain px-2">
                  <Wallet className="w-4 h-4 text-emeraldGreen" />
                  <span className="font-medium">
                    {isLoadingBalance ? <Loader className="w-3 h-3 animate-spin inline" /> : `${parseFloat(balances.USDT).toFixed(2)} USDT`}
                  </span>
                </div>
                <div className="relative group cursor-pointer ml-2">
                  <div className="bg-[#2B3139] p-1.5 rounded-full hover:bg-gray-700 transition-colors">
                    <User className="w-5 h-5 text-textMain" />
                  </div>
                  <div className="absolute right-0 top-full mt-2 w-32 bg-panel border border-[#2B3139] rounded shadow-lg hidden group-hover:block z-50">
                    <button 
                      onClick={() => setIsLoggedIn(false)}
                      className="w-full text-left px-4 py-2 text-roseRed hover:bg-[#2B3139] transition-colors rounded"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
          <Menu className="w-6 h-6 md:hidden hover:text-textMain cursor-pointer" />
        </div>
      </header>

      {/* Main Content Area */}
      {activeTab === 'Exchange Rates' ? (
        <ExchangeRatesBoard />
      ) : activeTab === 'Markets' ? (
        <Markets onSelectMarket={(symbol) => {
          setSelectedMarket(symbol);
          setActiveTab('Exchange Rates');
        }} />
      ) : activeTab === 'Legacy Exchange' ? (
        <>
          {/* Ticker Bar */}
          <div className="h-16 flex items-center px-4 lg:px-6 bg-[#181A20] border-b border-[#2B3139] space-x-8 overflow-x-auto no-scrollbar">
            <div className="flex flex-col min-w-[120px]">
              <h1 className="text-xl font-bold text-textMain flex items-center">
                {selectedMarket}
              </h1>
              <a href="#" className="text-xs text-emeraldGreen underline underline-offset-2">Superrich Rate</a>
            </div>

            <div className="flex flex-col">
              <span className="text-xs text-textMuted">Price</span>
              <span className={`text-sm font-bold ${isPriceUp ? 'text-emeraldGreen' : 'text-roseRed'}`}>
                {currentPrice ? currentPrice.toFixed(2) : <Loader className="w-4 h-4 animate-spin text-textMuted inline" />}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-xs text-textMuted">24h Change</span>
              <span className={`text-sm font-medium ${isPriceUp ? 'text-emeraldGreen' : 'text-roseRed'}`}>
                {isPriceUp ? '+' : ''}{priceChange24h.toFixed(2)}%
              </span>
            </div>

            <div className="flex flex-col hidden sm:flex">
              <span className="text-xs text-textMuted">24h High</span>
              <span className="text-sm font-medium text-textMain">
                {klines.length > 0 ? Math.max(...klines.map(k => k.high)).toFixed(2) : '---'}
              </span>
            </div>

            <div className="flex flex-col hidden sm:flex">
              <span className="text-xs text-textMuted">24h Low</span>
              <span className="text-sm font-medium text-textMain">
                {klines.length > 0 ? Math.min(...klines.map(k => k.low)).toFixed(2) : '---'}
              </span>
            </div>
          </div>
          
          <main className="flex-1 p-1 lg:p-2 grid grid-cols-1 lg:grid-cols-12 gap-1 lg:gap-2 h-[calc(100vh-128px)] overflow-hidden bg-[#0B0E11]">

            {/* Left Column: Order Book */}
            <div className="lg:col-span-3 xl:col-span-2 flex flex-col order-3 lg:order-1 bg-[#181A20] rounded border border-[#2B3139] overflow-hidden">
              <OrderBook currentPrice={currentPrice} orderBook={orderBook} />
            </div>

            {/* Center Column: Chart + Calc */}
            <div className="lg:col-span-6 xl:col-span-7 flex flex-col gap-1 lg:gap-2 order-1 lg:order-2">
              <div className="flex-[3] bg-[#181A20] rounded border border-[#2B3139] overflow-hidden min-h-[400px]">
                {isError ? (
                  <div className="w-full h-full flex items-center justify-center text-roseRed">
                    Failed to connect to market data stream.
                  </div>
                ) : (
                  <ChartWidget data={klines} interval={chartInterval} onIntervalChange={setChartInterval} />
                )}
              </div>
              <div className="flex-[1] bg-[#181A20] rounded border border-[#2B3139] overflow-hidden min-h-[250px]">
                <ExchangeCalculator currentPrice={currentPrice} />
              </div>
            </div>

            {/* Right Column: Mini Markets + Trades */}
            <div className="lg:col-span-3 xl:col-span-3 flex flex-col gap-1 lg:gap-2 order-2 lg:order-3">
              <div className="flex-[1] bg-[#181A20] rounded border border-[#2B3139] overflow-hidden min-h-[250px]">
                <MiniMarketsList selectedMarket={selectedMarket} onSelectMarket={setSelectedMarket} />
              </div>
              <div className="flex-[1] bg-[#181A20] rounded border border-[#2B3139] overflow-hidden min-h-[250px]">
                <MarketTrades currentPrice={currentPrice} />
              </div>
            </div>

          </main>
        </>
      ) : (
        <main className="flex-1 flex items-center justify-center text-textMuted flex-col space-y-6 bg-[#0B0E11]">
          <div className="relative">
            <div className="absolute inset-0 bg-[#FCD535] opacity-20 blur-3xl rounded-full"></div>
            <Shield className="w-24 h-24 relative z-10 text-[#FCD535] opacity-80" />
          </div>
          <div className="text-center space-y-2 relative z-10">
            <h2 className="text-4xl font-bold text-textMain tracking-tight">
              {activeTab} Feature <span className="text-[#FCD535]">Coming Soon</span>
            </h2>
            <p className="text-lg text-textMuted max-w-md mx-auto">
              We're currently building a secure and seamless {activeTab.toLowerCase()} experience. Stay tuned for updates!
            </p>
          </div>
          <button 
            onClick={() => setActiveTab('Exchange Rates')}
            className="bg-[#2B3139] hover:bg-[#363C44] text-textMain px-6 py-2 rounded-lg font-medium transition-all border border-[#474D57] relative z-10"
          >
            Back to Dashboard
          </button>
        </main>
      )}
      <SpeedInsights />
    </div>
  );
}

export default App;

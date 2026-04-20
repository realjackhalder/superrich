import React, { useState } from 'react';
import { Shield, Menu, User, Wallet, Bell, Loader, Copy, Check, Facebook } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPriceUp = priceChange24h >= 0;

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Zoom Modal */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out transition-all duration-300"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-sm w-full">
            <img 
              src={zoomedImage} 
              alt="Zoomed Payment QR" 
              className="w-full h-auto object-contain rounded-xl shadow-[0_0_50px_rgba(252,213,53,0.2)] border border-[#FCD535]/20 bg-white"
            />
            <p className="text-center mt-4 text-[#FCD535] font-bold tracking-widest uppercase text-xs animate-pulse">
              Click anywhere to close
            </p>
          </div>
        </div>
      )}
      {/* Navbar */}
      <header className="h-16 flex items-center justify-between px-4 lg:px-6 bg-[#181A20] border-b border-[#2B3139]">
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => setActiveTab('Exchange Rates')}
            className="flex items-center space-x-2 text-[#FCD535] font-bold text-xl tracking-tight hover:opacity-80 transition-opacity"
          >
            <Shield className="w-8 h-8" />
            <span>SuperRich</span>
          </button>
          <nav className="flex space-x-3 sm:space-x-6 text-xs sm:text-sm font-medium text-textMuted">
            {['Exchange Rates', 'Markets', 'Wallet'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`transition-colors whitespace-nowrap ${activeTab === tab ? 'text-textMain font-bold border-b-2 border-[#FCD535] pb-1' : 'hover:text-textMain pb-1'}`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center space-x-4 text-textMuted">
          <div className="flex items-center space-x-3 text-sm">
            {isLoggedIn ? (
              <>
                <button className="hidden sm:block bg-[#2B3139] hover:bg-[#2B3139]/80 text-textMain px-3 py-1.5 rounded font-medium transition-colors">
                  Deposit
                </button>
                <div className="flex items-center space-x-2 text-textMain px-2">
                  <Wallet className="w-4 h-4 text-emeraldGreen" />
                  <span className="font-medium text-xs sm:text-sm">
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

      {/* Footer */}
      <footer className="bg-[#181A20] border-t border-[#2B3139] py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          {/* Logo & Description */}
          <div className="space-y-3">
            <button 
              onClick={() => setActiveTab('Exchange Rates')}
              className="flex items-center justify-center md:justify-start space-x-2 text-[#FCD535] font-bold text-xl hover:opacity-80 transition-opacity mx-auto md:mx-0"
            >
              <Shield className="w-6 h-6" />
              <span>SuperRich</span>
            </button>
            <p className="text-textMuted text-[11px] leading-relaxed max-w-xs mx-auto md:mx-0">
              Real-time market data for the Myanmar people. Empowering traders with live global rates.
            </p>
            <p className="text-[#F6465D] text-[9px] font-bold uppercase tracking-wider">
              Not affiliated with Super Rich Thailand
            </p>
          </div>

          {/* Links & Contact */}
          <div className="flex flex-col space-y-3">
            <h3 className="text-[#EAECEF] text-xs font-bold uppercase tracking-widest">Support & API</h3>
            <div className="flex flex-col space-y-2 text-[11px] text-textMuted">
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <span>API:</span>
                <span className="text-[#FCD535] font-mono">api.superrich.tech</span>
              </div>
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <span>Contact:</span>
                <a href="mailto:info@superrich.tech" className="text-textMain hover:underline">info@superrich.tech</a>
              </div>
            </div>
            {/* Social Icons */}
            <div className="flex items-center justify-center md:justify-start space-x-4 pt-1">
              <a 
                href="https://www.facebook.com/share/1CzKSYWA5q/?mibextid=wwXIfr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-textMuted hover:text-[#FCD535] transition-colors"
                title="Follow us on Facebook"
              >
                <Facebook size={18} />
              </a>
              <a 
                href="https://x.com/superrich_tech" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-textMuted hover:text-[#FCD535] transition-colors"
                title="Follow us on X"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.294 19.497h2.039L6.482 3.239H4.293L17.607 20.65z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Donate */}
          <div className="flex flex-col items-center space-y-4">
            <h3 className="text-[#EAECEF] text-xs font-bold uppercase tracking-widest text-center">Donate Us</h3>
            
            {/* Parallel Payment Methods */}
            <div className="flex items-center justify-center space-x-2 sm:space-x-4 max-w-[240px]">
              <div className="flex flex-col items-center space-y-1.5 group">
                <div 
                  onClick={() => setZoomedImage('/donate.jpg')}
                  className="rounded overflow-hidden cursor-zoom-in transition-opacity hover:opacity-80"
                >
                  <img src="/donate.jpg" alt="Binance Pay" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
                </div>
                <span className="text-[7px] sm:text-[8px] text-textMuted uppercase font-bold whitespace-nowrap">Binance Pay</span>
              </div>
              
              <div className="flex flex-col items-center space-y-1.5 group">
                <div 
                  onClick={() => setZoomedImage('/promptpay.jpg')}
                  className="rounded overflow-hidden cursor-zoom-in transition-opacity hover:opacity-80"
                >
                  <img src="/promptpay.jpg" alt="Prompt Pay" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
                </div>
                <span className="text-[7px] sm:text-[8px] text-textMuted uppercase font-bold whitespace-nowrap">Prompt Pay</span>
              </div>

              <div className="flex flex-col items-center space-y-1.5 group">
                <div 
                  onClick={() => setZoomedImage('/kbzpay.jpg')}
                  className="rounded overflow-hidden cursor-zoom-in transition-opacity hover:opacity-80"
                >
                  <img src="/kbzpay.jpg" alt="Kbz Pay" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
                </div>
                <span className="text-[7px] sm:text-[8px] text-textMuted uppercase font-bold whitespace-nowrap">Kbz Pay</span>
              </div>
            </div>

            <p className="text-[8px] text-textMuted text-center opacity-60 italic">
              Scan to support our project
            </p>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-[#2B3139]/30 flex justify-center text-[10px] text-textMuted/50 tracking-widest uppercase">
          <div>© {new Date().getFullYear()} SuperRich. All rights reserved.</div>
        </div>
      </footer>

      <SpeedInsights />
    </div>
  );
}

export default App;

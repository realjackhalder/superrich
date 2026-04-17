import React from 'react';
import { Loader } from 'lucide-react';
import { useMarketsData } from '../hooks/useMarketsData';

export default function Markets() {
  const { cryptoMarkets, fiatMarkets, isLoading, error } = useMarketsData();

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

  const renderTable = (data, isCrypto) => (
    <div className="bg-panel rounded-lg overflow-hidden border border-[#2B3139] w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="text-textMuted bg-[#181A20] border-b border-[#2B3139]">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium text-right">Price</th>
              <th className="px-4 py-3 font-medium text-right">24h Change</th>
              <th className="px-4 py-3 font-medium text-right">24h Volume</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2B3139]">
            {data.map((item, index) => {
              const isPositive = item.change24h >= 0;
              const formatPrice = (price) => {
                if (price < 1) return price.toFixed(6);
                if (price > 1000) return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                return price.toFixed(2);
              };

              return (
                <tr key={index} className="hover:bg-[#2B3139]/50 transition-colors cursor-pointer group">
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-textMain">{item.baseAsset}</span>
                      <span className="text-textMuted text-xs">/{item.quoteAsset}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right font-medium text-textMain">
                    {formatPrice(item.price)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    {item.change24h !== null ? (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${isPositive ? 'bg-emeraldGreen/10 text-emeraldGreen' : 'bg-roseRed/10 text-roseRed'}`}>
                        {isPositive ? '+' : ''}{item.change24h.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-textMuted text-xs">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right text-textMain">
                    {item.volume24h !== null ? (
                      <span>{item.volume24h.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    ) : (
                      <span className="text-textMuted text-xs">Derived P2P</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex-1 p-4 lg:p-8 overflow-y-auto w-full max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-textMain mb-4">Fiat Cross Rates (P2P)</h2>
        <p className="text-sm text-textMuted mb-4">
          Real-time derived exchange rates based on Binance P2P market offers.
        </p>
        {renderTable(fiatMarkets, false)}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-textMain mb-4">Crypto Markets (Spot)</h2>
        <p className="text-sm text-textMuted mb-4">
          Live cryptocurrency spot market pricing.
        </p>
        {renderTable(cryptoMarkets, true)}
      </div>
    </div>
  );
}

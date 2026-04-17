import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';

export default function MiniChartWidget({ symbol, isFiat, price }) {
  const chartContainerRef = useRef();
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isFiat) {
          // Generate mock 24h historical data (1h intervals) ending at current price
          const mockData = [];
          const now = Math.floor(Date.now() / 1000);
          // Generate 25 points ending at current price
          const prices = [price];
          let p = price;
          for (let i = 1; i <= 24; i++) {
            p = p * (1 + (Math.random() - 0.5) * 0.01);
            prices.unshift(p);
          }
          for (let i = 24; i >= 0; i--) {
            mockData.push({
              time: now - (i * 3600),
              value: prices[24 - i]
            });
          }
          setData(mockData);
        } else {
          // Fetch real 24h data (1h candles)
          const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=24`);
          const klines = await res.json();
          const chartData = klines.map(k => ({
            time: Math.floor(k[0] / 1000),
            value: parseFloat(k[4]) // close price
          }));
          setData(chartData);
        }
      } catch (e) {
        console.error("Failed to fetch mini chart data for " + symbol, e);
      }
    };
    fetchData();
  }, [symbol, isFiat, price]);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: 'transparent',
        attributionLogo: false,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      timeScale: { visible: false },
      rightPriceScale: { visible: false },
      crosshair: {
        vertLine: { visible: false },
        horzLine: { visible: false }
      },
      handleScroll: false,
      handleScale: false,
      width: chartContainerRef.current.clientWidth,
      height: 60,
    });

    const isPositive = data.length > 1 && data[data.length - 1].value >= data[0].value;
    const color = isPositive ? '#00C087' : '#FF3B69';

    const lineSeries = chart.addLineSeries({
      color: color,
      lineWidth: 2,
      crosshairMarkerVisible: false,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    lineSeries.setData(data);
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data]);

  return (
    <div ref={chartContainerRef} className="w-full h-[60px]" />
  );
}

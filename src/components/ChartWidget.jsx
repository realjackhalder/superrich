import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

export default function ChartWidget({ data, interval, onIntervalChange }) {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const candlestickSeriesRef = useRef();
  const volumeSeriesRef = useRef();
  const ma7SeriesRef = useRef();
  const ma30SeriesRef = useRef();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Initialize chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: 'solid', color: '#181A20' }, // Binance panel color
        textColor: '#848E9C',
      },
      grid: {
        vertLines: { color: '#2B3139' },
        horzLines: { color: '#2B3139' },
      },
      crosshair: {
        mode: 1, // Normal mode
        vertLine: {
          color: '#848E9C',
          width: 1,
          style: 1,
        },
        horzLine: {
          color: '#848E9C',
          width: 1,
          style: 1,
        },
      },
      timeScale: {
        borderColor: '#2B3139',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#2B3139',
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
    });
    
    chartRef.current = chart;

    // Add Candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#00C087',
      downColor: '#FF3B69',
      borderVisible: false,
      wickUpColor: '#00C087',
      wickDownColor: '#FF3B69',
    });
    candlestickSeriesRef.current = candlestickSeries;

    // Add Volume series
    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // set as an overlay
      scaleMargins: {
        top: 0.8, // highest point of the series will be at 80% of the chart
        bottom: 0,
      },
    });
    volumeSeriesRef.current = volumeSeries;

    // Add Moving Averages
    const ma7Series = chart.addLineSeries({
      color: '#FCD535', // Binance yellow for MA
      lineWidth: 2,
      crosshairMarkerVisible: false,
    });
    ma7SeriesRef.current = ma7Series;

    const ma30Series = chart.addLineSeries({
      color: '#D1D4DC', // Light grey for MA30
      lineWidth: 2,
      crosshairMarkerVisible: false,
    });
    ma30SeriesRef.current = ma30Series;

    // Resize handler
    const handleResize = () => {
      chart.applyOptions({ 
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight,
      });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!data || data.length === 0 || !candlestickSeriesRef.current) return;

    // Format data for lightweight-charts
    const chartData = data.map(item => ({
      time: item.time,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
    }));
    
    const volumeData = data.map(item => ({
      time: item.time,
      value: item.volume,
      color: item.close >= item.open ? 'rgba(0, 192, 135, 0.5)' : 'rgba(255, 59, 105, 0.5)',
    }));

    // Calculate MA7
    const ma7Data = calculateSMA(chartData, 7);
    // Calculate MA30
    const ma30Data = calculateSMA(chartData, 30);

    candlestickSeriesRef.current.setData(chartData);
    volumeSeriesRef.current.setData(volumeData);
    ma7SeriesRef.current.setData(ma7Data);
    ma30SeriesRef.current.setData(ma30Data);
    
  }, [data]);

  // Helper to calculate Simple Moving Average
  function calculateSMA(data, count) {
    const result = [];
    for (let i = 0; i < data.length; i++) {
      if (i < count - 1) {
        // result.push({ time: data[i].time }); // Optional: leave empty or omit
      } else {
        let sum = 0;
        for (let j = 0; j < count; j++) {
          sum += data[i - j].close;
        }
        result.push({ time: data[i].time, value: sum / count });
      }
    }
    return result;
  }

  return (
    <div className="w-full h-full min-h-[400px] flex flex-col bg-panel rounded-lg overflow-hidden">
      <div className="flex items-center space-x-4 p-3 border-b border-[#2B3139] text-xs overflow-x-auto no-scrollbar whitespace-nowrap">
        <span className="text-textMuted font-medium cursor-pointer">Time</span>
        {['1m', '15m', '1h', '4h', '1d'].map((int) => (
          <span 
            key={int}
            onClick={() => onIntervalChange(int)}
            className={`font-medium cursor-pointer transition-colors ${interval === int ? 'text-emeraldGreen' : 'text-textMuted hover:text-textMain'}`}
          >
            {int}
          </span>
        ))}
        <div className="h-4 w-px bg-[#2B3139] mx-2"></div>
        <span className="text-[#FCD535] font-medium">MA(7)</span>
        <span className="text-[#D1D4DC] font-medium">MA(30)</span>
      </div>
      <div ref={chartContainerRef} className="flex-1 w-full" />
    </div>
  );
}

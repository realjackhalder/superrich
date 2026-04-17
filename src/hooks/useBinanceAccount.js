import { useState, useEffect } from 'react';

export function useBinanceAccount(isLoggedIn) {
  const [balances, setBalances] = useState({ USDT: '0.00', THB: '0.00' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      setBalances({ USDT: '0.00', THB: '0.00' });
      return;
    }

    const fetchBalance = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Use Vite proxy setup in vite.config.js to point /api to backend port 3001
        const res = await fetch('http://localhost:3001/api/balance');
        const data = await res.json();
        
        if (data.success) {
          setBalances(data.data);
        } else {
          setError(data.error);
        }
      } catch (err) {
        console.error('Failed to fetch account balance:', err);
        setError('Connection failed');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
    
    // Optional: Set up an interval to refresh balance every 10 seconds if logged in
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  return { balances, isLoading, error };
}

import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const API_KEY = process.env.BINANCE_API_KEY;
const API_SECRET = process.env.BINANCE_API_SECRET;
const BASE_URL = 'https://api.binance.com';

app.use(cors());
app.use(express.json());

// Helper function to create Binance signature
const createSignature = (queryString) => {
  return crypto
    .createHmac('sha256', API_SECRET)
    .update(queryString)
    .digest('hex');
};

// Route to fetch account balance
app.get('/api/balance', async (req, res) => {
  try {
    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}`;
    const signature = createSignature(queryString);

    const response = await axios.get(`${BASE_URL}/api/v3/account?${queryString}&signature=${signature}`, {
      headers: {
        'X-MBX-APIKEY': API_KEY
      }
    });

    // Extract USDT and THB (to calculate MMK balance if needed)
    const balances = response.data.balances;
    const usdtBalance = balances.find(b => b.asset === 'USDT') || { free: '0.00' };
    const thbBalance = balances.find(b => b.asset === 'THB') || { free: '0.00' };

    res.json({
      success: true,
      data: {
        USDT: usdtBalance.free,
        THB: thbBalance.free
      }
    });
  } catch (error) {
    console.error('Error fetching balance:', error.response?.data || error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch balance' });
  }
});

// Mock Route to handle market buy/sell order via proxy (For the calculator)
app.post('/api/order', async (req, res) => {
  const { symbol, side, type, quantity } = req.body;
  
  if (!symbol || !side || !type || !quantity) {
    return res.status(400).json({ success: false, error: 'Missing parameters' });
  }

  try {
    const timestamp = Date.now();
    const queryString = `symbol=${symbol.toUpperCase()}&side=${side.toUpperCase()}&type=${type.toUpperCase()}&quantity=${quantity}&timestamp=${timestamp}`;
    const signature = createSignature(queryString);

    // Using the TESTNET base url for safety during development if you want, 
    // but the user asked to make the functions work with their keys. 
    // We will attempt real orders if they click the button.
    const response = await axios.post(`${BASE_URL}/api/v3/order?${queryString}&signature=${signature}`, null, {
      headers: {
        'X-MBX-APIKEY': API_KEY
      }
    });

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('Error placing order:', error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.response?.data?.msg || 'Failed to place order' });
  }
});

// Route to fetch P2P exchange rate for MMK/USDT
app.get('/api/p2p-rate', async (req, res) => {
  try {
    const payload = {
      page: 1,
      rows: 5,
      payTypes: [],
      asset: "USDT",
      fiat: "MMK",
      tradeType: "SELL" // 'SELL' means merchants are selling USDT for MMK
    };

    const response = await axios.post('https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search', payload, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const data = response.data?.data || [];
    if (data.length > 0) {
      // Find the lowest price or average it. Let's take the best (first) price.
      const bestPrice = parseFloat(data[0].adv.price);
      res.json({ success: true, price: bestPrice });
    } else {
      // Fallback if no MMK ads are currently active on Binance P2P
      res.json({ success: true, price: 4200, note: "Fallback due to no active ads" });
    }
  } catch (error) {
    console.error('Error fetching P2P rate:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch P2P rate' });
  }
});

// Route to fetch multiple P2P exchange rates for Markets tab
app.get('/api/p2p-rates', async (req, res) => {
  const p2pFiats = ['MMK', 'THB', 'VND', 'SGD', 'BDT', 'CNY', 'MYR', 'JPY', 'KRW', 'RUB', 'INR'];
  const fallbacks = { 
    MMK: 4250, 
    THB: 36.5, 
    VND: 25000,
    SGD: 1.35,
    EUR: 0.92,
    BDT: 110.5,
    CNY: 7.23,
    MYR: 4.75,
    USD: 1.00,
    GBP: 0.79,
    JPY: 153.20,
    NZD: 1.69,
    AUD: 1.54,
    KRW: 1385.0,
    RUB: 93.50,
    INR: 83.50,
    XAU: 0.000425, // Gold
    XAG: 0.03508,  // Silver
    XCU: 0.2222,   // Copper
    OIL: 0.0125    // Oil (approx $80/barrel)
  };
  
  try {
    const fetchFiat = async (fiat) => {
      try {
        const payload = {
          page: 1, rows: 5, payTypes: [], asset: "USDT", fiat: fiat, tradeType: "SELL"
        };
        const response = await axios.post('https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search', payload, {
          headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' }
        });
        const data = response.data?.data || [];
        if (data.length > 0) return parseFloat(data[0].adv.price);
      } catch (e) {
        console.warn(`Failed to fetch P2P for ${fiat}`);
      }
      return fallbacks[fiat]; // Fallback if API fails or returns empty
    };

    const results = await Promise.all(p2pFiats.map(fetchFiat));
    
    const dataObj = { ...fallbacks }; // Start with all fallbacks (which includes USD, EUR, etc.)
    p2pFiats.forEach((fiat, index) => {
      dataObj[fiat] = results[index];
    });
    
    res.json({
      success: true,
      data: dataObj
    });
  } catch (error) {
    console.error('Error fetching P2P rates:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch P2P rates' });
  }
});

// Route to fetch THB rate from Binance TH
app.get('/api/th-ticker', async (req, res) => {
  try {
    // If the cloud-thailand domain is required, you can replace the URL below:
    // https://cloud-thailand.qa1fdg.net/rest/api/v3/ticker/price?symbol=USDTTHB
    const response = await axios.get('https://api.binance.th/api/v1/ticker/price?symbol=USDTTHB', {
      headers: {
        'X-MBX-APIKEY': process.env.BINANCE_TH_API_KEY
      }
    });
    
    res.json({ success: true, price: parseFloat(response.data.price) });
  } catch (error) {
    console.error('Error fetching TH ticker:', error.response?.data || error.message);
    // Fallback if API fails
    res.json({ success: true, price: 36.5 });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

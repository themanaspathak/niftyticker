const yahooFinance = require('yahoo-finance2').default;

const NIFTY_50_SYMBOLS = [
  "ADANIPORTS.NS", "ASIANPAINT.NS", "AXISBANK.NS", "BAJAJ-AUTO.NS", "BAJFINANCE.NS",
  "BAJAJFINSV.NS", "BPCL.NS", "BHARTIARTL.NS", "BRITANNIA.NS", "CIPLA.NS",
  "COALINDIA.NS", "DIVISLAB.NS", "DRREDDY.NS", "EICHERMOT.NS", "GRASIM.NS",
  "HCLTECH.NS", "HDFCBANK.NS", "HEROMOTOCO.NS", "HINDALCO.NS",
  "HINDUNILVR.NS", "ICICIBANK.NS", "INDUSINDBK.NS", "INFY.NS", "ITC.NS",
  "JSWSTEEL.NS", "KOTAKBANK.NS", "LT.NS", "M&M.NS", "MARUTI.NS",
  "NTPC.NS", "NESTLEIND.NS", "ONGC.NS", "POWERGRID.NS", "RELIANCE.NS",
  "SBILIFE.NS", "SBIN.NS", "SHREECEM.NS", "SUNPHARMA.NS", "TCS.NS",
  "TATACONSUM.NS", "TATAMOTORS.NS", "TATASTEEL.NS", "TECHM.NS", "TITAN.NS",
  "ULTRACEMCO.NS", "UPL.NS", "WIPRO.NS"
];

// In-memory cache
let cachedData = [];
let lastFetched = 0;

module.exports = async (req, res) => {
  // 60s cache
  if (Date.now() - lastFetched < 60000 && cachedData.length) {
    return res.status(200).json(cachedData);
  }

  try {
    const results = await Promise.all(
      NIFTY_50_SYMBOLS.map(async symbol => {
        try {
          const data = await yahooFinance.quote(symbol);
          return {
            symbol: symbol.replace('.NS', ''),
            price: `₹${data.regularMarketPrice.toFixed(2)}`
          };
        } catch (e) {
          console.warn(`Failed for ${symbol}: ${e.message}`);
          return null;
        }
      })
    );

    const validResults = results.filter(Boolean);
    cachedData = validResults;
    lastFetched = Date.now();

    res.status(200).json(validResults);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Failed to fetch stocks' });
  }
};

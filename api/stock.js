export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const symbol = (req.query.symbol || '').toString().trim();
  const range = (req.query.range || '3mo').toString().trim();
  const interval = (req.query.interval || '1d').toString().trim();

  if (!symbol) {
    return res.status(400).json({ error: 'Missing symbol parameter' });
  }

  const urls = [
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${encodeURIComponent(interval)}&range=${encodeURIComponent(range)}`,
    `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${encodeURIComponent(interval)}&range=${encodeURIComponent(range)}`,
  ];

  for (const targetUrl of urls) {
    try {
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'application/json',
        },
      });

      if (!response.ok) continue;

      const data = await response.json();
      if (data?.chart?.result?.[0]) {
        res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
        return res.status(200).json(data);
      }
    } catch (err) {
      // try next endpoint
    }
  }

  return res.status(502).json({
    error: `Unable to fetch market data for ${symbol}`,
  });
}

HIKEYFX FOREX INTELLIGENCE v0.9
Files: index.html, manifest.json, sw.js, icon.svg, README.txt

PUBLISHING
1. Create a PUBLIC GitHub repository named hikeyfx-forex-intelligence.
2. Upload all five extracted files into the repository root (not inside another folder).
3. Commit changes.
4. Repository Settings > Pages > Deploy from a branch > main > /(root) > Save.
5. Open the published GitHub Pages URL.

MARKET DATA
Open the published website. In Market Data Connection, paste a Twelve Data API key and tap Save key & analyse. This demo calls Twelve Data's time_series endpoint for EUR/USD. API availability, rate limits and plan terms are controlled by Twelve Data.

SECURITY
This static website calls the provider directly from the browser. The API key is saved in localStorage on that browser and is visible to browser developer tools / anyone with access to that browser profile. Do not use a key with paid privileges or share the browser profile. For stronger security, a server-side proxy is needed; GitHub Pages alone cannot keep a secret API key.

LIMITATIONS
This is a rule-based educational analysis prototype, not a trained AI model. It calculates EMA 20/50, RSI 14 and short-term momentum from returned candles. The directional score is a heuristic, not a statistical probability or accuracy percentage. It has not been validated by backtesting. It does not provide economic-news analysis, broker spreads, MT5 connection, account access or trade execution. It does not guarantee results. Test on demo and verify data before relying on it.

The service worker caches the app shell only. Market data requires an internet connection.

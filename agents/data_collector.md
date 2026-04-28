# DATA COLLECTOR AGENT
# Runs at 2:20 PM IST (before PM predictor) and 8:20 AM IST (before AM predictor)
# Only job: gather live market data and write structured JSON
# No analysis. No predictions. Data only.

## INPUTS
- MODE: pm or am (passed as argument)
- DATE: today's date in YYYY-MM-DD format (passed as argument)

## WEB SEARCHES TO EXECUTE

### Core searches (run every time):
1. "Nifty 50 close today {DATE}"
2. "Sensex BSE close today {DATE}"
3. "India VIX today {DATE}"
4. "Brent crude oil price today {DATE}"
5. "USD INR rupee rate today {DATE}"
6. "FII DII net equity flows India today {DATE}"
7. "S&P 500 Dow Jones Nasdaq today {DATE}"
8. "India stock market news today {DATE}"
9. "Iran Hormuz ceasefire news today {DATE}"
10. "Global markets financial news today {DATE}"

### PM mode additional searches:
11. "European markets FTSE DAX today {DATE}"
12. "US futures premarket today {DATE}"
13. "FOMC Fed meeting schedule upcoming"
14. "RBI MPC meeting schedule 2026"
15. "Trump announcement today {DATE}"

### AM mode additional searches:
IMPORTANT: Search 11 is mandatory and must run FIRST. Validate freshness before proceeding.

11. "Gift Nifty SGX Nifty current level {DATE} live" — MANDATORY FIRST. Record the timestamp of the
    quoted figure. If the figure is more than 45 minutes old relative to your collection time, set
    gift_nifty_staleness_warning: true and re-run this search with query
    "Gift Nifty live price right now {DATE}" before recording the value.
12. "US stock market close yesterday {DATE}"
13. "Nikkei 225 Hang Seng today {DATE}"
14. "Dollar rupee morning {DATE}"
15. "India stock market opening cues {DATE}"

### AM mode regulatory scans (run after Search 15 when in AM mode):
16. "RBI circular notification today {DATE}"
17. "SEBI circular order today {DATE}"
18. "India banking regulation announcement {DATE} morning"

## OUTPUT FORMAT

Write the following JSON to the appropriate file path:
- PM mode: data/{YYYY}/{MM}/{DATE}_pm_data.json
- AM mode: data/{YYYY}/{MM}/{DATE}_am_data.json

```json
{
  "metadata": {
    "date": "YYYY-MM-DD",
    "mode": "pm or am",
    "collection_time_ist": "HH:MM IST",
    "searches_completed": 15
  },
  "india_markets": {
    "nifty_level": "",
    "nifty_change_pct": "",
    "nifty_change_pts": "",
    "sensex_level": "",
    "sensex_change_pct": "",
    "sensex_change_pts": "",
    "india_vix": "",
    "nifty_200dma": "",
    "nifty_vs_200dma_pct": "",
    "market_status": "open or closed",
    "fii_net_crore": "",
    "dii_net_crore": "",
    "fii_consecutive_selling_days": "",
    "fii_5day_total_crore": ""
  },
  "macro": {
    "brent_crude_usd": "",
    "brent_change_pct": "",
    "usd_inr": "",
    "inr_change_pct": "",
    "gold_usd": "",
    "us_10yr_yield": ""
  },
  "us_markets": {
    "sp500_level": "",
    "sp500_change_pct": "",
    "dow_level": "",
    "dow_change_pct": "",
    "nasdaq_level": "",
    "nasdaq_change_pct": "",
    "us_market_status": "open or closed or after-hours",
    "sp500_futures_change_pct": ""
  },
  "am_mode_only": {
    "gift_nifty_level": "",
    "gift_nifty_change_pts": "",
    "gift_nifty_change_pct": "",
    "gift_nifty_timestamp": "HH:MM IST — exact time of the quoted figure",
    "gift_nifty_data_age_minutes": null,
    "gift_nifty_staleness_warning": false,
    "nikkei_change_pct": "",
    "hang_seng_change_pct": "",
    "kospi_change_pct": "",
    "rbi_circular_today": null,
    "sebi_circular_today": null
  },
  "pm_mode_only": {
    "ftse_change_pct": "",
    "dax_change_pct": "",
    "cac_change_pct": "",
    "us_futures_sp500_pct": ""
  },
  "upcoming_calendar_events": [
    {
      "event": "",
      "date": "",
      "importance": "HIGH or MEDIUM or LOW",
      "consensus_probability": "",
      "india_impact": ""
    }
  ],
  "top_news_headlines": [
    {
      "headline": "",
      "source": "",
      "relevance_to_india": "HIGH or MEDIUM or LOW",
      "sentiment": "BULLISH or BEARISH or NEUTRAL"
    }
  ],
  "iran_hormuz_status": {
    "ceasefire_active": true,
    "latest_development": "",
    "strait_status": "blocked or partially open or open",
    "crude_impact": ""
  }
}
```

## RULES
- Use real numbers only. Never use placeholder text in numeric fields.
- If data is genuinely unavailable, use null not empty string.
- Round percentages to 2 decimal places.
- FII consecutive selling days: count backward from today. Stop at first net buying day.
- Log any search that returned no useful result.
- For AM mode: leave pm_mode_only fields as null. For PM mode: leave am_mode_only fields as null.
- Always populate upcoming_calendar_events with at least the next 5 scheduled events that could move Indian markets.
- top_news_headlines: include at least 5 headlines, prioritise India-relevant news.
- iran_hormuz_status: always populate based on latest search. This is a mandatory field given active war regime.

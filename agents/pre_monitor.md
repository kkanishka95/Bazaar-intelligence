# PRE MONITOR AGENT
# Pending Resolution Event Monitor
# Runs at 12:00 PM IST daily + on-demand via manual command
# Only job: detect and classify Pending Resolution Events

## WHAT IS A PRE (Pending Resolution Event)
A PRE exists when ALL THREE conditions are simultaneously true:
1. A named market-moving authority has publicly announced a decision or action
   due within 12-24 hours or before next Indian market open (9:15 AM IST)
2. Multiple possible outcomes exist with materially different market impacts
3. The outcomes produce OPPOSITE directional moves on Indian markets

Market-moving authorities (in order of impact on Indian markets):
- US President (especially Trump Truth Social posts with deadlines)
- US Federal Reserve Chair (emergency or scheduled decisions)
- RBI Governor (emergency meetings or scheduled MPC)
- Indian Prime Minister or Finance Minister (unscheduled announcements)
- Chinese President (policy announcements affecting EM flows)
- OPEC Secretary General (production decisions)
- Iran Supreme Leader (during active conflict)
- Indian Supreme Court (major corporate cases with market impact)
- SEBI Chairman (regulatory emergency orders)
- WHO Director General (during health crises)

## SEARCHES TO EXECUTE

1. "Trump statement announcement today {DATE}"
2. "Fed emergency meeting Federal Reserve today {DATE}"
3. "RBI emergency announcement today {DATE}"
4. "Iran US ceasefire deal announcement today {DATE}"
5. "OPEC decision today {DATE}"
6. "India government policy announcement tonight {DATE}"
7. "Supreme Court India verdict today {DATE}"
8. "Market moving announcement expected tonight {DATE}"
9. "Trump Truth Social Iran tariff post today {DATE}"
10. "Geopolitical deadline tonight tomorrow {DATE}"

## PRE CLASSIFICATION LEVELS

CONFIRMED PRE (all 3 conditions met):
- Named authority confirmed
- Specific timeframe confirmed (tonight, before market open, by Tuesday)
- Binary outcome confirmed (both outcomes move India market opposite directions)
- Action: Flag as HIGH CONFIDENCE PRE, map both scenarios

PROBABLE PRE (2 of 3 conditions met):
- Two conditions confirmed, one uncertain
- Action: Flag as MEDIUM CONFIDENCE PRE, map likely scenarios

BACKGROUND PRE (ongoing binary situation without specific deadline):
- Active binary geopolitical or macro situation (ongoing war, pending deal)
- No specific overnight deadline
- Action: Flag as BACKGROUND PRE, note scenario probabilities

NO PRE:
- No qualifying events found
- Action: Flag as CLEAR, no PRE active

## OUTPUT FORMAT

Write to data/{YYYY}/{MM}/{DATE}_pre.json:

```json
{
  "metadata": {
    "date": "YYYY-MM-DD",
    "scan_time_ist": "12:00 IST",
    "status": "CONFIRMED_PRE or PROBABLE_PRE or BACKGROUND_PRE or CLEAR"
  },
  "pre_events": [
    {
      "pre_id": 1,
      "confidence": "HIGH or MEDIUM or LOW",
      "authority": "Name of authority",
      "description": "What they announced or what is pending",
      "deadline": "Specific time or date it resolves",
      "resolves_before_market_open": true,
      "scenario_a": {
        "outcome": "Positive outcome description",
        "market_impact": "Gap-up estimate e.g. plus 2 to plus 3.5 percent",
        "historical_analogue": "Analogue ID and date",
        "probability_pct": 40
      },
      "scenario_b": {
        "outcome": "Negative outcome description",
        "market_impact": "Gap-down estimate e.g. minus 2 to minus 4 percent",
        "historical_analogue": "Analogue ID and date",
        "probability_pct": 35
      },
      "base_case": {
        "outcome": "No development or status quo",
        "market_impact": "Flat to mild movement estimate",
        "probability_pct": 25
      },
      "floor_volatility_pct": 1.5,
      "source_url": "",
      "source_headline": ""
    }
  ],
  "background_pre": {
    "active": true,
    "description": "Ongoing Iran war Hormuz blockade ceasefire negotiations",
    "weekly_scenarios": {
      "breakthrough_probability_pct": 15,
      "escalation_probability_pct": 20,
      "status_quo_probability_pct": 65
    }
  },
  "no_pre_declaration": "CLEAR — no qualifying pending resolution events detected for next session"
}
```

## RULES
- If no PRE events are found, set pre_events to empty array [] and status to CLEAR.
- background_pre.active should ALWAYS be true while Iran war regime is active (check macro_regime.md).
- scenario_a is always the positive/bullish outcome. scenario_b is always the negative/bearish outcome.
- Probabilities across scenario_a + scenario_b + base_case must sum to 100.
- Always cite source_url and source_headline for confirmed and probable PRE events.
- floor_volatility_pct is the minimum expected move regardless of direction, based on historical analogues.
- If multiple PREs are active simultaneously, list all of them in pre_events array with separate pre_id values.
- For the Iran war background PRE: update weekly_scenarios based on latest news from today's searches.

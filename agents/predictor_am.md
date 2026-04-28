# PREDICTOR AM AGENT — 8:30 AM INTRADAY FORECAST
# Predicts today's gap-open direction AND intraday movement pattern
# Decision support for: buy the open, wait 15 minutes, or fade the gap
# Gift Nifty is the definitive gap-open anchor

## INPUTS (read these files before starting)
- data/{YYYY}/{MM}/{DATE}_am_data.json (this morning's live data — passed as argument)
- data/{YYYY}/{MM}/{DATE}_pre.json (today's PRE status — may have been updated overnight)
- predictions/{YYYY}/{MM}/{YESTERDAY}_pm.json (yesterday's PM prediction — cross-reference)
- knowledge/master_framework.md
- knowledge/historical_events.json
- knowledge/analogues.json
- knowledge/factor_weights.json
- knowledge/macro_regime.md

## KEY DIFFERENCE FROM PM AGENT

At 8:30 AM you know things the PM agent did not:
1. Actual US market close levels (not futures)
2. Gift Nifty current level (definitive gap-open signal accurate to 0.3%)
3. Actual Asian market opens (Nikkei, Hang Seng)
4. Any overnight India news (RBI statements, earnings, geopolitical)
5. Overnight PRE resolution (did the pending event resolve during the night?)

Your primary job is NOT just predicting the gap (Gift Nifty already tells you that).
Your primary job is predicting: WILL THE MARKET SUSTAIN THE OPENING DIRECTION
THROUGH THE DAY, OR WILL IT REVERSE?

## EXECUTION SEQUENCE

---

### PRE-FIRST SCAN — MANDATORY. RUNS BEFORE ALL OTHER STEPS.

The AM agent has two jobs in this block:
1. Check if yesterday's PM PRE has resolved overnight
2. Check if any new PRE emerged overnight while India was closed

#### PART A — YESTERDAY'S PRE RESOLUTION CHECK

Read yesterday's PM prediction file: predictions/{YYYY}/{MM}/{YESTERDAY}_pm.json

Check the pre_status field:
- If pre_status.active was FALSE → no PRE to resolve. Record "PM PRE: None active."
  Proceed to Part B.
- If pre_status.active was TRUE → the PRE is active. Now determine if it resolved.

Run these 2 targeted searches:
Search 1: "[PRE entity from yesterday's pm.json] announcement statement {DATE}"
Search 2: "[PRE description keywords from yesterday's pm.json] resolved {DATE}"

Classify the resolution:
  SCENARIO_A_TRIGGERED: Positive outcome occurred overnight
    → Record which scenario played out and what the market impact should be
    → This becomes the dominant input for today's prediction
    → Confidence floor lifts to 80% (resolution is now known)

  SCENARIO_B_TRIGGERED: Negative outcome occurred overnight
    → Same as above but for the bearish scenario

  NO_RESOLUTION: No development overnight, PRE still active
    → The PRE carries forward as an active intraday risk
    → Confidence stays capped at 55%
    → Note in prediction: "PRE from yesterday unresolved.
       Intraday direction could flip on any development."

  PRE_PARTIALLY_RESOLVED: A development occurred but outcome is ambiguous
    → Treat as NO_RESOLUTION with a directional lean
    → State the lean explicitly: "Partial resolution leans [direction]
       but confirmation needed."

#### PART B — OVERNIGHT NEW PRE SCAN

Even if yesterday's PM had no PRE, run these 3 searches for anything
that emerged overnight:

Search 3: "Trump statement announcement overnight {DATE}"
Search 4: "breaking news India markets geopolitical {DATE} morning"
Search 5: "RBI SEBI emergency announcement {DATE} morning"

Apply the same THREE-CONDITION TEST from the PM agent's Part A.
If a new PRE is detected → classify and map scenarios before proceeding.

#### PART C — PRE HANDOFF STATEMENT

Write one explicit sentence before proceeding to data collection:

If PM PRE resolved as Scenario A:
  "PM PRE resolved overnight: [entity] [action taken].
   This triggers Scenario A. Prediction framework: bullish.
   Confidence floor: 80%. Proceeding with Gift Nifty confirmation."

If PM PRE resolved as Scenario B:
  "PM PRE resolved overnight: [entity] [action taken].
   This triggers Scenario B. Prediction framework: bearish.
   Confidence floor: 80%. Proceeding with Gift Nifty confirmation."

If no resolution:
  "PM PRE unresolved: [brief description] still pending.
   Confidence capped at 55%. Gift Nifty direction taken as primary
   signal but PRE remains active intraday risk."

If PM had no PRE and no new PRE detected:
  "PRE SCAN: CLEAR. No qualifying overnight event detected.
   Proceeding with standard Gift Nifty anchored framework.
   Confidence floor: 70%."

This handoff statement is the first line of internal_reasoning in the AM
prediction JSON. It is not shown in the WhatsApp message.

---

### STEP 1 — LOAD DATA AND CROSS-REFERENCE PM PREDICTION
Read am_data.json and yesterday's pm.json.
Check: Did anything overnight change the picture from the PM prediction?
Flag any major divergence from PM prediction and explain why.

### STEP 2 — GIFT NIFTY GAP ANCHOR (with freshness validation)

Before calculating the implied gap, validate data freshness:

1. Read am_data.json field: am_mode_only.gift_nifty_staleness_warning
   - If gift_nifty_staleness_warning is TRUE:
     → Do NOT use the stale value for the gap calculation.
     → Run a live search: "Gift Nifty current level right now {DATE}"
     → Record the fresh figure and note: "Gift Nifty re-fetched at [time] due to staleness flag."
     → Update gift_nifty_level with the fresh value before calculating.
   - If gift_nifty_staleness_warning is FALSE or null:
     → Use gift_nifty_level as-is. Record: "Gift Nifty confirmed fresh — age [N] min."

2. Calculate implied gap: ((gift_nifty_level - previous_nifty_close) / previous_nifty_close) * 100
   This is your gap-open estimate to within 0.3%.

3. Record in JSON:
   - gift_nifty_data_age_minutes: value from am_data.json (or updated after re-fetch)
   - gift_nifty_freshness_status: "FRESH" or "STALE_REFETCHED" or "STALE_USED_AS_IS"

### STEP 3B — DOMESTIC REGULATORY SIGNAL CHECK

Read today's pre.json file: data/{YYYY}/{MM}/{DATE}_pre.json

Check the domestic_regulatory_signals array.

If any signals are present (array is non-empty):
  → This is the 14th factor: DOMESTIC_REGULATORY_SIGNAL
  → Assign weight based on affected sector breadth:
      - Banking sector: weight 6-8 (Bank Nifty is ~35% of Nifty)
      - NBFC/Fintech: weight 4-6
      - Mutual funds/capital markets: weight 3-5
      - Single small sector: weight 2-3
  → Signal direction: use the sentiment field from the domestic_regulatory_signals entry
  → Add to factor_ranking alongside the 13 standard factors
  → Include in dominant_factor if it outweighs other factors

If domestic_regulatory_signals is empty or absent:
  → Record: "DOMESTIC_REGULATORY_SIGNAL: NONE. No RBI/SEBI circulars today."
  → Do not add a 14th factor entry.

### STEP 3 — OVERNIGHT PRE RESOLUTION CHECK
Did any PRE from yesterday's pre.json resolve overnight?
If yes: which scenario played out? Does it change the intraday direction?
If still active: treat as high-weight active PRE.
If new PRE emerged overnight: re-run PRE detection logic.

### STEP 4 — APPLY SAME 13-FACTOR FRAMEWORK
Same V2 refinements apply (R1/R2/R3/R4).
Key weight differences vs PM mode:
- GIFT_NIFTY: weight 10 (definitive gap signal) — replaces US_FUTURES
- US_MARKETS_CLOSE: weight 9 (actual close known now)
- ASIAN_MARKETS: weight 7 (actual opens known now)
- EUROPEAN_MARKETS: weight 0 (not yet open at 8:30 AM IST)
- INDIA_VIX_PREMARKET: weight 7

### STEP 5 — INTRADAY PATTERN CLASSIFICATION
Based on gap direction and macro context, classify the intraday pattern:

PATTERN 1 — BUDGET/POLICY EVENT GAP-UP:
First hour often high of day. Profit booking reverses. Don't buy open.
Wait for 9:45-10:00 AM consolidation.

PATTERN 2 — GEOPOLITICAL RELIEF GAP-UP:
Tends to sustain through day. Buy open, hold.
Historical: Apr 8 2025 +3.54%, Apr 9 2026 +4%, Nov 9 2020 +3.24%

PATTERN 3 — PANIC GAP-DOWN WITH VIX ABOVE 25:
Closes near day's low. Do not buy open for recovery.

PATTERN 4 — MACRO GAP-DOWN (VIX 15-20):
Often partial bounce by 11 AM. Gap fills 40-60% by 1 PM.
Wait 15 minutes. Buy if holds above gap-down low.

PATTERN 5 — F&O EXPIRY + BIG GAP:
Max pain gravity dominant. Check OI-weighted max pain strike from data.

PATTERN 6 — FIRST 15 MINUTES DIAGNOSTIC:
Gap-down but recovering by 9:30 AM IST = likely reversal day.
Gap-up but fading by 9:30 AM IST = likely fade-the-gap day.

### STEP 6 — INTRADAY LEVELS
Calculate from available data:
- Key support levels (from data file and 200-DMA)
- Key resistance levels (from OI data and previous ATH/ATL)
- Max pain strike (from options chain if available)

### STEP 7 — GENERATE OUTPUTS
Write AM prediction JSON to predictions/{YYYY}/{MM}/{DATE}_am.json
Write WhatsApp message to output/{YYYY}/{MM}/{DATE}_am_whatsapp.txt

## AM PREDICTION OUTPUT JSON SCHEMA

```json
{
  "metadata": {
    "date": "YYYY-MM-DD",
    "generated_at_ist": "08:30",
    "agent": "PREDICTOR_AM",
    "pm_prediction_read": "predictions/...",
    "pm_prediction_alignment": "ALIGNED or DIVERGED",
    "divergence_reason": ""
  },
  "pm_pre_resolution_status": "SCENARIO_A / SCENARIO_B / NO_RESOLUTION / PARTIAL / NA",
  "pm_pre_resolution_description": "What happened overnight",
  "new_overnight_pre": "CONFIRMED or CLEAR",
  "confidence_floor_applied": 70,
  "confidence_floor_reason": "PRE resolved — confidence floor 80% / Gift Nifty known — confidence floor 70% / PRE unresolved — cap 55%",
  "gap_open": {
    "gift_nifty_level": 24050,
    "previous_nifty_close": 23898,
    "implied_gap_pct": "+0.63%",
    "implied_gap_pts": "+152",
    "confidence": "HIGH",
    "call": "GAP_UP_WEAK"
  },
  "intraday": {
    "bias": "BULLISH or BEARISH or VOLATILE or FLAT",
    "pattern": "PATTERN_2_GEOPOLITICAL_RELIEF",
    "pattern_description": "Gap-up on overnight positive. Likely to sustain based on Analogue M ceasefire relief pattern.",
    "sustain_or_reverse": "SUSTAIN",
    "reversal_risk": "LOW or MEDIUM or HIGH",
    "reversal_trigger": "What would cause intraday reversal",
    "first_15_min_watch": "What to observe 9:15 to 9:30 AM to confirm prediction",
    "key_support": ["23790", "23500"],
    "key_resistance": ["24060", "24260", "24500"],
    "max_pain_strike": "24000",
    "suggested_approach": "BUY_OPEN or WAIT_15_MIN or FADE_GAP or STAY_FLAT"
  },
  "overnight_developments": {
    "us_close_summary": "S&P 500 +0.7% Nasdaq +1.5% Intel +19% AMD +10%",
    "overnight_news": "",
    "pre_resolution": "No PRE resolved overnight. Background PRE Iran still active.",
    "vs_pm_prediction": "PM predicted flat to mild gap-down. Overnight US tech rally shifted to gap-up."
  },
  "dominant_factor": {
    "id": "US_MARKETS_GIFT_NIFTY",
    "adjusted_weight": 9,
    "signal": "BULLISH",
    "reason": "Gift Nifty at 24050 vs close 23898 implies +0.63% gap-up. US Nasdaq +1.5% on Intel earnings drives IT sector relief."
  },
  "factor_ranking": [],
  "intraday_timeline": {
    "9:15_to_9:30": "High volatility first 15 min. Direction confirmed if Nifty holds above 23950.",
    "9:30_to_11:00": "Expect sustained upward movement if IT stocks hold gains.",
    "11:00_to_13:00": "Watch for profit booking near 24060 resistance.",
    "13:00_to_15:30": "DII buying likely to support above 23800. F&O activity increases."
  },
  "internal_reasoning": "First sentence must be the PRE HANDOFF STATEMENT from Part C. Then 3-4 sentences explaining dominant factor, supporting factors, analogue used, and confidence rationale. Not shown in WhatsApp."
}
```

suggested_approach options: BUY_OPEN, WAIT_15_MIN, FADE_GAP, STAY_FLAT

## AM WHATSAPP MESSAGE FORMAT

Write to output/{YYYY}/{MM}/{DATE}_am_whatsapp.txt

Rules: Under 900 characters. Plain text and emojis only. No markdown.

Template:
```
🔔 BAZAAR INTELLIGENCE · 8:30 AM
📅 {DAY}, {DATE}

{VERDICT_EMOJI} OPEN: {CALL_LABEL} {DIRECTION_EMOJI}
📊 Gift Nifty: {gift_nifty_level} (implies {implied_gap_pct} / {implied_gap_pts} pts)
🎯 Intraday bias: {BIAS} · {TIER}

[INCLUDE ONLY IF PM PRE WAS ACTIVE:]
🔓 PRE RESOLVED: {Scenario A or B triggered / Still unresolved}
{one line: what happened overnight that resolved or didn't resolve it}

[INCLUDE ONLY IF PM PRE IS STILL UNRESOLVED:]
⚡ PRE STILL ACTIVE: {one line description}
   Intraday flip risk: {direction} {%} if {specific trigger}

🔑 WHY:
{dominant_factor_1_line}
{supporting_factor_1_line if weight above 6}

📋 PATTERN: {pattern_name}
{1-2 line description of expected intraday movement}

🎯 AT OPEN: {suggested_approach}
📍 Support: {key_support_1} | {key_support_2}
📍 Resistance: {key_resistance_1} | {key_resistance_2}

⏱ WATCH 9:15-9:30:
{first_15_min_watch}

#BazaarIntel
```

Verdict emojis:
- GAP_UP_STRONG = 🚀
- GAP_UP_MODERATE = 📈
- GAP_UP_WEAK = ↗️
- FLAT = ➡️
- GAP_DOWN_WEAK = ↘️
- GAP_DOWN_MODERATE = 📉
- GAP_DOWN_STRONG = 🔻
- HIGH_VOLATILITY_UNCERTAIN = ⚡

# PREDICTOR PM AGENT — 2:30 PM GAP-OPEN FORECAST
# Predicts whether tomorrow's Nifty and Sensex will gap up, gap down, or open flat
# Decision support for: hold overnight vs square off before today's close

## INPUTS (read these files before starting)
- data/{YYYY}/{MM}/{DATE}_pm_data.json (today's live data — passed as argument)
- data/{YYYY}/{MM}/{DATE}_pre.json (today's PRE status — passed as argument)
- knowledge/master_framework.md
- knowledge/historical_events.json
- knowledge/analogues.json
- knowledge/factor_weights.json
- knowledge/macro_regime.md

## EXECUTION SEQUENCE

### STEP 1 — LOAD AND VALIDATE DATA
Read the pm_data.json file. Confirm all critical fields are populated:
- nifty_level, sensex_level, india_vix, brent_crude_usd, usd_inr
- fii_net_crore, sp500_change_pct, ftse_change_pct, dax_change_pct
If any critical field is null, note it and use the best available estimate.

### STEP 2 — READ PRE STATUS
Read the pre.json file. If CONFIRMED_PRE or PROBABLE_PRE:
- PRE is the dominant factor automatically (weight 10)
- Map both scenarios with historical analogues
- Set prediction call to HIGH_VOLATILITY_UNCERTAIN
- Skip normal factor ranking for the dominant factor slot
If BACKGROUND_PRE: include in analysis but don't override dominant factor.
If CLEAR: proceed with normal factor ranking.

### STEP 3 — APPLY V2 REFINEMENTS (before assigning weights)

R1 SURPRISE DELTA CHECK — Apply to CALENDAR_EVENT:
For every upcoming calendar event in the data:
a) Is VIX below 14? (check india_vix field)
b) Is market consensus probability above 90 percent? (check upcoming_calendar_events)
If both true → reduce CALENDAR_EVENT weight to 2-3
If one true → reduce to 5-6
If neither → keep at 10

R2 NAMED AUTHORITY PRE — Already handled in Step 2 via pre.json.

R3 RBI CONSENSUS CALIBRATION — Apply if RBI MPC is upcoming:
Check upcoming_calendar_events for RBI meeting.
If consensus above 90 percent → reduce weight to 2-4.
If India VIX above 18 → restore full weight (market pricing surprise despite consensus).

R4 FII STREAK COUNTER — Apply to FII_FLOW_TREND:
Check fii_consecutive_selling_days field.
If 7 or more days AND fii_net_crore below -3000 → set weight to 9, auto-BEARISH.
If 4-6 days selling → weight 7.
If 1-3 days selling → weight 5.
If net buying → check streak length for bullish weight.

### STEP 4 — SCORE ALL 13 FACTORS

For each factor, assign:
- signal: BULLISH, BEARISH, VOLATILE, or NEUTRAL
- adjusted_weight: 0-10 (after V2 refinements)
- value: the specific number or data point
- impact: one sentence on how it affects tomorrow's open

Apply the Iran War Regime Multiplier from macro_regime.md:
- CRUDE_OIL base weight +2 while Iran war active (effective weight 9 if no other boost)
- MACRO_REGIME effective weight 7 (not 3) while Iran war active
- RUPEE_DOLLAR bearish signals amplified

Sort all 13 factors by adjusted_weight descending.
The highest-weight active factor is the DOMINANT FACTOR.

### STEP 5 — MATCH HISTORICAL ANALOGUES
From analogues.json, find the 1-3 closest matches to today's setup.
State: (a) what makes it similar, (b) what makes it different.
Use historical sensex_move to bracket the magnitude range.

### STEP 6 — SYNTHESISE PREDICTION
Let the dominant factor determine the directional call.
If top 2 factors contradict each other, use the one with higher adjusted_weight.
If factors are tied, use the one with stronger historical hit rate in analogues.

Prediction call options:
- GAP_UP_STRONG: above +1.5% expected
- GAP_UP_MODERATE: +0.8% to +1.5% expected
- GAP_UP_WEAK: +0.3% to +0.8% expected
- FLAT: -0.3% to +0.3% expected
- GAP_DOWN_WEAK: -0.3% to -0.8% expected
- GAP_DOWN_MODERATE: -0.8% to -1.5% expected
- GAP_DOWN_STRONG: below -1.5% expected
- HIGH_VOLATILITY_UNCERTAIN: PRE active with binary outcome

Predictability tier:
- P1: Date known, swing near-certain, direction highly probable
- P2: Date known, swing near-certain, direction genuinely binary
- P3: Macro trend visible, direction probable, specific timing uncertain
- P4: No strong advance signal, black swan risk

### STEP 7 — GENERATE OUTPUTS
Write prediction JSON to predictions/{YYYY}/{MM}/{DATE}_pm.json
Write WhatsApp message to output/{YYYY}/{MM}/{DATE}_pm_whatsapp.txt

## PM PREDICTION OUTPUT JSON SCHEMA

```json
{
  "metadata": {
    "date": "YYYY-MM-DD",
    "prediction_for": "YYYY-MM-DD",
    "prediction_for_day": "Monday",
    "generated_at_ist": "14:30",
    "agent": "PREDICTOR_PM",
    "data_file_read": "data/...",
    "pre_file_read": "data/..."
  },
  "prediction": {
    "call": "GAP_DOWN_WEAK",
    "direction": "down",
    "sensex_range_pts": "-200 to +150",
    "nifty_range_pts": "-60 to +45",
    "pct_range": "-0.25% to +0.20%",
    "confidence": "HIGH or MEDIUM or LOW",
    "predictability_tier": "P1 or P2 or P3 or P4",
    "tier_reason": "one sentence"
  },
  "dominant_factor": {
    "id": "FACTOR_ID",
    "name": "Human readable name",
    "adjusted_weight": 8,
    "signal": "BEARISH",
    "reason": "2-3 sentences why this is the most impactful factor right now"
  },
  "pre_status": {
    "active": false,
    "confidence": "NONE",
    "description": "",
    "scenario_a": null,
    "scenario_b": null,
    "base_case": null,
    "floor_volatility_pct": null
  },
  "factor_ranking": [
    {
      "rank": 1,
      "id": "FACTOR_ID",
      "name": "Factor Name",
      "adjusted_weight": 9,
      "base_weight": 7,
      "weight_change_reason": "R4 FII streak trigger active 8 days 4200 crore",
      "signal": "BEARISH",
      "value": "FII sold 4200 crore. 8 consecutive selling days.",
      "impact": "Auto-BEARISH triggered. Streak above 7-day threshold."
    }
  ],
  "v2_refinements_applied": {
    "R1_applied": false,
    "R1_details": "",
    "R2_applied": false,
    "R2_details": "",
    "R3_applied": false,
    "R3_details": "",
    "R4_applied": true,
    "R4_details": "FII selling 8 consecutive days total 28400 crore. Auto-weight 9 BEARISH."
  },
  "historical_analogues": [
    {
      "analogue_id": "L",
      "name": "IRAN WAR SUSTAINED",
      "date": "March 2026",
      "similarity": "Active war regime crude elevated FII selling",
      "key_difference": "Ceasefire now active though fragile. US tech rally partially offsets.",
      "historical_sensex_move": "-2.9%",
      "relevance_score": 8
    }
  ],
  "macro_regime_active": {
    "regime_name": "Iran War Hormuz Blockade",
    "bearish_multiplier_applied": true,
    "crude_weight_boost": 2,
    "macro_regime_effective_weight": 7
  },
  "watch_variables": [
    {
      "variable": "Trump Truth Social Iran Hormuz",
      "check_time": "Saturday and Sunday all day",
      "bullish_signal": "Deal or Hormuz opening signals Gap-up 2 to 3 percent",
      "bearish_signal": "Escalation or bombing threats Gap-down 2 to 4 percent",
      "priority": "HIGHEST"
    }
  ],
  "internal_reasoning": "3-4 sentence paragraph explaining the dominant factor, supporting factors, PRE status, analogue used, and confidence rationale. This is for the evaluator agent — not shown in WhatsApp."
}
```

## WHATSAPP MESSAGE FORMAT

Write to output/{YYYY}/{MM}/{DATE}_pm_whatsapp.txt

Rules: Under 900 characters. Plain text and emojis only. No markdown. Specific numbers only.

Template:
```
🔔 BAZAAR INTELLIGENCE · 2:30 PM
📅 Predicting: {DAY}, {DATE}

{VERDICT_EMOJI} VERDICT: {CALL_LABEL} {DIRECTION_EMOJI}
📊 Nifty: {nifty_range} pts  |  Sensex: {sensex_range} pts
📈 Move estimate: {pct_range}
🎯 Confidence: {CONFIDENCE} · {TIER}

🔑 WHY:
{dominant_factor_name}: {1-2 line plain English reason}
{supporting_factor if weight above 6}: {1 line}

{INCLUDE ONLY IF PRE ACTIVE:}
⚡ PENDING EVENT:
{authority} — {deadline}
• {scenario_a_pct}% chance: {outcome_a} → {impact_a}
• {scenario_b_pct}% chance: {outcome_b} → {impact_b}
• {base_case_pct}% base case: {base_outcome}

👁 WATCH BEFORE OPEN:
• {watch_1}
• {watch_2}
• {watch_3}

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

Direction emojis: rise = 📈, fall = 📉, uncertain = ⚡

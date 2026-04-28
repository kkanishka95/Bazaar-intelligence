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

---

### PRE-FIRST SCAN — MANDATORY. RUNS BEFORE ALL OTHER STEPS.

This block runs before data collection, before factor ranking, before everything.
It cannot be skipped. If you skip this block, the prediction is invalid.

#### PART A — NAMED AUTHORITY SCAN

Run these 5 searches in order. Do not proceed to Part B until all 5 are done.
Replace {DATE} and {DATE+1} with today's date and tomorrow's date.

Search 1: "Trump Truth Social Iran statement tonight {DATE}"
Search 2: "Fed Reserve RBI OPEC emergency meeting announcement {DATE}"
Search 3: "Iran US ceasefire proposal response deadline {DATE} {DATE+1}"
Search 4: "India government RBI SEBI announcement after market hours {DATE}"
Search 5: "geopolitical deadline decision expected overnight {DATE}"

For each search result, apply the PRE THREE-CONDITION TEST:
  Condition 1: Is there a NAMED AUTHORITY with market-moving power?
               (US President, Fed Chair, RBI Governor, India PM/FM,
               Iranian Supreme Leader, OPEC Sec-Gen, Supreme Court)
  Condition 2: Is there a SPECIFIC TIMEFRAME that falls within the
               India overnight window? (after 3:30 PM IST today through
               9:15 AM IST tomorrow)
  Condition 3: Does the event have at least TWO possible outcomes that
               produce OPPOSITE market directions for India?

If ALL THREE conditions are met → PRE IS CONFIRMED. Go to Part B.
If TWO conditions are met → PRE IS PROBABLE. Go to Part B with MEDIUM confidence.
If ONE or ZERO conditions met → No PRE. Record "PRE SCAN: CLEAR — no qualifying
  event detected. Searched: [list the 5 queries]." Then proceed to Step 1.

IMPORTANT: You must explicitly state the result of this scan every time.
"PRE SCAN: CLEAR" is as important as "PRE SCAN: CONFIRMED."
Never silently skip this block.

#### PART B — ACTIVE REGIME OVERNIGHT CHECK

This runs whenever MACRO_REGIME factor weight is above 5 (i.e., whenever
an active geopolitical or macro regime is in force — Iran war, trade war,
Fed tightening cycle, NBFC crisis, etc.)

Run these 2 searches:
Search 6: "[active regime key actors] meeting talks scheduled {DATE} {DATE+1}"
Search 7: "[active regime key actors] response statement expected {DATE} {DATE+1}"

Ask explicitly: "Is there any scheduled communication, deadline, meeting,
or expected response between the key parties in the active regime that
falls within the India overnight window?"

If YES → treat as a PRE (or upgrade an existing PROBABLE PRE to CONFIRMED).
If NO → record "REGIME OVERNIGHT CHECK: No scheduled resolution event
  in active [regime name] regime for tonight. Standard regime weighting applies."

#### PART C — PRE CLASSIFICATION AND SCENARIO MAPPING

If a PRE was confirmed in Part A or B:

Step C1: Name the PRE
  Entity: [named authority]
  Description: [what decision/announcement is pending]
  Deadline window: [specific timeframe]
  Resolution before India open: YES / POSSIBLY / UNLIKELY

Step C2: Map both scenarios
  Scenario A (positive outcome):
    - Outcome description
    - Estimated India market impact: [direction] [% range]
    - Historical analogue: [Analogue ID, date, actual move]

  Scenario B (negative outcome):
    - Outcome description
    - Estimated India market impact: [direction] [% range]
    - Historical analogue: [Analogue ID, date, actual move]

Step C3: Score the evidence
  List every available signal pointing toward Scenario A.
  List every available signal pointing toward Scenario B.
  Count them. The majority scenario is your committed call.
  If tied, the base case (no resolution) is your committed call.

Step C4: Set the confidence cap
  RULE: If PRE is confirmed AND resolution window overlaps with
  India overnight → confidence score is automatically capped at 55%.
  This cap overrides all other confidence calculations.
  It signals: "The factors point this way but a live binary event
  could override everything before India opens."

Step C5: Commit to a scenario
  Write one sentence: "PRE resolved internally. Committing to
  [Scenario A / Scenario B / No resolution (base case)] based on
  [N] signals in favour vs [N] against."
  This sentence appears in the JSON internal_reasoning field only.
  It does NOT appear in the WhatsApp message.
  From this point forward, the prediction is built on the committed scenario.

---

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

### STEP 7 — FINAL VALIDATION

Before writing outputs, verify:
1. Is the dominant factor the one with the highest adjusted_weight?
2. Does the prediction call match the dominant factor signal?
3. Is the WhatsApp message under 900 characters?
4. Does the circuit breaker include the magnitude of what changes?
   The circuit breaker must follow this exact format:

   If NO PRE was detected:
     ⚠️ ONLY CHANGES IF: [single specific event]
        → [direction] [magnitude range] · Analogue [ID + date]

   If PRE was detected and resolved internally:
     ⚠️ ONLY CHANGES IF: [the non-committed scenario triggers]
        → [direction] [magnitude range] · Analogue [ID + date]
     This line must name the specific event that would flip the call,
     not a category of events. "Geopolitical escalation" is not acceptable.
     "Trump rejects Iran proposal and announces new bombing deadline" is.

   The magnitude range in the circuit breaker must be derived from
   the closest historical analogue in analogues.json.
   Never write "large move" or "significant impact" — write the number.

### STEP 8 — GENERATE OUTPUTS
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
  "pre_first_scan_result": "CONFIRMED or PROBABLE or CLEAR",
  "pre_first_scan_searches": [
    "exact query 1",
    "exact query 2",
    "exact query 3",
    "exact query 4",
    "exact query 5"
  ],
  "regime_overnight_check": "No scheduled resolution event in active [regime] / [description of event found]",
  "pre_committed_scenario": "Scenario A / Scenario B / Base case / N/A",
  "pre_evidence_score": "3 bearish vs 1 bullish → committed bearish / N/A",
  "confidence_cap_applied": false,
  "confidence_cap_reason": "",
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
  "internal_reasoning": "3-4 sentence paragraph explaining the dominant factor, supporting factors, PRE status, analogue used, and confidence rationale. First sentence must be the PRE committed scenario statement if a PRE was detected. This is for the evaluator agent — not shown in WhatsApp."
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

[IF NO PRE WAS DETECTED:]
⚠️ ONLY CHANGES IF: {single specific event} → {direction} {% range} · Analogue {ID}

[IF PRE WAS DETECTED — replace the ONLY CHANGES IF line with:]
⚡ PRE RESOLVED: Committing to {scenario label}
{Main call stands as written above}
⚠️ FLIPS IF: {non-committed scenario specific event}
   → {opposite direction} {% range} · Analogue {ID}

{INCLUDE ONLY IF PRE ACTIVE — keep the PENDING EVENT block:}
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

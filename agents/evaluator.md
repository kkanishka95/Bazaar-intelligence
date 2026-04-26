# EVALUATOR AGENT — 4:30 PM DAILY SCORING
# Scores yesterday's PM prediction and today's AM prediction against actual outcomes
# Generates detailed pinpointed feedback with technical reasoning
# This is the learning signal that feeds the quarterly review

## NOTE ON TIMING
At 4:30 PM today, you are scoring TWO predictions:
- YESTERDAY's PM prediction (predicted today's gap-open) — outcome now known
- TODAY's AM prediction (predicted today's intraday) — outcome now known
- TODAY's PM prediction (just generated at 2:30 PM) — outcome NOT yet known, do not score

## INPUTS (read these files before starting)
- predictions/{YYYY}/{MM}/{YESTERDAY}_pm.json (yesterday's PM prediction)
- predictions/{YYYY}/{MM}/{TODAY}_am.json (today's AM prediction)
- data/{YYYY}/{MM}/{TODAY}_pm_data.json (today's actual market data)

## STEP 1 — GATHER ACTUAL MARKET DATA
From today's pm_data.json, extract:
- Actual Nifty open (for scoring yesterday's PM gap prediction)
- Actual Nifty close (for scoring today's AM intraday prediction)
- Actual Sensex open and close
- Actual Nifty high and low intraday range
- Whether IT stocks recovered (for pattern validation)
- Actual FII/DII flows today
- Crude price and rupee at end of day

Also search:
- "Nifty Sensex closing price today {DATE}"
- "Nifty 50 opening price today {DATE}"
- "India stock market intraday movement today {DATE}"

## STEP 2 — SCORE YESTERDAY'S PM PREDICTION (gap-open accuracy)

### 2A — Gap Direction Score (0-3 points)
Compare predicted gap direction vs actual market open vs previous close:
- 3 points: Direction exactly right AND magnitude within predicted range
- 2 points: Direction right but magnitude outside predicted range
- 1 point: Predicted HIGH_VOLATILITY_UNCERTAIN and a large gap occurred either direction
- 0 points: Direction wrong

### 2B — Magnitude Accuracy Score (0-2 points)
- 2 points: Actual open within predicted % range
- 1 point: Actual open within 0.5% of predicted range boundary
- 0 points: Actual open outside range by more than 0.5%

### 2C — PRE Detection Score (0-2 points, only if PRE was active)
- 2 points: PRE correctly detected AND outcome scenario correctly identified
- 1 point: PRE detected but wrong scenario probability weighting
- 0 points: PRE not detected when it should have been, OR PRE flagged when none existed

### 2D — Dominant Factor Accuracy Score (0-3 points)
Was the dominant factor actually the thing that moved the market?
- 3 points: Dominant factor was clearly the actual driver of the gap
- 2 points: Dominant factor was a contributing driver but not the primary one
- 1 point: Dominant factor was relevant but a different factor drove the actual gap
- 0 points: Wrong dominant factor — different factor drove the actual outcome

### Total PM Score: 0-10 points
Thresholds: 8-10 = EXCELLENT, 5-7 = GOOD, 0-4 = POOR

## STEP 3 — SCORE TODAY'S AM PREDICTION (intraday accuracy)

### 3A — Opening Gap Score (0-3 points)
Compare Gift Nifty implied gap vs actual open:
- 3 points: Actual open within 0.2% of Gift Nifty implied level
- 2 points: Actual open within 0.4% of implied
- 1 point: Within 0.6%
- 0 points: More than 0.6% divergence (Gift Nifty was wrong or stale)

### 3B — Intraday Direction Score (0-3 points)
Did the market sustain or reverse as predicted?
- 3 points: Exactly matched predicted pattern (sustain/reverse/volatile)
- 2 points: Broadly correct but with different timing
- 1 point: Mixed — partially correct
- 0 points: Wrong pattern

### 3C — Suggested Approach Score (0-2 points)
Was BUY_OPEN / WAIT_15_MIN / FADE_GAP / STAY_FLAT the right call?
- 2 points: Correct approach would have been profitable
- 1 point: Correct approach but at wrong entry timing
- 0 points: Wrong approach (following prediction would have lost)

### 3D — Key Level Accuracy (0-2 points)
Did the market respect the predicted support/resistance levels?
- 2 points: Market tested and respected both key support and resistance
- 1 point: One level held, one didn't
- 0 points: Neither level was relevant to today's move

### Total AM Score: 0-10 points
Thresholds: 8-10 = EXCELLENT, 5-7 = GOOD, 0-4 = POOR

## STEP 4 — DETAILED FACTOR ANALYSIS

For each of the 13 factors in yesterday's PM prediction, evaluate:
- Was the factor correctly identified as active or inactive?
- Was the weight appropriate given what actually happened?
- Was the signal (BULLISH/BEARISH) correct?
- Was the impact statement accurate?

Classify each factor as:
- PERFECT: weight and signal were both exactly right
- OVERWEIGHTED: factor was given too much weight vs its actual impact
- UNDERWEIGHTED: factor was given too little weight vs its actual impact
- WRONG_SIGNAL: weight was reasonable but direction was wrong
- CORRECTLY_INACTIVE: factor was weight 0 and indeed irrelevant
- MISSED: an active factor was assigned weight 0 but should have been active

Record optimal_weight_in_hindsight for every factor. This feeds the quarterly weight calibration.

## STEP 5 — ROOT CAUSE ANALYSIS

For predictions with PM Score below 7 or AM Score below 7:
Conduct a detailed root cause analysis:
- What was the prediction failure mode?
- Was it a data quality issue (wrong input data)?
- Was it a weight calibration issue (right factor, wrong weight)?
- Was it a direction error (right factor, wrong signal)?
- Was it a timing issue (right call, wrong session)?
- Was it a genuine black swan (P4 event, no model could have caught it)?
- Was it a false alarm (predicted swing, none occurred)?
- Was it a data timing limitation (information only available after prediction cutoff)?
- What specific change would have fixed it?

## STEP 6 — STEP 0B NEW PARAMETER CHECK

Review the prediction run. Was any factor mentioned in the internal_reasoning
that is NOT in the 13-factor framework?
If yes: Document it as a new parameter candidate:
- What is it?
- How did it transmit to Indian markets?
- What base weight should it have?
- How many times has it appeared in previous runs? (check previous eval files)

## OUTPUT FORMAT

Write to feedback/{YYYY}/{MM}/{DATE}_eval.json:

```json
{
  "metadata": {
    "date": "YYYY-MM-DD",
    "generated_at_ist": "16:30",
    "agent": "EVALUATOR",
    "pm_prediction_scored": "{YESTERDAY}_pm.json",
    "am_prediction_scored": "{TODAY}_am.json"
  },
  "actual_market_data": {
    "nifty_open": "",
    "nifty_close": "",
    "nifty_high": "",
    "nifty_low": "",
    "nifty_open_vs_prev_close_pct": "",
    "nifty_intraday_direction": "UP or DOWN or VOLATILE",
    "sensex_open": "",
    "sensex_close": "",
    "fii_net_actual_crore": "",
    "crude_eod_usd": "",
    "inr_eod": ""
  },
  "pm_scoring": {
    "prediction_was_for": "today's open",
    "predicted_call": "GAP_DOWN_WEAK",
    "predicted_pct_range": "-0.25% to +0.20%",
    "actual_open_pct": "+0.63%",
    "direction_score": 0,
    "direction_score_max": 3,
    "direction_score_reason": "Predicted gap-down. Actual gap-up +0.63%.",
    "magnitude_score": 1,
    "magnitude_score_max": 2,
    "magnitude_score_reason": "Actual +0.63% outside predicted range but within 0.5% of upper boundary.",
    "pre_score": 2,
    "pre_score_max": 2,
    "pre_score_reason": "Background PRE correctly flagged. No new PRE materialized overnight.",
    "dominant_factor_score": 1,
    "dominant_factor_score_max": 3,
    "dominant_factor_score_reason": "Predicted CRUDE_OIL as dominant. Actual driver was US_MARKETS.",
    "total_pm_score": 4,
    "total_pm_score_max": 10,
    "pm_prediction_result": "POOR"
  },
  "am_scoring": {
    "gift_nifty_implied": "+0.63%",
    "actual_open_pct": "+0.58%",
    "gift_nifty_accuracy_score": 3,
    "gift_nifty_accuracy_max": 3,
    "predicted_intraday": "SUSTAIN",
    "actual_intraday": "SUSTAINED through 1PM then profit booking",
    "intraday_direction_score": 2,
    "intraday_direction_score_max": 3,
    "suggested_approach": "BUY_OPEN",
    "approach_outcome": "Profitable — Nifty opened at 24050 closed at 24180",
    "approach_score": 2,
    "approach_score_max": 2,
    "level_accuracy_score": 2,
    "level_accuracy_score_max": 2,
    "level_accuracy_reason": "24060 resistance tested and held as predicted.",
    "total_am_score": 9,
    "total_am_score_max": 10,
    "am_prediction_result": "EXCELLENT"
  },
  "factor_analysis": [
    {
      "factor_id": "CRUDE_OIL",
      "assigned_weight": 9,
      "optimal_weight_in_hindsight": 6,
      "signal_assigned": "BEARISH",
      "signal_correct": false,
      "classification": "OVERWEIGHTED",
      "technical_reasoning": "Brent at 104 is elevated but pulled back from 106.80 intraday high. The 4.4 dollar pullback signalled some de-escalation pressure. Weight of 9 assumed continued spike path.",
      "learning_signal": "During Hormuz blockade regime, check direction of crude move (falling vs rising) not just absolute level."
    }
  ],
  "root_cause_analysis": {
    "required": true,
    "pm_score_below_threshold": true,
    "failure_mode": "WEIGHT_CALIBRATION + DATA_TIMING",
    "technical_explanation": "The PM prediction was made at 2:30 PM when S&P 500 was only +0.7%. Intel earnings came after US market close (4 PM EST = 1:30 AM IST). Not available at India's 2:30 PM cutoff. Prediction was correctly pessimistic given available data.",
    "is_model_failure": false,
    "is_data_timing_limitation": true,
    "is_genuine_black_swan": false,
    "is_false_alarm": false,
    "recommended_fix": "For PM mode: Search specifically for US earnings announcements due after US market close. Flag as PENDING_EARNINGS_CATALYST."
  },
  "new_parameter_flags": [
    {
      "parameter_name": "US_SEMICONDUCTOR_EARNINGS_CATALYST",
      "description": "Major US chip company earnings directly transmit to Indian IT sector",
      "base_weight_suggestion": 5,
      "applies_when": "Major US semiconductor company reports earnings after US close",
      "transmission_mechanism": "Positive semiconductor results increase risk appetite for Indian IT stocks regardless of broader S&P 500 direction",
      "times_flagged_this_quarter": 1
    }
  ],
  "summary_for_quarterly_review": {
    "pm_score": 4,
    "am_score": 9,
    "prediction_quality": "AM EXCELLENT PM POOR",
    "key_learning": "Intel AMD earnings not in 2:30 PM data. Crude pullback direction should reduce weight when absolute level high but direction falling.",
    "factors_needing_attention": ["CRUDE_OIL weight calibration during falling-but-elevated phase"],
    "new_parameters_detected": 1
  }
}
```

Also write a human-readable summary to output/{YYYY}/{MM}/{DATE}_eval_summary.txt:

```
BAZAAR INTELLIGENCE — DAILY EVALUATION
Date: {DATE}
Generated: 4:30 PM IST

═══════════════════════════════════════
YESTERDAY'S PM PREDICTION SCORECARD
═══════════════════════════════════════
Prediction: {predicted_call} ({predicted_range})
Actual open: {actual_open_pct}
SCORE: {pm_score}/10 — {pm_result}

What went right: {2 lines}
What went wrong: {2 lines}
Root cause: {2 lines}

═══════════════════════════════════════
TODAY'S AM PREDICTION SCORECARD
═══════════════════════════════════════
Gift Nifty implied: {gift_nifty_implied}
Actual open: {actual_open_pct}
Intraday: Predicted {predicted_intraday} | Actual {actual_intraday}
Suggested: {suggested_approach} | Outcome: {approach_outcome}
SCORE: {am_score}/10 — {am_result}

═══════════════════════════════════════
FACTOR PERFORMANCE TODAY
═══════════════════════════════════════
{For each factor with classification not PERFECT:}
{FACTOR}: {classification} — {technical_reasoning_1_line}

═══════════════════════════════════════
NEW PARAMETERS DETECTED
═══════════════════════════════════════
{If any: parameter_name — description_1_line — suggested_weight}
{If none: NONE DETECTED}

═══════════════════════════════════════
CUMULATIVE SCORES THIS QUARTER
═══════════════════════════════════════
Sessions evaluated: {count}
Average PM score: {avg}/10
Average AM score: {avg}/10
Factors most often overweighted: {list}
Factors most often underweighted: {list}
New parameters flagged total: {count}
```

## RULES
- The eval.json file drives the quarterly review. Be precise and specific — not general.
- Every factor_analysis entry must have a real technical_reasoning, not boilerplate.
- learning_signal in each factor_analysis is the most important field. Write it as a rule for future predictions.
- optimal_weight_in_hindsight must be a number, not a range.
- Cumulative scores in eval_summary.txt: read previous eval files in feedback/{YYYY}/{MM}/ to compute running averages.

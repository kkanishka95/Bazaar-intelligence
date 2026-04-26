# BAZAAR INTELLIGENCE — MASTER FRAMEWORK
# Version: V2
# Last Updated: April 2026
# THIS FILE IS FOR HUMAN REFERENCE ONLY.
# Agents carry all logic in their own prompt files (agents/*.md).
# The authoritative machine-readable data is in factor_weights.json, analogues.json, historical_events.json.

---

## THE 13-FACTOR WEIGHTED MODEL

The model scores each of 13 factors on a 0–10 weight scale every session.
The highest-weight active factor is the DOMINANT FACTOR and determines the directional call.

### Factor 1 — CALENDAR_EVENT (base weight 10)
Scheduled events with near-100% swing hit rate: Union Budget, FOMC decision, RBI MPC, Election Results, US CPI print, F&O monthly expiry.
V2 Refinement R1 — SURPRISE DELTA: If VIX <14 AND market consensus >90% → reduce weight to 2–3 (market already priced in). If only one condition → reduce to 5–6.

### Factor 2 — PENDING_RESOLUTION_EVENT (base weight 10)
A named market-moving authority has publicly announced a decision due within 12–24 hours with binary opposite-direction market outcomes.
V2 Refinement R2: All 3 must be true: named authority + specific timeframe + binary outcome.
When confirmed: automatically becomes dominant factor. Call = HIGH_VOLATILITY_UNCERTAIN.

### Factor 3 — US_MARKETS_GIFT_NIFTY (base weight 8)
S&P 500 close is the best overnight gap predictor (60% of gaps track it).
Gift Nifty at 8:30 AM is accurate to ±0.3% for gap-open estimate.
Key rule: S&P falls >2% overnight → India gaps down 1–1.5% at open (90% reliability).

### Factor 4 — CRUDE_OIL (base weight 7, +2 during Iran war = effective 9)
India imports 85% of oil. Every $10 move = ₹1.2 lakh crore annual import bill change.
Weight scaling: Brent >100 in conflict → 8. Daily move >3% → 9. Brent >110 → 10.
IRAN WAR ACTIVE: +2 to base weight on all days.

### Factor 5 — FII_FLOW_TREND (base weight 7)
NSE daily FII/DII data. 5-day trend direction and acceleration.
V2 Refinement R4 — FII STREAK COUNTER:
- 7+ consecutive days selling >₹3000cr/day → auto-weight 9, auto-BEARISH
- 4–6 days selling → weight 7
- 1–3 days selling → weight 5
- Net buying → bullish weight scaling

### Factor 6 — RUPEE_DOLLAR (base weight 6)
INR/USD current level and intraday direction.
Key rule: Rupee falls >0.5% in one session → Nifty falls same session (near-perfect inverse).
IRAN WAR ACTIVE: bearish rupee signals amplified.

### Factor 7 — INDIA_VIX (base weight 6)
Market fear gauge. Levels: <12 coiled spring, 12–18 normal, 18–25 elevated, >25 panic (bounce imminent), >30 extreme floor imminent.
Also used in R1: VIX <14 is "low fear" condition that can downgrade CALENDAR_EVENT weight.

### Factor 8 — ASIAN_MARKETS (base weight 5)
Nikkei, Hang Seng, Shanghai, KOSPI.
Key rules: Nikkei fall >2% → India gap-down signal. Hang Seng fall >2% → China FII exit from India. Asian markets up >1% broadly → risk-on India follows.

### Factor 9 — EUROPEAN_MARKETS (base weight 4)
FTSE, DAX, CAC. Primary use at 2:30 PM IST as real-time proxy for US session direction.
Key rule: DAX down >1.5% at 2:30 PM IST → US likely opens negative → India gaps down tomorrow.
Note: Weight = 0 in AM mode (European markets not yet open at 8:30 AM IST).

### Factor 10 — DII_COUNTERBALANCE (base weight 4)
Domestic institutional investors (mutual funds, insurance, LIC). SIP floor.
Key rule: DII buying >₹4000cr slows crash speed but does NOT reverse direction.
SIP inflows are a mechanical floor — they do not create rallies, they dampen falls.

### Factor 11 — DMA_200_PROXIMITY (base weight 3)
Nifty within 2% of 200-day moving average = high-sensitivity zone.
Breaking below 200-DMA → algorithmic selling + FII stops activate.
Bouncing off 200-DMA → mechanical support buyers activate.

### Factor 12 — OPTIONS_EXPIRY_GAMMA (base weight 3, scales to 9)
Monthly F&O expiry = last Thursday of month. Amplifies existing trend 40–60%.
Weight scaling: Expiry day = 9. 1–2 days before = 7. 3–7 days before = 5. >7 days = 3.

### Factor 13 — MACRO_REGIME (base weight 3, effective weight 7 during Iran war)
Background multi-week theme that amplifies or mutes all other signals.
IRAN WAR ACTIVE: effective weight 7 (not 3). Bearish multiplier on all trades.
Regime end signals: Hormuz reopens, permanent ceasefire, Iran nuclear deal, crude <$85 sustained.

---

## V2 REFINEMENTS SUMMARY

| Code | Name | Applies To | Trigger |
|------|------|------------|---------|
| R1 | Surprise Delta | CALENDAR_EVENT | VIX <14 AND consensus >90% → reduce weight |
| R2 | Named Authority PRE | PENDING_RESOLUTION_EVENT | All 3 PRE conditions met |
| R3 | RBI Consensus Calibration | CALENDAR_EVENT (RBI only) | RBI MPC consensus >90% → reduce weight. VIX >18 → restore |
| R4 | FII Streak Counter | FII_FLOW_TREND | 7+ days selling >₹3000cr → auto-weight 9 BEARISH |

---

## PREDICTION CALL VOCABULARY

| Call | Expected Move |
|------|--------------|
| GAP_UP_STRONG | > +1.5% |
| GAP_UP_MODERATE | +0.8% to +1.5% |
| GAP_UP_WEAK | +0.3% to +0.8% |
| FLAT | -0.3% to +0.3% |
| GAP_DOWN_WEAK | -0.3% to -0.8% |
| GAP_DOWN_MODERATE | -0.8% to -1.5% |
| GAP_DOWN_STRONG | < -1.5% |
| HIGH_VOLATILITY_UNCERTAIN | Active CONFIRMED or PROBABLE PRE |

---

## PREDICTABILITY TIERS

| Tier | Meaning |
|------|---------|
| P1 | Date known, swing near-certain, direction highly probable |
| P2 | Date known, swing near-certain, direction genuinely binary |
| P3 | Macro trend visible, direction probable, specific timing uncertain |
| P4 | No strong advance signal — black swan risk |

---

## AM MODE WEIGHT OVERRIDES

At 8:30 AM the following weights override the base weights (because more information is known):
- GIFT_NIFTY: weight 10 (replaces US futures — definitive gap signal)
- US_MARKETS_CLOSE: weight 9 (actual close now known)
- ASIAN_MARKETS: weight 7 (actual opens now known)
- EUROPEAN_MARKETS: weight 0 (not yet open at 8:30 AM IST)
- INDIA_VIX_PREMARKET: weight 7

---

## IRAN WAR REGIME MULTIPLIERS (active as of April 2026)

| Factor | Base Weight | War-Active Weight |
|--------|-------------|-------------------|
| CRUDE_OIL | 7 | 9 (+2) |
| MACRO_REGIME | 3 | 7 |
| FII_FLOW_TREND | 7 | bearish signals amplified |
| RUPEE_DOLLAR | 6 | weakness signals amplified |

---

## BACKTEST PERFORMANCE (V2)

- Swing detection rate: 95.7% (catches 95.7% of all ≥1.5% moves)
- Model precision: 91.7% (when model predicts a swing, it occurs 91.7% of the time)
- False alarm rate: 8.3%
- Black swan (P4) rate: 9.1% of swings (cannot be predicted by model design)
- Dataset: 60 verified events, 2014–2026

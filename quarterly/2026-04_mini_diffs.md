# MONTHLY MINI REVIEW — APRIL 2026
Generated: 2026-04-26

---

## MACRO REGIME CHANGES

### CHANGE — 3 items require updating in macro_regime.md

---

#### CHANGE 1: US Federal Reserve Rate — STALE DATA

**Current text in macro_regime.md:**
> US Fed: Holding. 2 cuts pencilled for 2025 (reduced from 4 in Dec 2024 guidance)

**What has changed:**
The Fed has already completed its cut cycle referenced in that entry. Current rate is **3.50–3.75%** (as of March 18, 2026 FOMC). Fed is holding at April 28–29 FOMC with no cut expected. J.P. Morgan outlook: hold for rest of 2026, potential 25bp hike in Q3 2027 if inflation persists. One cut still pencilled as median projection for 2026 but consensus is hold.

**Proposed replacement text:**
```
- US Fed: Holding at 3.50–3.75%. April 28–29 FOMC expected hold. Median Fed projection: one 25bp cut possible in H2 2026, but consensus tilts toward extended hold given Iran-driven energy inflation passthrough risk. J.P. Morgan base case: no cuts in 2026.
```

---

#### CHANGE 2: FII Net Flows YTD — STALE DATA

**Current text in macro_regime.md:**
> FII net sold 1.04 lakh crore in 2026 YTD

**What has changed:**
Total FII outflows for 2026 YTD have reached approximately **₹1.75 lakh crore** as of April 24. FIIs sold for 27 consecutive sessions until April 12 (outflows of ~₹1.6 lakh crore March 2 – April 9 alone). April 24 marked the **first net buying day in 7 weeks** (+₹999 crore / ~$106mn), breaking an 18-day consecutive selling streak. FPI confidence described as "still fragile" despite the reversal. DII support remains strong: ₹8.85 lakh crore purchased over the past 12 months vs FII net sold ₹3.8 lakh crore over same period.

**Proposed replacement text:**
```
- FII net sold ~₹1.75 lakh crore in 2026 YTD (as of April 24)
- April 24: First net buying day in 7 weeks (+₹999 crore) — 18-day consecutive selling streak broken. FPI confidence fragile; watch for follow-through buying week of April 28
- DII counterbalance strong: ₹8.85 lakh crore purchased in FY26 — structural floor holding
```

---

#### CHANGE 3: INR Level — MINOR RANGE EXPANSION

**Current text in macro_regime.md:**
> India rupee: 93 to 94 per USD (pre-war: 83 to 86)

**What has changed:**
USD/INR closed at **94.2625** on April 25 (Saturday, reflecting Friday April 24 close). The rate has breached the top of the stated 93–94 range. RBI has been selling dollars to limit volatility. INR is down 10.28% over 12 months. The stated range understates the current reality by approximately 25 paise.

**Proposed replacement text:**
```
- India rupee: 93 to 94.30 per USD (pre-war: 83 to 86); current level ~94.26 (April 24 close); RBI selling dollars to limit volatility
```

---

#### NO CHANGE — The following are confirmed accurate:
- Iran/Hormuz war regime: ACTIVE — ceasefire extended April 21 by Trump, both blockades remain, Islamabad Talks second round called off April 24. All consistent with macro_regime.md.
- Brent crude range 95–110: Confirmed. Brent at $105.33 on April 24, within stated range.
- RBI repo rate 5.25%: Confirmed. MPC met April 6–8, unanimously held unchanged. GDP projection for FY27 is 6.9% (separate from the 2026 GDP shock figure already in macro_regime.md).
- India VIX 18–22: Confirmed. Friday April 24 close at 18.36 — within stated range.
- Goldman Sachs India GDP cut to 5.9%: Confirmed, still standing.
- Trump Tariff Pause Regime 2: Still ACTIVE. No new tariff threat currently active.

---

## NEW PARAMETER CANDIDATES

No parameters reached the threshold of 2+ flags this month (only 1 eval session on record).

---

## WATCH LIST — Parameters Flagged Once

### US_SEMICONDUCTOR_EARNINGS_CATALYST (flagged 1 time)

- **First flagged:** 2026-04-25
- **Description:** Major US semiconductor/large-cap tech company earnings beats (Intel, Nvidia, AMD, TSMC, Microsoft, Google) directly drive Indian IT sector gap-open direction, independently of broader macro or Iran regime headwinds.
- **Suggested base weight:** 6
- **Applies when:** Major US semiconductor/tech company reports earnings after US market close — result available by India's 8:30 AM IST AM prediction window.
- **Transmission mechanism:** Strong semiconductor earnings → Nasdaq gap-up → Gift Nifty rises → Indian IT sector opens higher regardless of macro bearish overlay. Intel +23% on April 24 drove Nasdaq +1.63% and Gift Nifty +0.99% on April 25 morning. The effect is distinct from a broad S&P rally — narrow sector rallies have different sustainment profiles for Indian IT vs broad-based risk-on.
- **Why not in current framework:** US_MARKETS_GIFT_NIFTY already captures this as a composite factor. Separate sub-factor would enable the AM agent to distinguish (a) broad S&P rally vs (b) narrow tech/semiconductor rally, which have different intraday sustain probabilities for Nifty.
- **Recommendation:** MONITOR — flag again if seen in next 1–2 sessions. If flagged once more, escalate to CANDIDATE for Q2 quarterly review.

---

## CALIBRATION FLAGS (not new parameters — existing weight adjustments)

These were raised in the April 25 eval as structural observations worth tracking:

1. **CRUDE_OIL weight 9 when stable vs escalating:** The Iran war regime adds +2 to CRUDE_OIL base weight. Evaluator noted crude at $105.33 was stable (+0.30%), not actively rising. The +2 boost may be better conditioned on crude *rising* (≥+1% day) rather than merely *elevated*. Proposed refinement: weight 9 when crude rising; weight 7–8 when crude elevated-but-stable. Monitor over next 4 sessions before escalating to quarterly review.

2. **RUPEE_DOLLAR potential downgrade if FII continues buying:** Evaluator noted that FII net buying despite INR at 94.26 suggests USD return risk is not deterring all FII. If FII continues net buying week of April 28, RUPEE_DOLLAR weight 6 may overstate its drag — consider 5 in a stable-FII-inflow regime.

3. **INDIA_VIX data source discrepancy:** AM prediction used VIX 19.71 vs Friday close 18.36. Source of Saturday morning VIX estimate needs documentation in the AM agent's data pipeline. Not a weight issue — a data sourcing issue.

---

## ACTION ITEMS

- **Update macro_regime.md:** YES — 3 changes
  1. US Fed rate: update from "2 cuts pencilled for 2025" → "holding 3.50–3.75%, April 28–29 hold expected"
  2. FII YTD flows: update from ₹1.04L cr → ₹1.75L cr; add April 24 first net buying note
  3. INR range: expand from 93–94 to 93–94.30; note current 94.26 level
- **New parameters to add:** NO — 0 candidates (US_SEMICONDUCTOR_EARNINGS_CATALYST at 1 flag; threshold is 2)
- **Full quarterly review needed early:** NO — April data is severely limited (1 eval session, 0 fully scored). Recommend waiting for May data accumulation. Full Q2 review should incorporate April 28 outcome (first scored AM prediction).

---

## MONTH PERFORMANCE SUMMARY

- **Sessions evaluated:** 1 (2026-04-25 Saturday eval)
- **Sessions with full scoring:** 0
- **Sessions pending outcome:** 1 (AM prediction for April 28 scored after market close April 28)
- **Sessions not scored — missing file:** 1 (PM prediction for 2026-04-24 never generated)

- **Average PM score:** N/A — no PM predictions scored this month
- **Average AM score:** PENDING — April 28 outcome required

- **Highest scoring day:** N/A
- **Lowest scoring day:** N/A

- **Notable observation:** April is the first month with recorded eval data. The single session (Saturday April 25) evaluated an AM prediction for Monday April 28 with high pre-outcome internal consistency rating. PM agent gap on Fridays (when next trading day is Monday) is an open scheduling question — either document as intended behavior or fix scheduler.

---

## SCHEDULER GAP — ACTION REQUIRED

The April 25 eval flagged a gap: **no PM prediction was generated on Friday April 24, 2026.** Two possibilities:

1. PM agent correctly skips Fridays when next trading day is Monday, deferring to Saturday AM agent — if so, document this as **intentional design**.
2. PM agent execution failed on April 24 — if so, **fix scheduler**.

The existence of a Saturday AM prediction (2026-04-25_am.json) for Monday April 28 suggests option 1 may be by design. Human review required to confirm and document the scheduling policy.

---

*Sources used for macro regime check:*
- [Iran ceasefire — Al Jazeera](https://www.aljazeera.com/news/2026/4/21/trump-announces-extending-iran-ceasefire-but-says-blockade-remains)
- [Iran ships seized — NBC News](https://www.nbcnews.com/world/iran/live-blog/live-updates-iran-trump-ceasefire-hormuz-attack-peace-talks-israel-rcna341361)
- [RBI April 2026 policy — SCC Online](https://www.scconline.com/blog/post/2026/04/10/repo-rate-unchanged-rbi-monetary-policy-april-2026/)
- [US Fed rate outlook — St. Louis Fed](https://www.stlouisfed.org/from-the-president/remarks/2026/economic-outlook-monetary-policy-aei)
- [FII flows April 2026 — Business Today](https://www.businesstoday.in/latest/economy/story/india-sees-first-inflows-of-106-mn-in-7-weeks-but-fpi-confidence-still-fragile-report-527326-2026-04-24)
- [Brent crude April 24 — Oil Price API](https://www.oilpriceapi.com/live/brent-crude-oil-price)
- [USD/INR — Pound Sterling Live](https://www.poundsterlinglive.com/history/USD-INR-2026)
- [Geopolitical risk India April 2026 — S&P Global](https://www.spglobal.com/market-intelligence/en/news-insights/research/2026/04/geopolitical-risk-brief-april-2026)

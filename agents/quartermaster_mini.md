# QUARTERMASTER MINI — MONTHLY REVIEW
# Runs first trading day of each month
# Narrow scope: NEW PARAMETERS only + MACRO REGIME updates
# Fast run — does not do full factor weight analysis

## INPUTS
- All feedback/{YYYY}/{MM}/*_eval.json from the past month
- knowledge/macro_regime.md
- Web search for current macro status

## STEP 1 — AGGREGATE NEW PARAMETER FLAGS
Read all eval.json files from the past month.
Collect all entries in new_parameter_flags arrays.
Group by parameter_name.
For any parameter flagged 2 or more times:
- It is a CANDIDATE for formal inclusion
- Document: name, description, suggested_weight, transmission_mechanism, times_flagged

## STEP 2 — MACRO REGIME CHECK
Search for:
1. "Iran Hormuz war ceasefire status today {DATE}"
2. "India RBI monetary policy current rate {DATE}"
3. "US Federal Reserve current rate outlook {DATE}"
4. "India FII flows trend current month"
5. "Brent crude oil current price trend"
6. "Indian rupee dollar current level trend"
7. "Any new geopolitical event affecting India {MONTH YEAR}"

Compare findings against current macro_regime.md.
Identify: what has changed? what is the same?

## STEP 3 — GENERATE MINI DIFFS

Write to quarterly/{YYYY-MM}_mini_diffs.md:

```
# MONTHLY MINI REVIEW — {MONTH YEAR}
Generated: {DATE}

## MACRO REGIME CHANGES
### CHANGE or NO CHANGE
{If change: what changed and what the updated text should be}
{If no change: "Regime unchanged. macro_regime.md accurate."}

## NEW PARAMETER CANDIDATES
### {Parameter Name} (flagged {N} times)
- Description: {description}
- Suggested base weight: {weight}
- Transmission mechanism: {how it affects India}
- Apply to which factors: {factor ranking position}
- Recommendation: ADD TO FRAMEWORK or MONITOR FURTHER

## ACTION ITEMS
- Update macro_regime.md: YES/NO
- New parameters to add: YES/NO — {count}
- Full quarterly review needed early: YES/NO — {reason if yes}

## MONTH PERFORMANCE SUMMARY
- Sessions evaluated: {count}
- Average PM score: {avg}/10
- Average AM score: {avg}/10
- Highest scoring day: {date} — {scores}
- Lowest scoring day: {date} — {scores} — {brief reason}
```

## RULES
- This is a FAST review. Do not re-analyse factor weights (that is for quarterly full).
- If macro_regime.md needs updating, write the proposed new text in full in the MACRO REGIME CHANGES section.
- Do NOT apply changes to knowledge/ files directly. Only document proposed changes.
- The ACTION ITEMS section drives what the human does after reading this review.
- If a new parameter was flagged only once, still list it under a separate "WATCH LIST" section for awareness.
- Month performance summary: read all eval.json files to compute averages.

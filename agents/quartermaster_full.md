# QUARTERMASTER FULL — QUARTERLY REVIEW
# Runs first trading day of each quarter (April 1, July 1, October 1, January 1)
# Full scope: factor weights, dataset additions, analogue updates, structural changes
# Output: human-readable diffs for review + structured JSON for PR generation

## INPUTS
- All feedback/{YYYY}/{QN months}/**/*_eval.json (3 months of evaluations)
- All quarterly/{YYYY-MM}_mini_diffs.md (3 monthly mini reviews)
- knowledge/factor_weights.json
- knowledge/historical_events.json
- knowledge/analogues.json
- knowledge/macro_regime.md
- Web search for quarter's major market events

## STEP 1 — AGGREGATE QUARTER'S EVALUATION DATA

Compile from all eval.json files:
- Total sessions evaluated
- Average PM score and AM score
- Distribution of PM scores (0-4, 5-7, 8-10)
- Distribution of AM scores (0-4, 5-7, 8-10)
- Per-factor statistics:
  * Times classified as OVERWEIGHTED
  * Times classified as UNDERWEIGHTED
  * Times classified as WRONG_SIGNAL
  * Times classified as MISSED
  * Average optimal_weight_in_hindsight vs assigned base_weight
- All new_parameter_flags from the quarter
- All root_cause_analysis entries

## STEP 2 — SEARCH FOR MISSED EVENTS

Search for all >=1.5% Nifty/Sensex single-day moves in the quarter:
1. "Nifty biggest single day moves {QUARTER YEAR}"
2. "Sensex largest daily moves {QUARTER YEAR}"
3. "Indian stock market major events {QUARTER YEAR}"

For each event found:
- Is it in the eval.json files? (was it scored?)
- If not scored: was it a genuine black swan (P4) or a model failure?
- Should it be added to historical_events.json?

## STEP 3 — FACTOR WEIGHT ANALYSIS

For each of the 13 factors, compare:
- Current base_weight in factor_weights.json
- Average optimal_weight_in_hindsight from eval.json files this quarter
- Difference: (optimal - current)

Flag for weight change if:
- Difference is consistently above +1.5 (consistently underweighted)
- Difference is consistently below -1.5 (consistently overweighted)
- Wrong signal classification appears in more than 30% of sessions factor was active

Propose new base_weight as: average of (current + optimal_hindsight) rounded to nearest 0.5

## STEP 4 — NEW ANALOGUE ASSESSMENT

Review all events this quarter with sensex_pct above 2.5% or below -2.5%.
For any event NOT covered by existing 13 analogues:
- Is it structurally new (new transmission mechanism)?
- Does it need its own analogue entry?
- Or does it map to an existing analogue with updated parameters?

## STEP 5 — GENERATE HUMAN-READABLE DIFFS

Write to quarterly/{YYYY-QN}_full_diffs.md:

```
# QUARTERLY FULL REVIEW — {QUARTER YEAR}
Generated: {DATE}
Evaluated: {N} sessions | PM avg: {score}/10 | AM avg: {score}/10

═══════════════════════════════════════════════════════════════
SECTION A — FACTOR WEIGHT CHANGES
(Review each proposed change and mark APPROVE or REJECT)
═══════════════════════════════════════════════════════════════

### A1 — CHANGE: {FACTOR_ID} weight {OLD} → {NEW}
Reason: Overweighted in {N}/{total} sessions this quarter.
Average optimal weight in hindsight: {avg}.
Evidence: {3 specific evaluation dates with brief context}
Risk of change: {what could go wrong if weight reduced}
[ ] APPROVE  [ ] REJECT  [ ] MODIFY TO: ___

### A2 — NO CHANGE: {FACTOR_ID} weight stays {CURRENT}
Reason: Only {N}/{total} sessions showed deviation. Within acceptable variance.

═══════════════════════════════════════════════════════════════
SECTION B — NEW PARAMETERS TO ADD
(Review each and mark APPROVE or REJECT)
═══════════════════════════════════════════════════════════════

### B1 — ADD: {PARAMETER_NAME} as Factor 14
Flagged: {N} times this quarter across {dates}
Description: {description}
Proposed base weight: {weight}
Transmission mechanism: {mechanism}
V2 refinement needed: {yes/no and which refinement}
Historical evidence from this quarter: {2-3 sentences}
[ ] APPROVE — Add to factor_weights.json  [ ] REJECT  [ ] MONITOR ANOTHER QUARTER

═══════════════════════════════════════════════════════════════
SECTION C — HISTORICAL EVENTS DATASET ADDITIONS
(Review each and mark APPROVE or REJECT)
═══════════════════════════════════════════════════════════════

### C1 — ADD EVENT: {DATE} {MOVE_PCT}% {DIRECTION}
Event: {description}
Category: {category}
Dominant factor: {factor_id}
Result: {FULL_HIT or VOLATILE_HIT or BLACK_SWAN}
Tier: {P1/P2/P3/P4}
[ ] APPROVE — Add to historical_events.json  [ ] REJECT

═══════════════════════════════════════════════════════════════
SECTION D — ANALOGUE LIBRARY UPDATES
═══════════════════════════════════════════════════════════════

### D1 — ADD NEW ANALOGUE: {NAME}
From event: {date} {pct}%
Trigger pattern: {description}
Map to future: {what future events this explains}
[ ] APPROVE — Add to analogues.json  [ ] REJECT

### D2 — UPDATE EXISTING ANALOGUE: {ID} {NAME}
Change: {what to update}
Reason: {why}
[ ] APPROVE  [ ] REJECT

═══════════════════════════════════════════════════════════════
SECTION E — MACRO REGIME UPDATE
═══════════════════════════════════════════════════════════════

{Full proposed new text for macro_regime.md}

[ ] APPROVE AS WRITTEN  [ ] APPROVE WITH EDITS  [ ] REJECT

═══════════════════════════════════════════════════════════════
APPROVAL INSTRUCTIONS
═══════════════════════════════════════════════════════════════

1. Review each item above and mark APPROVE or REJECT
2. For MODIFY items, write the modification in the blank
3. Run: ./scripts/apply_quarterly_diffs.sh {YYYY-QN}
4. Claude Code will apply only APPROVED changes and generate a GitHub PR
5. Review the PR in GitHub and merge to apply to all future agent runs
```

## STEP 6 — GENERATE STRUCTURED DIFFS JSON

Write to quarterly/{YYYY-QN}_full_diffs.json:

```json
{
  "quarter": "YYYY-QN",
  "generated": "YYYY-MM-DD",
  "diffs": [
    {
      "id": "A1",
      "type": "FACTOR_WEIGHT_CHANGE",
      "file": "knowledge/factor_weights.json",
      "field_path": "factors[id=CRUDE_OIL].base_weight",
      "old_value": 7,
      "new_value": 6,
      "reason": "Overweighted in 12 of 18 active sessions. Average optimal weight 5.8.",
      "approval_status": "PENDING"
    },
    {
      "id": "B1",
      "type": "NEW_FACTOR_ADD",
      "file": "knowledge/factor_weights.json",
      "operation": "ADD_TO_FACTORS_ARRAY",
      "new_entry": {
        "id": "US_SEMICONDUCTOR_EARNINGS",
        "name": "US Semiconductor Earnings Catalyst",
        "base_weight": 5,
        "description": "Major US chip company earnings Intel AMD Nvidia transmit to Indian IT",
        "applies_when": "Major US semiconductor earnings announced after US close",
        "v2_refinement": "NONE"
      },
      "approval_status": "PENDING"
    },
    {
      "id": "C1",
      "type": "HISTORICAL_EVENT_ADD",
      "file": "knowledge/historical_events.json",
      "operation": "ADD_TO_EVENTS_ARRAY",
      "new_entry": {
        "date": "YYYY-MM-DD",
        "year": 2026,
        "sensex_pct": -1.27,
        "nifty_pct": -1.14,
        "direction": "fall",
        "event": "Description of the event",
        "category": "Geopolitical",
        "result": "FULL_HIT",
        "tier": "P3",
        "dominant_factor": "CRUDE_OIL"
      },
      "approval_status": "PENDING"
    }
  ]
}
```

## RULES
- The full_diffs.md is designed for human review. Every APPROVE/REJECT decision is the human's — never auto-approve.
- The full_diffs.json is machine-readable for apply_quarterly_diffs.sh. Keep field_path values precise.
- approval_status in JSON is always "PENDING" when first generated. The apply script reads the .md for actual approvals.
- Do NOT apply any changes to knowledge/ files in this run. Output only.
- Write PR description to quarterly/{YYYY-QN}_pr_description.md summarising all changes.
- Minimum 3 months of eval data needed. If fewer: note the gap and proceed with available data.

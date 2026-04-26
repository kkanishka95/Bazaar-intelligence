#!/bin/bash
# Run Quartermaster Mini — Monthly Review
# Usage: ./scripts/run_quarterly_mini.sh [YYYY-MM]
# Runs first trading day of each month

YEARMONTH=${1:-$(date +%Y-%m)}
YEAR=$(echo $YEARMONTH | cut -d'-' -f1)
MONTH=$(echo $YEARMONTH | cut -d'-' -f2)

mkdir -p quarterly

echo "📅 Running Monthly Mini Review — $YEARMONTH"

# FIX 3 — corrected glob (spec had *.eval.json, evaluator writes *_eval.json)
EVAL_FILES=$(ls feedback/$YEAR/$MONTH/*_eval.json 2>/dev/null | tr '\n' ' ')
if [ -z "$EVAL_FILES" ]; then
    echo "⚠️  No evaluation files found for $YEARMONTH in feedback/$YEAR/$MONTH/"
    exit 1
fi

echo "Found $(ls feedback/$YEAR/$MONTH/*_eval.json | wc -l | tr -d ' ') evaluation files"

claude --dangerously-skip-permissions --allowedTools "WebSearch,Read,Write" --print "You are the QUARTERMASTER MINI agent for Bazaar Intelligence.
Read your full prompt from agents/quartermaster_mini.md.
REVIEW_PERIOD: $YEARMONTH
Read evaluation files from: feedback/$YEAR/$MONTH/
Read current macro regime from: knowledge/macro_regime.md
Aggregate all new_parameter_flags. Check macro regime for changes.
Write mini review to: quarterly/${YEARMONTH}_mini_diffs.md"

echo ""
echo "✅ Monthly mini review complete: quarterly/${YEARMONTH}_mini_diffs.md"
cat quarterly/${YEARMONTH}_mini_diffs.md

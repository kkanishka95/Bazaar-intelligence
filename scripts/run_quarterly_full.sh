#!/bin/bash
# Run Quartermaster Full — Quarterly Review
# Usage: ./scripts/run_quarterly_full.sh [YYYY-QN]
# Example: ./scripts/run_quarterly_full.sh 2026-Q2
# Runs first trading day of each quarter

QUARTER=${1:-"$(date +%Y)-Q$(( ($(date +%-m) - 1) / 3 + 1 ))"}
YEAR=$(echo $QUARTER | cut -d'-' -f1)

mkdir -p quarterly

echo "🔬 Running Full Quarterly Review — $QUARTER"

# FIX 8 — recursive file discovery across all monthly subdirectories
EVAL_FILES=$(find feedback/$YEAR -name "*_eval.json" 2>/dev/null | sort | tr '\n' ' ')
if [ -z "$EVAL_FILES" ]; then
    echo "⚠️  No evaluation files found for $YEAR in feedback/$YEAR/"
    exit 1
fi

EVAL_COUNT=$(find feedback/$YEAR -name "*_eval.json" 2>/dev/null | wc -l | tr -d ' ')
echo "Found $EVAL_COUNT evaluation files across $YEAR"

claude --dangerously-skip-permissions --allowedTools "WebSearch,Read,Write" --print "You are the QUARTERMASTER FULL agent for Bazaar Intelligence.
Read your full prompt from agents/quartermaster_full.md.
QUARTER: $QUARTER
Evaluation files to read: $EVAL_FILES
Read all mini diffs from: quarterly/ (files matching ${YEAR}*_mini_diffs.md)
Read knowledge files:
  knowledge/factor_weights.json
  knowledge/historical_events.json
  knowledge/analogues.json
  knowledge/macro_regime.md
Conduct the full quarterly analysis.
Write human-readable diffs to: quarterly/${QUARTER}_full_diffs.md
Write structured diffs JSON to: quarterly/${QUARTER}_full_diffs.json
Write PR description to: quarterly/${QUARTER}_pr_description.md"

echo ""
echo "✅ Full quarterly review complete"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 REVIEW READY FOR YOUR APPROVAL:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat quarterly/${QUARTER}_full_diffs.md
echo ""
echo "To apply approved changes:"
echo "  ./scripts/apply_quarterly_diffs.sh $QUARTER"

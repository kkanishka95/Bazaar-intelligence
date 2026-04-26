#!/bin/bash
# Run Evaluator Agent
# Usage: ./scripts/run_evaluator.sh [YYYY-MM-DD]
# Runs at 4:30 PM IST after market close

DATE=${1:-$(date +%Y-%m-%d)}
YEAR=$(echo $DATE | cut -d'-' -f1)
MONTH=$(echo $DATE | cut -d'-' -f2)

YESTERDAY=$(date -d "$DATE - 1 day" +%Y-%m-%d 2>/dev/null || date -v-1d -j -f "%Y-%m-%d" "$DATE" +%Y-%m-%d)
YESTERDAY_YEAR=$(echo $YESTERDAY | cut -d'-' -f1)
YESTERDAY_MONTH=$(echo $YESTERDAY | cut -d'-' -f2)

mkdir -p feedback/$YEAR/$MONTH
mkdir -p output/$YEAR/$MONTH

echo "📋 Running Evaluator — Scoring date: $DATE"
echo "  Scoring yesterday's PM: $YESTERDAY"
echo "  Scoring today's AM: $DATE"

claude --dangerously-skip-permissions --allowedTools "WebSearch,Read,Write" --print "You are the EVALUATOR agent for Bazaar Intelligence.
Read your full prompt from agents/evaluator.md.
SCORING_DATE: $DATE
YESTERDAY: $YESTERDAY
Read yesterday PM prediction: predictions/$YESTERDAY_YEAR/$YESTERDAY_MONTH/${YESTERDAY}_pm.json
Read today AM prediction: predictions/$YEAR/$MONTH/${DATE}_am.json
Read today market data: data/$YEAR/$MONTH/${DATE}_pm_data.json
Also search for actual Nifty Sensex open and close prices for $DATE.
Score both predictions with detailed pinpointed technical reasoning.
Write evaluation JSON to: feedback/$YEAR/$MONTH/${DATE}_eval.json
Write human-readable summary to: output/$YEAR/$MONTH/${DATE}_eval_summary.txt"

echo ""
echo "✅ Evaluation complete"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 EVALUATION SUMMARY:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat output/$YEAR/$MONTH/${DATE}_eval_summary.txt

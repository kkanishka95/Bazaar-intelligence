#!/bin/bash
# Run PM Predictor Agent
# Usage: ./scripts/run_predictor_pm.sh [YYYY-MM-DD]
# Runs at 2:30 PM IST — predicts TOMORROW's gap open

DATE=${1:-$(date +%Y-%m-%d)}
YEAR=$(echo $DATE | cut -d'-' -f1)
MONTH=$(echo $DATE | cut -d'-' -f2)

# Calculate tomorrow's date (macOS and Linux compatible)
TOMORROW=$(date -d "$DATE + 1 day" +%Y-%m-%d 2>/dev/null || date -v+1d -j -f "%Y-%m-%d" "$DATE" +%Y-%m-%d)

mkdir -p predictions/$YEAR/$MONTH
mkdir -p output/$YEAR/$MONTH

echo "📊 Running PM Predictor — Today: $DATE | Predicting: $TOMORROW"

# Check data file exists
if [ ! -f "data/$YEAR/$MONTH/${DATE}_pm_data.json" ]; then
    echo "⚠️  Data file not found. Running data collector first..."
    ./scripts/run_data_collector.sh pm $DATE
fi

# Check PRE file exists
if [ ! -f "data/$YEAR/$MONTH/${DATE}_pre.json" ]; then
    echo "⚠️  PRE file not found. Running PRE monitor first..."
    ./scripts/run_pre_monitor.sh $DATE
fi

# FIX 5 — null-field guard: abort if too many critical fields are null
python3 -c "
import json, sys
try:
    d = json.load(open('data/$YEAR/$MONTH/${DATE}_pm_data.json'))
    nulls = [k for k,v in d['india_markets'].items() if v is None]
    if len(nulls) > 5:
        print(f'ERROR: {len(nulls)} null fields in india_markets. Data collection likely failed. Aborting prediction.')
        sys.exit(1)
    print(f'Data validation passed. {len(nulls)} null fields in india_markets.')
except Exception as e:
    print(f'ERROR: Could not read data file: {e}')
    sys.exit(1)
" || exit 1

claude --dangerously-skip-permissions --allowedTools "WebSearch,Read,Write" --print "You are the PREDICTOR PM agent for Bazaar Intelligence.
Read your full prompt from agents/predictor_pm.md.
TODAY: $DATE
PREDICTING FOR: $TOMORROW
Read data from: data/$YEAR/$MONTH/${DATE}_pm_data.json
Read PRE from: data/$YEAR/$MONTH/${DATE}_pre.json
Read knowledge files from: knowledge/
Write prediction JSON to: predictions/$YEAR/$MONTH/${DATE}_pm.json
Write WhatsApp message to: output/$YEAR/$MONTH/${DATE}_pm_whatsapp.txt
Apply all V2 refinements. Rank all 13 factors. Use the full framework."

echo ""
echo "✅ PM Prediction complete"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 WHATSAPP MESSAGE (copy and send to group):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat output/$YEAR/$MONTH/${DATE}_pm_whatsapp.txt
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

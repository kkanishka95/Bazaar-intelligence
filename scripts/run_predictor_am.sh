#!/bin/bash
# Run AM Predictor Agent
# Usage: ./scripts/run_predictor_am.sh [YYYY-MM-DD]
# Runs at 8:30 AM IST — predicts TODAY's intraday movement

DATE=${1:-$(date +%Y-%m-%d)}
YEAR=$(echo $DATE | cut -d'-' -f1)
MONTH=$(echo $DATE | cut -d'-' -f2)

# Calculate yesterday's date (macOS and Linux compatible)
YESTERDAY=$(date -d "$DATE - 1 day" +%Y-%m-%d 2>/dev/null || date -v-1d -j -f "%Y-%m-%d" "$DATE" +%Y-%m-%d)
YESTERDAY_YEAR=$(echo $YESTERDAY | cut -d'-' -f1)
YESTERDAY_MONTH=$(echo $YESTERDAY | cut -d'-' -f2)

mkdir -p predictions/$YEAR/$MONTH
mkdir -p output/$YEAR/$MONTH

echo "🌅 Running AM Predictor — Date: $DATE"
echo "Reading yesterday's PM prediction: $YESTERDAY"

# Check AM data file
if [ ! -f "data/$YEAR/$MONTH/${DATE}_am_data.json" ]; then
    echo "⚠️  AM data file not found. Running data collector first..."
    ./scripts/run_data_collector.sh am $DATE
fi

# Check PRE file
if [ ! -f "data/$YEAR/$MONTH/${DATE}_pre.json" ]; then
    echo "ℹ️  No PRE file for today. Running PRE monitor..."
    ./scripts/run_pre_monitor.sh $DATE
fi

# FIX 5 — null-field guard: abort if too many critical fields are null
python3 -c "
import json, sys
try:
    d = json.load(open('data/$YEAR/$MONTH/${DATE}_am_data.json'))
    nulls = [k for k,v in d['india_markets'].items() if v is None]
    if len(nulls) > 5:
        print(f'ERROR: {len(nulls)} null fields in india_markets. Data collection likely failed. Aborting prediction.')
        sys.exit(1)
    print(f'Data validation passed. {len(nulls)} null fields in india_markets.')
except Exception as e:
    print(f'ERROR: Could not read AM data file: {e}')
    sys.exit(1)
" || exit 1

YESTERDAY_PM_FILE="predictions/$YESTERDAY_YEAR/$YESTERDAY_MONTH/${YESTERDAY}_pm.json"
if [ ! -f "$YESTERDAY_PM_FILE" ]; then
    echo "ℹ️  No yesterday PM prediction found at $YESTERDAY_PM_FILE"
    YESTERDAY_PM_FILE="NOT_AVAILABLE"
fi

claude --dangerously-skip-permissions --allowedTools "WebSearch,Read,Write" --print "You are the PREDICTOR AM agent for Bazaar Intelligence.
Read your full prompt from agents/predictor_am.md.
TODAY: $DATE
Read AM data from: data/$YEAR/$MONTH/${DATE}_am_data.json
Read PRE from: data/$YEAR/$MONTH/${DATE}_pre.json
Read yesterday PM prediction from: $YESTERDAY_PM_FILE
Read knowledge files from: knowledge/
Gift Nifty level is your primary gap-open anchor.
Write prediction JSON to: predictions/$YEAR/$MONTH/${DATE}_am.json
Write WhatsApp message to: output/$YEAR/$MONTH/${DATE}_am_whatsapp.txt"

echo ""
echo "✅ AM Prediction complete"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 WHATSAPP MESSAGE (copy and send to group):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat output/$YEAR/$MONTH/${DATE}_am_whatsapp.txt
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

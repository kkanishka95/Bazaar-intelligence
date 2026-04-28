#!/bin/bash
# Run Data Collector Agent
# Usage: ./scripts/run_data_collector.sh [pm|am] [YYYY-MM-DD]
# Example: ./scripts/run_data_collector.sh pm 2026-04-27

MODE=${1:-pm}
DATE=${2:-$(date +%Y-%m-%d)}
YEAR=$(echo $DATE | cut -d'-' -f1)
MONTH=$(echo $DATE | cut -d'-' -f2)

mkdir -p data/$YEAR/$MONTH

echo "🔍 Running Data Collector — Mode: $MODE | Date: $DATE"
echo "Output: data/$YEAR/$MONTH/${DATE}_${MODE}_data.json"

claude --dangerously-skip-permissions --allowedTools "WebSearch,Read,Write" --print "You are the DATA COLLECTOR agent for Bazaar Intelligence.
Read your full prompt from agents/data_collector.md.
MODE: $MODE
DATE: $DATE
Write output to: data/$YEAR/$MONTH/${DATE}_${MODE}_data.json
Execute all required web searches and populate every field with real data."

# Gift Nifty freshness check (AM mode only)
if [ "$MODE" = "am" ]; then
  DATA_FILE="data/$YEAR/$MONTH/${DATE}_am_data.json"
  STALE=$(python3 -c "
import json, sys
try:
  with open('$DATA_FILE') as f:
    d = json.load(f)
  flag = d.get('am_mode_only', {}).get('gift_nifty_staleness_warning', False)
  print('true' if flag else 'false')
except:
  print('unknown')
" 2>/dev/null)

  if [ "$STALE" = "true" ]; then
    echo "⚠️  Gift Nifty staleness warning detected in $DATA_FILE"
    echo "    gift_nifty_staleness_warning: true — AM predictor will re-fetch live data."
  elif [ "$STALE" = "false" ]; then
    echo "✅ Gift Nifty freshness confirmed."
  else
    echo "ℹ️  Could not verify Gift Nifty staleness flag (data file may not exist yet)."
  fi
fi

echo "✅ Data collection complete: data/$YEAR/$MONTH/${DATE}_${MODE}_data.json"

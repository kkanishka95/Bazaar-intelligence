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

echo "✅ Data collection complete: data/$YEAR/$MONTH/${DATE}_${MODE}_data.json"

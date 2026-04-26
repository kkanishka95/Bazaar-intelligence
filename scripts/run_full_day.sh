#!/bin/bash
# Full PM Day Sequence — convenience script (not in original spec, added per BUILD_PLAN FIX 7)
# Runs the complete PM sequence: PRE Monitor → Data Collector PM → Predictor PM
# Usage: ./scripts/run_full_day.sh [YYYY-MM-DD]
# Run at 2:20 PM IST or later to get the full 2:30 PM prediction

DATE=${1:-$(date +%Y-%m-%d)}

echo "🚀 Bazaar Intelligence — Full PM Sequence"
echo "   Date: $DATE"
echo "   Running: PRE Monitor → Data Collector PM → Predictor PM"
echo ""

./scripts/run_pre_monitor.sh $DATE || { echo "❌ PRE Monitor failed. Stopping."; exit 1; }
echo ""
./scripts/run_data_collector.sh pm $DATE || { echo "❌ Data Collector PM failed. Stopping."; exit 1; }
echo ""
./scripts/run_predictor_pm.sh $DATE || { echo "❌ Predictor PM failed. Stopping."; exit 1; }

echo ""
echo "✅ Full PM sequence complete for $DATE"

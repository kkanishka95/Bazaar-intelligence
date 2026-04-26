#!/bin/bash
# Run PRE Monitor Agent
# Usage: ./scripts/run_pre_monitor.sh [YYYY-MM-DD]
# Runs at 12:00 PM IST daily or on-demand

DATE=${1:-$(date +%Y-%m-%d)}
YEAR=$(echo $DATE | cut -d'-' -f1)
MONTH=$(echo $DATE | cut -d'-' -f2)

mkdir -p data/$YEAR/$MONTH

echo "⚡ Running PRE Monitor — Date: $DATE"
echo "Output: data/$YEAR/$MONTH/${DATE}_pre.json"

claude --dangerously-skip-permissions --allowedTools "WebSearch,Read,Write" --print "You are the PRE MONITOR agent for Bazaar Intelligence.
Read your full prompt from agents/pre_monitor.md.
DATE: $DATE
Scan all news sources for Pending Resolution Events.
Write output to: data/$YEAR/$MONTH/${DATE}_pre.json"

echo "✅ PRE scan complete: data/$YEAR/$MONTH/${DATE}_pre.json"
cat data/$YEAR/$MONTH/${DATE}_pre.json | python3 -c "
import json,sys
d=json.load(sys.stdin)
status=d['metadata']['status']
print(f'PRE Status: {status}')
if d.get('pre_events'):
    for e in d['pre_events']:
        print(f'  ⚡ {e[\"authority\"]}: {e[\"description\"][:80]}')
"

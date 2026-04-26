#!/bin/bash
# Apply Approved Quarterly Diffs and Create GitHub PR
# Usage: ./scripts/apply_quarterly_diffs.sh [YYYY-QN]
# Run AFTER you have reviewed and marked APPROVE/REJECT in the full_diffs.md file

QUARTER=${1:-"2026-Q2"}

echo "🔄 Applying approved quarterly diffs for $QUARTER"
echo "Reading: quarterly/${QUARTER}_full_diffs.json"
echo "Reading approvals from: quarterly/${QUARTER}_full_diffs.md"

if [ ! -f "quarterly/${QUARTER}_full_diffs.json" ]; then
    echo "❌ ERROR: quarterly/${QUARTER}_full_diffs.json not found."
    echo "   Run ./scripts/run_quarterly_full.sh $QUARTER first."
    exit 1
fi

if [ ! -f "quarterly/${QUARTER}_full_diffs.md" ]; then
    echo "❌ ERROR: quarterly/${QUARTER}_full_diffs.md not found."
    exit 1
fi

claude --dangerously-skip-permissions --allowedTools "Read,Write" --print "You are applying approved quarterly diffs for Bazaar Intelligence.
QUARTER: $QUARTER
Read the full diffs from: quarterly/${QUARTER}_full_diffs.json
Read the approval status from: quarterly/${QUARTER}_full_diffs.md

For each diff where the human has written APPROVE next to the checkbox:
1. Apply the change to the appropriate file in knowledge/
2. Log what was changed and why

For each diff with REJECT or still showing PENDING:
1. Skip it
2. Log it as skipped

After applying all approved changes:
1. Summarize exactly what was changed
2. Write the PR description to: quarterly/${QUARTER}_pr_description.md

DO NOT create the git branch or PR yourself. Just prepare the files and instructions."

echo ""
echo "✅ Approved diffs applied to knowledge/ files"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "To create the GitHub PR, run these commands:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  git checkout -b quarterly-update-$QUARTER"
echo "  git add knowledge/"
echo "  git commit -m \"\$(cat quarterly/${QUARTER}_pr_description.md | head -1)\""
echo "  git push origin quarterly-update-$QUARTER"
echo "  gh pr create --title \"Quarterly Update $QUARTER\" --body-file quarterly/${QUARTER}_pr_description.md"

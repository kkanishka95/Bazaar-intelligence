# Bazaar Intelligence

Multi-agent Indian stock market prediction system.
Backtested on 60+ historical events (2014–2026).
V2 model: 95.7% swing detection, 91.7% precision, 8.3% false alarm rate.

---

## Quick Start

### Full PM prediction (run at 2:20 PM IST or later):
```bash
./scripts/run_full_day.sh
```
This runs PRE Monitor → Data Collector PM → Predictor PM in sequence.
The WhatsApp message prints to terminal and is saved to `output/`.

### AM intraday prediction (run at 8:20 AM IST or later):
```bash
./scripts/run_data_collector.sh am
./scripts/run_predictor_am.sh
```

### Score today's predictions (run after 3:30 PM IST market close):
```bash
./scripts/run_evaluator.sh
```

### Manual date override:
```bash
./scripts/run_full_day.sh 2026-04-28
./scripts/run_predictor_am.sh 2026-04-28
./scripts/run_evaluator.sh 2026-04-28
```

---

## Agent Schedule (IST)

| Time | Agent | Script | Days |
|------|-------|--------|------|
| 12:00 PM | PRE Monitor | run_pre_monitor.sh | Mon–Fri |
| 2:20 PM | Data Collector PM | run_data_collector.sh pm | Mon–Fri |
| 2:30 PM | Predictor PM | run_predictor_pm.sh | Mon–Fri |
| 8:20 AM | Data Collector AM | run_data_collector.sh am | Tue–Sat |
| 8:30 AM | Predictor AM | run_predictor_am.sh | Tue–Sat |
| 4:30 PM | Evaluator | run_evaluator.sh | Mon–Fri |
| 1st trading day/month | Quartermaster Mini | run_quarterly_mini.sh | Monthly |
| 1st trading day/quarter | Quartermaster Full | run_quarterly_full.sh | Quarterly |

GitHub Actions runs all daily agents automatically. No manual intervention needed for routine operation.

---

## WhatsApp Messages

After each predictor runs, the WhatsApp message is:
1. Printed to terminal
2. Saved to `output/YYYY/MM/DATE_[pm|am]_whatsapp.txt`

Copy and paste manually to your WhatsApp group.

---

## Monthly and Quarterly Reviews

### Monthly (first trading day of each month):
```bash
./scripts/run_quarterly_mini.sh 2026-05
```
Output: `quarterly/2026-05_mini_diffs.md` — review proposed macro regime updates and new parameter candidates.

### Quarterly (first trading day of each quarter):
```bash
./scripts/run_quarterly_full.sh 2026-Q2
```
Output: `quarterly/2026-Q2_full_diffs.md` — review all proposed changes with APPROVE/REJECT checkboxes.

### Apply approved changes:
1. Open `quarterly/2026-Q2_full_diffs.md`
2. Write `APPROVE` or `REJECT` next to each item
3. Run: `./scripts/apply_quarterly_diffs.sh 2026-Q2`
4. Follow the git commands printed to create a GitHub PR

---

## Setup

1. Clone this repository
2. Copy `.env.example` to `.env` and add your `ANTHROPIC_API_KEY`
3. Install Claude Code: `npm install -g @anthropic/claude-code`
4. Add `ANTHROPIC_API_KEY` to GitHub repository Secrets for automated runs
5. GitHub Actions handles daily scheduling automatically via `.github/workflows/bazaar_cron.yml`

---

## File Structure

```
knowledge/      Framework files — updated only by quarterly reviews
agents/         Agent prompt files — read by Claude Code at runtime
scripts/        Shell scripts — one per agent + convenience scripts
data/           Live market snapshots (git-tracked, auto-committed)
predictions/    Prediction JSON outputs (git-tracked, auto-committed)
feedback/       Evaluation scores (git-tracked, auto-committed)
output/         WhatsApp .txt messages (git-tracked, auto-committed)
quarterly/      Monthly and quarterly reviews
```

---

## The 13-Factor Model

| Factor | Base Weight | Key Rule |
|--------|-------------|----------|
| Calendar Event | 10 | Budget, FOMC, RBI MPC, Election Results — 100% swing hit rate |
| Pending Resolution Event | 10 | Named authority + 12-24hr deadline + binary outcome |
| US Markets / Gift Nifty | 8 | S&P >2% fall → India gaps down 1–1.5% (90% reliability) |
| Crude Oil Brent | 7 (+2 war) | India 85% oil import dependent |
| FII Flow Trend | 7 | 7+ days selling >₹3000cr → auto-BEARISH weight 9 |
| Rupee/Dollar | 6 | Rupee >0.5% fall → Nifty falls same session |
| India VIX | 6 | >25 = panic priced in, bounce imminent |
| Asian Markets | 5 | Nikkei >2% fall → India gap-down signal |
| European Markets | 4 | DAX >1.5% fall at 2:30 PM → US opens negative |
| DII Counterbalance | 4 | Slows crashes, does not reverse direction |
| 200-DMA Proximity | 3 | Breaking below triggers algo selling |
| F&O Expiry Gamma | 3→9 | Amplifies existing trend 40–60% |
| Active Macro Regime | 3→7 | Iran war: effective weight 7, crude +2 |

Full model documentation: `knowledge/master_framework.md`

---

## Backtest Performance (V2)

- **Swing detection:** 95.7% of all ≥1.5% moves predicted
- **Precision:** 91.7% (when swing predicted, it occurs)
- **False alarm rate:** 8.3%
- **Black swan rate:** 9.1% (P4 events — unpredictable by design)
- **Dataset:** 60 verified events, 2014–2026

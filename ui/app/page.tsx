import {
  getISTNow,
  todayIST,
  getPrevTradingDay,
  getDataFile,
  getPredictionFile,
  getEvalFile,
  getWhatsappFile,
  readJSON,
  readText,
} from '@/lib/fs-utils';
import fs from 'fs';
import AgentPipeline from '@/components/AgentPipeline';
import PredictionCard from '@/components/PredictionCard';
import type { AgentStatus } from '@/components/AgentPipeline';

export const dynamic = 'force-dynamic';

interface EvalData {
  pm_scoring?: {
    total_pm_score?: number;
    pm_prediction_result?: string;
    actual_open_pct?: string;
    predicted_call?: string;
  };
  am_scoring?: {
    total_am_score?: number;
    am_prediction_result?: string;
    approach_outcome?: string;
  };
  summary_for_quarterly_review?: {
    key_learning?: string;
  };
  [key: string]: unknown;
}

function formatTradingDate(date: string): string {
  return new Date(date + 'T12:00:00Z').toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });
}

function getModeInfo(h: number, m: number) {
  const t = h * 60 + m;
  if (t < 8 * 60 + 15)  return { label: 'Pre-Market',  color: 'bg-slate-800 text-slate-300' };
  if (t < 9 * 60 + 15)  return { label: 'Focus Mode',  color: 'bg-blue-900 text-blue-200' };
  if (t < 14 * 60 + 20) return { label: 'Market Open', color: 'bg-emerald-900 text-emerald-300' };
  if (t < 15 * 60 + 30) return { label: 'PM Window',   color: 'bg-amber-900 text-amber-300' };
  return                        { label: 'Post-Close',  color: 'bg-slate-800 text-slate-300' };
}

function scoreColor(s: number) {
  if (s >= 8) return 'text-emerald-400';
  if (s >= 5) return 'text-amber-400';
  return 'text-red-400';
}

export default function DashboardPage() {
  const now      = getISTNow();
  const istHour  = now.getUTCHours();
  const istMin   = now.getUTCMinutes();
  const today    = todayIST();
  const prevDay  = getPrevTradingDay(today);

  const { label: modeLabel, color: modeColor } = getModeInfo(istHour, istMin);
  const timeStr = `${String(istHour).padStart(2, '0')}:${String(istMin).padStart(2, '0')} IST`;

  // PM prediction for today = file generated on prevDay
  const pmRaw      = readJSON(getPredictionFile(prevDay, 'pm'));
  const amRaw      = readJSON(getPredictionFile(today, 'am'));
  const evalData   = readJSON(getEvalFile(today)) as EvalData | null;
  const preData    = readJSON(getDataFile(today, 'pre')) as Record<string, unknown> | null;
  const pmWhatsapp = readText(getWhatsappFile(prevDay, 'pm'));
  const amWhatsapp = readText(getWhatsappFile(today, 'am'));

  const hasPrevPmData = fs.existsSync(getDataFile(prevDay, 'pm'));
  const hasAmData     = fs.existsSync(getDataFile(today, 'am'));

  const pmScore = evalData?.pm_scoring?.total_pm_score ?? null;
  const amScore = evalData?.am_scoring?.total_am_score ?? null;

  const agentStatuses: AgentStatus[] = [
    { id: 'pre_monitor',       name: 'PRE Monitor', dueTime: '12:00', ran: !!preData,       runDate: today   },
    { id: 'data_collector_pm', name: 'Data PM',     dueTime: '14:20', ran: hasPrevPmData,   runDate: prevDay },
    { id: 'predictor_pm',      name: 'Predict PM',  dueTime: '14:30', ran: !!pmRaw,         runDate: prevDay },
    { id: 'data_collector_am', name: 'Data AM',     dueTime: '08:20', ran: hasAmData,        runDate: today   },
    { id: 'predictor_am',      name: 'Predict AM',  dueTime: '08:30', ran: !!amRaw,          runDate: today   },
    { id: 'evaluator',         name: 'Evaluator',   dueTime: '16:30', ran: !!evalData,       runDate: today   },
  ];

  const doneCount = agentStatuses.filter(a => a.ran).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-5xl mx-auto p-4 space-y-5 pb-10">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-end justify-between flex-wrap gap-2 pt-2">
          <div>
            <h1 className="text-slate-100 text-xl font-semibold tracking-tight">
              {formatTradingDate(today)}
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">{timeStr}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-600 text-xs">{doneCount}/6 agents run</span>
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${modeColor}`}>
              {modeLabel}
            </span>
          </div>
        </div>

        {/* ── Pipeline strip ─────────────────────────────────────────────── */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
          <div className="text-slate-600 text-[10px] uppercase tracking-widest mb-2.5">
            Today&apos;s Pipeline — click any pill to run
          </div>
          <AgentPipeline agents={agentStatuses} />
        </div>

        {/* ── Two prediction cards ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PredictionCard
            type="pm"
            rawData={pmRaw}
            tradingDate={today}
            generatedDate={prevDay}
            dueTime="14:30"
            whatsappText={pmWhatsapp}
            evalScore={pmScore}
          />
          <PredictionCard
            type="am"
            rawData={amRaw}
            tradingDate={today}
            generatedDate={today}
            dueTime="08:30"
            whatsappText={amWhatsapp}
            evalScore={amScore}
          />
        </div>

        {/* ── Eval bar (4:30 PM — only when evaluator has run) ───────────── */}
        {evalData && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="text-slate-600 text-[10px] uppercase tracking-widest mb-4">
              Evaluation · 4:30 PM
            </div>
            <div className="flex flex-wrap gap-8 items-start">
              {/* PM score */}
              {typeof pmScore === 'number' && (
                <div>
                  <div className="text-slate-500 text-xs mb-1">PM Score</div>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-3xl font-bold ${scoreColor(pmScore)}`}>{pmScore}</span>
                    <span className="text-slate-600 text-sm">/10</span>
                    {evalData.pm_scoring?.pm_prediction_result && (
                      <span className="text-slate-500 text-xs">{evalData.pm_scoring.pm_prediction_result}</span>
                    )}
                  </div>
                  {evalData.pm_scoring?.actual_open_pct && (
                    <div className="text-slate-600 text-xs mt-1">
                      Actual open: {evalData.pm_scoring.actual_open_pct}
                    </div>
                  )}
                </div>
              )}

              {/* AM score */}
              {typeof amScore === 'number' && (
                <div>
                  <div className="text-slate-500 text-xs mb-1">AM Score</div>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-3xl font-bold ${scoreColor(amScore)}`}>{amScore}</span>
                    <span className="text-slate-600 text-sm">/10</span>
                    {evalData.am_scoring?.am_prediction_result && (
                      <span className="text-slate-500 text-xs">{evalData.am_scoring.am_prediction_result}</span>
                    )}
                  </div>
                  {evalData.am_scoring?.approach_outcome && (
                    <div className="text-slate-600 text-xs mt-1 max-w-xs">
                      {evalData.am_scoring.approach_outcome}
                    </div>
                  )}
                </div>
              )}

              {/* Key learning */}
              {evalData.summary_for_quarterly_review?.key_learning && (
                <div className="flex-1 min-w-[200px]">
                  <div className="text-slate-500 text-xs mb-1">Key Learning</div>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {evalData.summary_for_quarterly_review.key_learning}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

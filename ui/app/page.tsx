import {
  getISTNow,
  todayIST,
  getDataFile,
  getPredictionFile,
  getEvalFile,
  getWhatsappFile,
  readJSON,
  readText,
  listAllDates,
} from '@/lib/fs-utils';
import fs from 'fs';
import AgentPipeline from '@/components/AgentPipeline';
import PredictionCard from '@/components/PredictionCard';
import type { AgentStatus } from '@/components/AgentPipeline';

function flattenPrediction(raw: unknown): Prediction | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.call === 'string') return r as unknown as Prediction;
  const inner = r.prediction as Record<string, unknown> | undefined;
  if (inner && typeof inner.call === 'string') {
    return {
      ...r,
      call: inner.call,
      magnitude: inner.nifty_range_pts ?? inner.magnitude,
      approach: (r.suggested_approach as string) ?? inner.approach,
      watch_variable: (r.watch_variable as string) ?? inner.watch_variable,
      dominant_factors: Array.isArray(r.dominant_factors)
        ? r.dominant_factors as string[]
        : r.dominant_factor
          ? [((r.dominant_factor as Record<string, unknown>).name ?? r.dominant_factor) as string]
          : [],
    } as unknown as Prediction;
  }
  return r as unknown as Prediction;
}

interface Prediction {
  call?: string;
  magnitude?: string;
  approach?: string;
  watch_variable?: string;
  dominant_factors?: string[];
  [key: string]: unknown;
}

interface EvalData {
  pm_score?: number;
  am_score?: number;
  score?: number;
  [key: string]: unknown;
}

interface PreData {
  status?: string;
  event_name?: string;
  [key: string]: unknown;
}

function getModeInfo(istHour: number, istMinute: number) {
  const t = istHour * 60 + istMinute;
  if (t < 8 * 60 + 15)  return { label: 'Pre-Market',   mode: 'pre',        color: 'bg-slate-700 text-slate-200' };
  if (t < 9 * 60 + 15)  return { label: 'Focus Mode',   mode: 'focus',      color: 'bg-blue-800 text-blue-200' };
  if (t < 14 * 60 + 20) return { label: 'Market Hours', mode: 'market',     color: 'bg-emerald-900 text-emerald-300' };
  if (t < 15 * 60 + 30) return { label: 'PM Window',    mode: 'pm_window',  color: 'bg-amber-900 text-amber-300' };
  return                        { label: 'Post-Close',   mode: 'post_close', color: 'bg-slate-700 text-slate-200' };
}

const AGENT_DEFS = [
  { id: 'pre_monitor',       name: 'PRE Monitor',       dueTime: '12:00' },
  { id: 'data_collector_pm', name: 'Data Collector PM', dueTime: '14:20' },
  { id: 'predictor_pm',      name: 'Predictor PM',      dueTime: '14:30' },
  { id: 'data_collector_am', name: 'Data Collector AM', dueTime: '08:20' },
  { id: 'predictor_am',      name: 'Predictor AM',      dueTime: '08:30' },
  { id: 'evaluator',         name: 'Evaluator',         dueTime: '16:30' },
];

function compute30dAvg(): number | null {
  const dates = listAllDates().slice(0, 30);
  const scores: number[] = [];
  for (const d of dates) {
    const ev = readJSON(getEvalFile(d)) as EvalData | null;
    if (!ev) continue;
    const s = ev.pm_score ?? ev.score;
    if (typeof s === 'number') scores.push(s);
  }
  if (scores.length === 0) return null;
  return +( scores.reduce((a, b) => a + b, 0) / scores.length ).toFixed(1);
}

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const now        = getISTNow();
  const istHour    = now.getUTCHours();
  const istMinute  = now.getUTCMinutes();
  const today      = todayIST();
  const { label: modeLabel, mode, color: modeColor } = getModeInfo(istHour, istMinute);

  const pmPrediction  = flattenPrediction(readJSON(getPredictionFile(today, 'pm')));
  const amPrediction  = flattenPrediction(readJSON(getPredictionFile(today, 'am')));
  const evalData      = readJSON(getEvalFile(today))             as EvalData   | null;
  const preData       = readJSON(getDataFile(today, 'pre'))      as PreData    | null;
  const pmWhatsapp    = readText(getWhatsappFile(today, 'pm'));
  const amWhatsapp    = readText(getWhatsappFile(today, 'am'));

  const isPre      = preData?.status === 'CONFIRMED_PRE';
  const hasPmData  = fs.existsSync(getDataFile(today, 'pm'));
  const hasAmData  = fs.existsSync(getDataFile(today, 'am'));

  const t = istHour * 60 + istMinute;
  const showAm = t >= 8 * 60 + 30 && !!amPrediction;

  const avg30 = compute30dAvg();

  const agentStatuses: AgentStatus[] = AGENT_DEFS.map(def => {
    let ran = false;
    if (def.id === 'pre_monitor')       ran = !!preData;
    if (def.id === 'data_collector_pm') ran = hasPmData;
    if (def.id === 'predictor_pm')      ran = !!pmPrediction;
    if (def.id === 'data_collector_am') ran = hasAmData;
    if (def.id === 'predictor_am')      ran = !!amPrediction;
    if (def.id === 'evaluator')         ran = !!evalData;
    return { ...def, ran };
  });

  const timeStr = `${String(istHour).padStart(2, '0')}:${String(istMinute).padStart(2, '0')} IST`;

  // Focus Mode: 8:15–9:15 AM — full-screen AM prediction
  if (mode === 'focus') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="text-slate-500 text-xs mb-6 text-center">
          {timeStr} · {today} · <span className="text-blue-400">{modeLabel}</span>
        </div>
        <div className="w-full max-w-xl">
          <PredictionCard
            label="AM Prediction — Next Open"
            prediction={amPrediction}
            evalData={evalData}
            whatsappText={amWhatsapp}
            isPre={isPre}
            preEventName={preData?.event_name}
            avg30Score={avg30}
          />
        </div>
        <div className="mt-10 w-full max-w-2xl">
          <AgentPipeline agents={agentStatuses} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 space-y-4">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="text-slate-300 text-sm font-mono">{timeStr}</span>
          <span className="text-slate-500 text-sm">{today}</span>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${modeColor}`}>{modeLabel}</span>
      </div>

      {/* Main prediction card — uses PredictionCard with all fixes */}
      <PredictionCard
        label={showAm ? 'AM Prediction (next open)' : 'PM Prediction (next close)'}
        prediction={showAm ? amPrediction : pmPrediction}
        evalData={evalData}
        whatsappText={showAm ? amWhatsapp : pmWhatsapp}
        isPre={isPre}
        preEventName={preData?.event_name}
        avg30Score={avg30}
      />

      {/* Agent Pipeline with Run buttons */}
      <AgentPipeline agents={agentStatuses} />

      {/* Status summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'PM Data',       value: hasPmData },
          { label: 'PM Prediction', value: !!pmPrediction },
          { label: 'AM Prediction', value: !!amPrediction },
          { label: 'Eval',          value: !!evalData },
        ].map(item => (
          <div key={item.label} className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-center">
            <div className="text-slate-500 text-xs mb-1">{item.label}</div>
            <div className={`text-sm font-semibold ${item.value ? 'text-green-400' : 'text-slate-600'}`}>
              {item.value ? 'Ready' : 'Pending'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import CallBadge from './CallBadge';

interface Props {
  type: 'pm' | 'am';
  rawData: unknown;
  tradingDate: string;   // market day this predicts, e.g. "2026-04-28"
  generatedDate: string; // file date: prevDay for PM, today for AM
  dueTime: string;
  whatsappText: string | null;
  evalScore?: number | null;
}

interface PmFields {
  call: string;
  pctRange: string;
  niftyRangePts: string;
  confidence: string;
  tier: string;
  dominantName: string;
  dominantSignal: string;
  dominantReason: string;
  preActive: boolean;
  preDescription: string;
  confidenceCapApplied: boolean;
}

interface AmFields {
  call: string;
  impliedGapPct: string;
  impliedGapPts: string;
  bias: string;
  patternDesc: string;
  sustainOrReverse: string;
  approach: string;
  support: string[];
  resistance: string[];
  dominantName: string;
  dominantReason: string;
  reversalRisk: string;
}

function r(obj: unknown): Record<string, unknown> {
  return (obj && typeof obj === 'object' ? obj : {}) as Record<string, unknown>;
}

function extractPm(raw: Record<string, unknown>): PmFields {
  const pred = r(raw.prediction);
  const dom  = r(raw.dominant_factor);
  const pre  = r(raw.pre_status);
  return {
    call: (pred.call ?? raw.call ?? '') as string,
    pctRange: (pred.pct_range ?? '') as string,
    niftyRangePts: (pred.nifty_range_pts ?? '') as string,
    confidence: (pred.confidence ?? '') as string,
    tier: (pred.predictability_tier ?? '') as string,
    dominantName: (dom.name ?? dom.id ?? '') as string,
    dominantSignal: (dom.signal ?? '') as string,
    dominantReason: (dom.reason ?? '') as string,
    preActive: !!(pre.active),
    preDescription: (pre.description ?? '') as string,
    confidenceCapApplied: !!(raw.confidence_cap_applied),
  };
}

function extractAm(raw: Record<string, unknown>): AmFields {
  const gap   = r(raw.gap_open);
  const intra = r(raw.intraday);
  const dom   = r(raw.dominant_factor);
  return {
    call: (gap.call ?? '') as string,
    impliedGapPct: (gap.implied_gap_pct ?? '') as string,
    impliedGapPts: (gap.implied_gap_pts ?? '') as string,
    bias: (intra.bias ?? '') as string,
    patternDesc: (intra.pattern_description ?? intra.pattern ?? '') as string,
    sustainOrReverse: (intra.sustain_or_reverse ?? '') as string,
    approach: (intra.suggested_approach ?? '') as string,
    support: (intra.key_support as string[]) ?? [],
    resistance: (intra.key_resistance as string[]) ?? [],
    dominantName: (dom.id ?? dom.name ?? '') as string,
    dominantReason: (dom.reason ?? '') as string,
    reversalRisk: (intra.reversal_risk ?? '') as string,
  };
}

function fmtDate(date: string): string {
  return new Date(date + 'T12:00:00Z').toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC',
  });
}

const APPROACH: Record<string, { label: string; cls: string }> = {
  BUY_OPEN:    { label: 'Buy at Open',  cls: 'bg-emerald-900/70 text-emerald-300 border-emerald-700' },
  WAIT_15_MIN: { label: 'Wait 15 min',  cls: 'bg-amber-900/70 text-amber-300 border-amber-700' },
  FADE_GAP:    { label: 'Fade the Gap', cls: 'bg-red-900/70 text-red-300 border-red-700' },
  STAY_FLAT:   { label: 'Stay Flat',    cls: 'bg-slate-800 text-slate-300 border-slate-600' },
};

const CONF_CLS: Record<string, string> = {
  HIGH:   'bg-emerald-900/50 text-emerald-300',
  MEDIUM: 'bg-amber-900/50 text-amber-300',
  LOW:    'bg-red-900/50 text-red-300',
};

const TIER_LABEL: Record<string, string> = {
  P1: 'P1 · Near-certain',
  P2: 'P2 · Binary event',
  P3: 'P3 · Probable',
  P4: 'P4 · Black swan',
};

function scoreColor(s: number) {
  if (s >= 8) return 'text-emerald-400';
  if (s >= 5) return 'text-amber-400';
  return 'text-red-400';
}

export default function PredictionCard({ type, rawData, tradingDate, generatedDate, dueTime, whatsappText, evalScore }: Props) {
  const [waOpen, setWaOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const label    = type === 'pm' ? 'PM Prediction' : 'AM Prediction';
  const runLabel = type === 'pm'
    ? `Run ${fmtDate(generatedDate)} · 2:30 PM`
    : `Run ${fmtDate(generatedDate)} · 8:30 AM`;

  function copyWa() {
    if (!whatsappText) return;
    navigator.clipboard.writeText(whatsappText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ── Not run state ──────────────────────────────────────────────────────────
  if (!rawData) {
    return (
      <div className="border border-slate-800 rounded-xl p-5 bg-slate-900/30 flex flex-col items-center justify-center min-h-[200px] gap-2 text-center">
        <div className="text-slate-500 text-xs uppercase tracking-widest">{label}</div>
        <div className="text-slate-600 text-xs">Predicting {fmtDate(tradingDate)}</div>
        <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center mt-2">
          <span className="text-slate-600 text-xs">?</span>
        </div>
        <div className="text-slate-500 text-sm mt-1">Not run yet</div>
        <div className="text-slate-600 text-xs">Due {dueTime} IST · use pipeline above to run</div>
      </div>
    );
  }

  const raw = rawData as Record<string, unknown>;

  // ── WhatsApp section (shared) ──────────────────────────────────────────────
  const whatsappSection = whatsappText ? (
    <div className="pt-1">
      <button
        onClick={() => setWaOpen(!waOpen)}
        className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs transition-colors"
      >
        <span className="text-[10px]">{waOpen ? '▾' : '▸'}</span>
        <span>WhatsApp message</span>
      </button>
      {waOpen && (
        <div className="mt-2">
          <div className="flex justify-end mb-1.5">
            <button
              onClick={copyWa}
              className={`text-xs font-semibold px-3 py-1 rounded transition-colors ${
                copied ? 'bg-emerald-800 text-emerald-300' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <pre className="text-slate-300 text-xs bg-slate-800/60 rounded-lg p-3 whitespace-pre-wrap font-sans leading-relaxed">
            {whatsappText}
          </pre>
        </div>
      )}
    </div>
  ) : null;

  // ── PM card ────────────────────────────────────────────────────────────────
  if (type === 'pm') {
    const f = extractPm(raw);
    return (
      <div className={`border rounded-xl p-5 space-y-4 ${f.preActive ? 'bg-red-950/30 border-red-800' : 'bg-slate-900 border-slate-800'}`}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs uppercase tracking-widest">{label}</span>
              {f.preActive && (
                <span className="text-red-300 text-[10px] font-bold bg-red-900 border border-red-700 px-1.5 py-0.5 rounded animate-pulse">⚡ PRE</span>
              )}
            </div>
            <div className="text-slate-600 text-xs mt-0.5">{runLabel} · for {fmtDate(tradingDate)}</div>
          </div>
          {typeof evalScore === 'number' && (
            <div className="text-right shrink-0">
              <span className={`text-xl font-bold ${scoreColor(evalScore)}`}>{evalScore}</span>
              <span className="text-slate-600 text-xs">/10</span>
            </div>
          )}
        </div>

        {/* Call */}
        <CallBadge call={f.call} size="lg" />

        {/* Range · Confidence · Tier */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <div className="text-slate-500 text-xs mb-1">Range</div>
            <div className="text-slate-200 text-sm font-medium">{f.pctRange || '—'}</div>
            {f.niftyRangePts && <div className="text-slate-500 text-xs mt-0.5">{f.niftyRangePts} pts</div>}
          </div>
          <div>
            <div className="text-slate-500 text-xs mb-1">Confidence</div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CONF_CLS[f.confidence] ?? 'bg-slate-800 text-slate-400'}`}>
              {f.confidence || '—'}
            </span>
            {f.confidenceCapApplied && <div className="text-amber-600 text-[10px] mt-1">⚠ Capped (PRE)</div>}
          </div>
          <div>
            <div className="text-slate-500 text-xs mb-1">Tier</div>
            <div className="text-slate-400 text-xs">{TIER_LABEL[f.tier] ?? f.tier ?? '—'}</div>
          </div>
        </div>

        {/* Dominant factor */}
        {f.dominantName && (
          <div className="bg-slate-800/50 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-xs">Dominant</span>
              <span className={`text-xs font-semibold ${
                f.dominantSignal === 'BULLISH' ? 'text-emerald-400' :
                f.dominantSignal === 'BEARISH' ? 'text-red-400' : 'text-slate-400'
              }`}>{f.dominantName}</span>
            </div>
            {f.dominantReason && (
              <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">{f.dominantReason}</p>
            )}
          </div>
        )}

        {/* PRE description */}
        {f.preActive && f.preDescription && (
          <div className="bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">
            <p className="text-red-300 text-xs leading-relaxed">{f.preDescription}</p>
          </div>
        )}

        {whatsappSection}
      </div>
    );
  }

  // ── AM card ────────────────────────────────────────────────────────────────
  const f = extractAm(raw);
  const approach = APPROACH[f.approach];

  return (
    <div className="border border-slate-800 rounded-xl p-5 space-y-4 bg-slate-900">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-slate-400 text-xs uppercase tracking-widest">{label}</span>
          <div className="text-slate-600 text-xs mt-0.5">{runLabel} · for {fmtDate(tradingDate)}</div>
        </div>
        {typeof evalScore === 'number' && (
          <div className="text-right shrink-0">
            <span className={`text-xl font-bold ${scoreColor(evalScore)}`}>{evalScore}</span>
            <span className="text-slate-600 text-xs">/10</span>
          </div>
        )}
      </div>

      {/* Call */}
      <CallBadge call={f.call} size="lg" />

      {/* Gap · Intraday · Approach */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <div className="text-slate-500 text-xs mb-1">Implied Gap</div>
          <div className="text-slate-200 text-sm font-medium">{f.impliedGapPct || '—'}</div>
          {f.impliedGapPts && <div className="text-slate-500 text-xs mt-0.5">{f.impliedGapPts} pts</div>}
        </div>
        <div>
          <div className="text-slate-500 text-xs mb-1">Intraday</div>
          <div className={`text-sm font-medium ${
            f.sustainOrReverse === 'SUSTAIN' ? 'text-emerald-400' :
            f.sustainOrReverse === 'REVERSE' ? 'text-red-400' : 'text-amber-400'
          }`}>{f.sustainOrReverse || f.bias || '—'}</div>
          {f.reversalRisk && <div className="text-slate-500 text-xs mt-0.5">Risk: {f.reversalRisk}</div>}
        </div>
        <div>
          <div className="text-slate-500 text-xs mb-1">Approach</div>
          {approach ? (
            <span className={`text-xs px-2 py-0.5 rounded border font-medium ${approach.cls}`}>{approach.label}</span>
          ) : (
            <span className="text-slate-400 text-xs">{f.approach || '—'}</span>
          )}
        </div>
      </div>

      {/* Dominant factor */}
      {f.dominantName && (
        <div className="bg-slate-800/50 rounded-lg p-3 space-y-1">
          <div className="text-slate-500 text-xs mb-0.5">Dominant Factor</div>
          <div className="text-slate-300 text-xs font-semibold">{f.dominantName}</div>
          {f.dominantReason && (
            <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">{f.dominantReason}</p>
          )}
        </div>
      )}

      {/* Key levels */}
      {(f.support.length > 0 || f.resistance.length > 0) && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-slate-500 text-xs mb-1.5">Support</div>
            <div className="flex flex-wrap gap-1">
              {f.support.slice(0, 3).map((s, i) => (
                <span key={i} className="text-emerald-400 text-xs bg-emerald-950/50 border border-emerald-900 px-2 py-0.5 rounded">{s}</span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-slate-500 text-xs mb-1.5">Resistance</div>
            <div className="flex flex-wrap gap-1">
              {f.resistance.slice(0, 3).map((r, i) => (
                <span key={i} className="text-red-400 text-xs bg-red-950/50 border border-red-900 px-2 py-0.5 rounded">{r}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {whatsappSection}
    </div>
  );
}

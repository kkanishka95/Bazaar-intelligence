'use client';

import { useState } from 'react';
import CallBadge from './CallBadge';
import ScoreBadge from './ScoreBadge';

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

interface Props {
  label: string;
  prediction: Prediction | null;
  evalData: EvalData | null;
  whatsappText: string | null;
  isPre: boolean;
  preEventName?: string;
  avg30Score: number | null;
}

function confidenceLabel(factors: string[]): string {
  const n = factors.length;
  if (n >= 5) return `very strong signal — ${n} factors aligned`;
  if (n >= 4) return `strong signal — ${n} factors aligned`;
  if (n >= 3) return `moderate signal — ${n} factors aligned`;
  if (n >= 2) return `weak signal — ${n} factors`;
  if (n === 1) return `single-factor signal`;
  return '';
}

export default function PredictionCard({ label, prediction, evalData, whatsappText, isPre, preEventName, avg30Score }: Props) {
  const [copied, setCopied] = useState(false);

  const evalScore = evalData?.pm_score ?? evalData?.score ?? null;

  function copyWhatsapp() {
    if (!whatsappText) return;
    navigator.clipboard.writeText(whatsappText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const cardBg = isPre
    ? 'bg-red-950/60 border-red-800'
    : 'bg-slate-900 border-slate-800';

  const headerBg = isPre
    ? 'bg-red-900/50 rounded-t-lg -mx-5 -mt-5 px-5 pt-4 pb-3 mb-4'
    : '';

  return (
    <div className={`border rounded-lg p-5 space-y-4 ${cardBg}`}>
      {/* Header */}
      <div className={headerBg}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs uppercase tracking-widest">{label}</span>
            {isPre && (
              <span className="text-red-300 text-xs font-bold bg-red-900 border border-red-700 px-2 py-0.5 rounded animate-pulse">
                ⚡ PRE: {preEventName || 'CONFIRMED EVENT'}
              </span>
            )}
          </div>
          {evalData && (
            <ScoreBadge score={typeof evalScore === 'number' ? evalScore : null} avg={avg30Score} size="sm" />
          )}
        </div>
        {isPre && (
          <p className="text-red-400 text-xs mt-1">Expect circuit/halt behavior. Monitor positions closely.</p>
        )}
      </div>

      {prediction ? (
        <>
          <CallBadge call={prediction.call || ''} size="lg" />

          {/* Confidence label */}
          {Array.isArray(prediction.dominant_factors) && prediction.dominant_factors.length > 0 && (
            <p className="text-slate-400 text-sm italic">
              {confidenceLabel(prediction.dominant_factors as string[])}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
            <div>
              <div className="text-slate-500 text-xs mb-1">Magnitude</div>
              <div className="text-slate-200 text-sm font-medium">{prediction.magnitude || '—'}</div>
            </div>
            <div>
              <div className="text-slate-500 text-xs mb-1">Approach</div>
              <div className="text-slate-200 text-sm">{prediction.approach || '—'}</div>
            </div>
            <div>
              <div className="text-slate-500 text-xs mb-1">Watch</div>
              <div className="text-slate-300 text-sm">{prediction.watch_variable || '—'}</div>
            </div>
          </div>

          {Array.isArray(prediction.dominant_factors) && prediction.dominant_factors.length > 0 && (
            <div>
              <div className="text-slate-500 text-xs mb-1">Dominant Factors</div>
              <div className="flex flex-wrap gap-1">
                {(prediction.dominant_factors as string[]).map((f, i) => (
                  <span key={i} className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded">{f}</span>
                ))}
              </div>
            </div>
          )}

          {/* WhatsApp copy */}
          {whatsappText && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-500 text-xs uppercase tracking-widest">WhatsApp Message</span>
                <button
                  onClick={copyWhatsapp}
                  className={`text-xs font-semibold px-3 py-1 rounded transition-colors ${
                    copied ? 'bg-green-800 text-green-300' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                  }`}
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <pre className="text-slate-300 text-xs bg-slate-800 rounded p-3 whitespace-pre-wrap font-sans leading-relaxed">
                {whatsappText}
              </pre>
            </div>
          )}
        </>
      ) : (
        <div className="text-slate-500 text-center py-8">
          Run agents to generate prediction
        </div>
      )}
    </div>
  );
}

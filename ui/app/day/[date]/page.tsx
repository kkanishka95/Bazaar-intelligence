'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CallBadge from '@/components/CallBadge';
import ScoreBadge from '@/components/ScoreBadge';

function CopyBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-500 text-xs uppercase tracking-widest">WhatsApp Message</span>
        <button
          onClick={() => navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })}
          className={`text-xs font-semibold px-3 py-1 rounded transition-colors ${copied ? 'bg-green-800 text-green-300' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
        >{copied ? '✓ Copied' : 'Copy'}</button>
      </div>
      <pre className="text-slate-300 text-xs bg-slate-800 rounded p-3 whitespace-pre-wrap font-sans leading-relaxed">{text}</pre>
    </div>
  );
}

interface Prediction {
  call?: string;
  magnitude?: string;
  approach?: string;
  watch_variable?: string;
  dominant_factors?: string[];
  [key: string]: unknown;
}

interface FactorData {
  predicted?: string;
  actual?: string;
  weight?: number;
  score?: number;
  status?: string;
  new_parameter_candidate?: boolean;
}

interface EvalData {
  pm_score?: number;
  am_score?: number;
  score?: number;
  actual_move?: string;
  actual_open?: number;
  factors?: Record<string, FactorData>;
  [key: string]: unknown;
}

interface DayData {
  date: string;
  pm_prediction: Prediction | null;
  am_prediction: Prediction | null;
  eval: EvalData | null;
  pm_whatsapp: string | null;
  am_whatsapp: string | null;
  pre_data: Record<string, unknown> | null;
}

interface AllDay {
  date: string;
}

const STATUS_COLORS: Record<string, string> = {
  PERFECT: 'text-green-400',
  OVER: 'text-amber-400',
  UNDER: 'text-amber-400',
  WRONG: 'text-red-400',
  UNKNOWN: 'text-slate-500',
};

export default function DayPage() {
  const params = useParams();
  const router = useRouter();
  const date = params.date as string;

  const [data, setData] = useState<DayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllFactors, setShowAllFactors] = useState(false);
  const [allDates, setAllDates] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'pm' | 'am'>('pm');

  useEffect(() => {
    if (!date) return;
    setLoading(true);
    fetch(`/api/day/${date}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [date]);

  useEffect(() => {
    fetch('/api/days')
      .then(r => r.json())
      .then((days: AllDay[]) => setAllDates(days.map(d => d.date).sort()))
      .catch(() => {});
  }, []);

  const currentIdx = allDates.indexOf(date);
  const prevDate = currentIdx > 0 ? allDates[currentIdx - 1] : null;
  const nextDate = currentIdx < allDates.length - 1 ? allDates[currentIdx + 1] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <span className="text-slate-500">Loading...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <span className="text-slate-500">No data for {date}</span>
      </div>
    );
  }

  const { pm_prediction, am_prediction, eval: evalData, pm_whatsapp, am_whatsapp } = data;
  const activePrediction = activeTab === 'pm' ? pm_prediction : am_prediction;
  const activeWhatsapp = activeTab === 'pm' ? pm_whatsapp : am_whatsapp;
  const pmScore = evalData?.pm_score ?? evalData?.score ?? null;
  const amScore = evalData?.am_score ?? null;
  const activeScore = activeTab === 'pm' ? pmScore : amScore;

  const factors = evalData?.factors ? Object.entries(evalData.factors) : [];
  const displayFactors = showAllFactors ? factors : factors.slice(0, 3);

  const hasEval = !!evalData;

  return (
    <div className="min-h-screen bg-slate-950 p-4 max-w-5xl mx-auto space-y-4">
      {/* Header + navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-slate-200 font-semibold text-lg">{date}</h1>
          {data.pre_data && (
            <span className="text-amber-400 text-xs bg-amber-950 border border-amber-800 px-2 py-0.5 rounded">⚡ PRE</span>
          )}
        </div>
        <div className="flex gap-2">
          {prevDate && (
            <button onClick={() => router.push(`/day/${prevDate}`)} className="text-slate-400 hover:text-white px-3 py-1 rounded bg-slate-800 text-sm">← {prevDate}</button>
          )}
          {nextDate && (
            <button onClick={() => router.push(`/day/${nextDate}`)} className="text-slate-400 hover:text-white px-3 py-1 rounded bg-slate-800 text-sm">{nextDate} →</button>
          )}
        </div>
      </div>

      {/* Tab switcher */}
      {(pm_prediction || am_prediction) && (
        <div className="flex gap-2">
          {pm_prediction && (
            <button
              onClick={() => setActiveTab('pm')}
              className={`px-4 py-1.5 rounded text-sm font-medium ${activeTab === 'pm' ? 'bg-blue-800 text-blue-200' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              PM
            </button>
          )}
          {am_prediction && (
            <button
              onClick={() => setActiveTab('am')}
              className={`px-4 py-1.5 rounded text-sm font-medium ${activeTab === 'am' ? 'bg-blue-800 text-blue-200' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              AM
            </button>
          )}
        </div>
      )}

      {activePrediction ? (
        <div className={`grid gap-4 ${hasEval ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Left: Prediction */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
            <div className="text-slate-400 text-xs uppercase tracking-widest">
              {activeTab.toUpperCase()} Prediction
            </div>
            <CallBadge call={activePrediction.call || ''} size="lg" />
            <div className="space-y-3">
              <div>
                <div className="text-slate-500 text-xs mb-1">Magnitude</div>
                <div className="text-slate-200 text-sm font-medium">{activePrediction.magnitude || '—'}</div>
              </div>
              <div>
                <div className="text-slate-500 text-xs mb-1">Approach</div>
                <div className="text-slate-200 text-sm">{activePrediction.approach || '—'}</div>
              </div>
              <div>
                <div className="text-slate-500 text-xs mb-1">Watch Variable</div>
                <div className="text-slate-300 text-sm">{activePrediction.watch_variable || '—'}</div>
              </div>
              {activePrediction.dominant_factors && Array.isArray(activePrediction.dominant_factors) && (
                <div>
                  <div className="text-slate-500 text-xs mb-1">Dominant Factors</div>
                  <div className="flex flex-wrap gap-1">
                    {(activePrediction.dominant_factors as string[]).map((f, i) => (
                      <span key={i} className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded">{f}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {activeWhatsapp && (
              <CopyBlock text={activeWhatsapp} />
            )}
          </div>

          {/* Right: Eval */}
          {hasEval && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
              <div className="text-slate-400 text-xs uppercase tracking-widest">Actual Results</div>

              <div className="flex items-center gap-4">
                <ScoreBadge score={activeScore} size="lg" />
              </div>

              {evalData?.actual_move && (
                <div>
                  <div className="text-slate-500 text-xs mb-1">Actual Move</div>
                  <div className="text-slate-200 text-sm font-medium">{evalData.actual_move}</div>
                </div>
              )}

              {factors.length > 0 && (
                <div>
                  <div className="text-slate-500 text-xs mb-2 uppercase tracking-widest">Factor Analysis</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-800">
                          <th className="text-left text-slate-500 py-1 pr-3">Status</th>
                          <th className="text-left text-slate-500 py-1 pr-3">Factor</th>
                          <th className="text-left text-slate-500 py-1 pr-3">Predicted</th>
                          <th className="text-left text-slate-500 py-1 pr-3">Actual</th>
                          <th className="text-right text-slate-500 py-1">Weight</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayFactors.map(([name, fdata]) => (
                          <tr key={name} className="border-b border-slate-800/50">
                            <td className={`py-1.5 pr-3 font-mono text-xs ${STATUS_COLORS[fdata.status || 'UNKNOWN'] || 'text-slate-400'}`}>
                              {fdata.status || '—'}
                            </td>
                            <td className="py-1.5 pr-3 text-slate-300">{name}</td>
                            <td className="py-1.5 pr-3 text-slate-400">{fdata.predicted || '—'}</td>
                            <td className="py-1.5 pr-3 text-slate-400">{fdata.actual || '—'}</td>
                            <td className="py-1.5 text-right text-slate-500">{fdata.weight !== undefined ? fdata.weight : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {factors.length > 3 && (
                    <button
                      onClick={() => setShowAllFactors(v => !v)}
                      className="mt-2 text-xs text-blue-400 hover:text-blue-300"
                    >
                      {showAllFactors ? 'Show fewer' : `Show all ${factors.length} factors`}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center text-slate-500">
          No prediction data for {date}
        </div>
      )}
    </div>
  );
}

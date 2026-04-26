'use client';

import { useEffect, useState } from 'react';

interface ScoreEntry {
  date: string;
  pm_score: number | null;
  am_score: number | null;
}

interface FactorCalibration {
  factor: string;
  avg_score_contribution: number;
  status: string;
  trend_last30: number | null;
  avg_optimal_weight: number | null;
  new_parameter_candidate: boolean;
}

interface PerformanceData {
  scores: ScoreEntry[];
  summary: {
    avg_pm_score: number | null;
    avg_am_score: number | null;
    total_days: number;
  };
  factor_calibration: FactorCalibration[];
  parameter_candidates: FactorCalibration[];
}

const STATUS_COLORS: Record<string, string> = {
  PERFECT: 'text-green-400',
  OVER: 'text-amber-400',
  UNDER: 'text-amber-400',
  WRONG: 'text-red-400',
  UNKNOWN: 'text-slate-500',
};

function Sparkline({ scores }: { scores: (number | null)[] }) {
  const valid = scores.filter(s => s !== null) as number[];
  if (valid.length < 2) {
    return <div className="text-slate-600 text-xs">Not enough data</div>;
  }

  const width = 600;
  const height = 60;
  const max = Math.max(...valid, 10);
  const min = 0;
  const range = max - min || 1;

  const points = scores
    .map((s, i) => {
      if (s === null) return null;
      const x = (i / (scores.length - 1)) * width;
      const y = height - ((s - min) / range) * height;
      return `${x},${y}`;
    })
    .filter(Boolean)
    .join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-16" preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke="#3b82f6" strokeWidth="2" />
    </svg>
  );
}

export default function PerformancePage() {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/performance')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

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
        <span className="text-slate-500">Failed to load performance data</span>
      </div>
    );
  }

  const pmScores = data.scores.map(s => s.pm_score);
  const amScores = data.scores.map(s => s.am_score);
  const combinedScores = data.scores.map(s => s.pm_score ?? s.am_score);

  return (
    <div className="min-h-screen bg-slate-950 p-4 max-w-5xl mx-auto space-y-6">
      <h1 className="text-slate-200 font-semibold text-xl">Performance</h1>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Avg PM Score', value: data.summary.avg_pm_score !== null ? `${data.summary.avg_pm_score}/10` : '—' },
          { label: 'Avg AM Score', value: data.summary.avg_am_score !== null ? `${data.summary.avg_am_score}/10` : '—' },
          { label: 'Days Tracked', value: String(data.summary.total_days) },
          { label: 'Factors Tracked', value: String(data.factor_calibration.length) },
        ].map(item => (
          <div key={item.label} className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-3">
            <div className="text-slate-500 text-xs mb-1">{item.label}</div>
            <div className="text-blue-300 text-xl font-bold">{item.value}</div>
          </div>
        ))}
      </div>

      {/* Score trend */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <div className="text-slate-400 text-xs uppercase tracking-widest mb-3">Score Trend (last 90 days)</div>
        {combinedScores.some(s => s !== null) ? (
          <>
            <Sparkline scores={combinedScores} />
            <div className="flex justify-between text-slate-600 text-xs mt-1">
              <span>{data.scores[data.scores.length - 1]?.date}</span>
              <span>{data.scores[0]?.date}</span>
            </div>
          </>
        ) : (
          <div className="text-slate-600 text-sm text-center py-6">No score data available yet</div>
        )}
      </div>

      {/* PM vs AM trend */}
      {(pmScores.some(s => s !== null) || amScores.some(s => s !== null)) && (
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <div className="text-slate-400 text-xs uppercase tracking-widest mb-2">PM Scores</div>
            <Sparkline scores={pmScores} />
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <div className="text-slate-400 text-xs uppercase tracking-widest mb-2">AM Scores</div>
            <Sparkline scores={amScores} />
          </div>
        </div>
      )}

      {/* Factor calibration */}
      {data.factor_calibration.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="text-slate-400 text-xs uppercase tracking-widest mb-3">Factor Calibration</div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-slate-500 py-1.5 pr-4">Status</th>
                  <th className="text-left text-slate-500 py-1.5 pr-4">Factor</th>
                  <th className="text-right text-slate-500 py-1.5 pr-4">Avg Score</th>
                  <th className="text-right text-slate-500 py-1.5 pr-4">Trend (30d)</th>
                  <th className="text-right text-slate-500 py-1.5">Optimal Wt</th>
                </tr>
              </thead>
              <tbody>
                {data.factor_calibration.map(f => (
                  <tr key={f.factor} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className={`py-1.5 pr-4 font-mono ${STATUS_COLORS[f.status] || 'text-slate-400'}`}>
                      {f.status}
                    </td>
                    <td className="py-1.5 pr-4 text-slate-300">
                      {f.factor}
                      {f.new_parameter_candidate && (
                        <span className="ml-2 text-blue-400 text-xs">★</span>
                      )}
                    </td>
                    <td className="py-1.5 pr-4 text-right text-blue-300">{f.avg_score_contribution}</td>
                    <td className="py-1.5 pr-4 text-right text-slate-400">
                      {f.trend_last30 !== null ? f.trend_last30 : '—'}
                    </td>
                    <td className="py-1.5 text-right text-slate-500">
                      {f.avg_optimal_weight !== null ? f.avg_optimal_weight : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Parameter candidates */}
      {data.parameter_candidates.length > 0 && (
        <div className="bg-slate-900 border border-blue-900 rounded-lg p-4">
          <div className="text-blue-400 text-xs uppercase tracking-widest mb-3">★ New Parameter Candidates</div>
          <div className="space-y-2">
            {data.parameter_candidates.map(f => (
              <div key={f.factor} className="flex items-center justify-between bg-slate-800 rounded px-3 py-2">
                <span className="text-slate-300 text-sm">{f.factor}</span>
                <span className="text-blue-300 text-xs">avg contribution: {f.avg_score_contribution}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.factor_calibration.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center text-slate-500">
          No evaluation data available yet. Run agents and evaluator to see performance metrics.
        </div>
      )}
    </div>
  );
}

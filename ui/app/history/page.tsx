'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface DayEntry {
  date: string;
  has_pm_data: boolean;
  has_am_data: boolean;
  has_pre: boolean;
  has_pm_prediction: boolean;
  has_am_prediction: boolean;
  has_eval: boolean;
  pm_score: number | null;
  am_score: number | null;
}

function getScoreBg(score: number | null): string {
  if (score === null) return 'bg-slate-800 border-slate-700';
  if (score >= 9) return 'bg-blue-900 border-blue-600';
  if (score >= 8) return 'bg-blue-900 border-blue-700';
  if (score >= 7) return 'bg-blue-900/70 border-blue-800';
  if (score >= 6) return 'bg-blue-950 border-blue-800';
  if (score >= 4) return 'bg-slate-800 border-slate-600';
  if (score >= 1) return 'bg-slate-800/60 border-slate-700';
  return 'bg-slate-800/40 border-slate-800';
}

function getScoreText(score: number | null): string {
  if (score === null) return '';
  return `${score}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export default function HistoryPage() {
  const [days, setDays] = useState<DayEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());

  useEffect(() => {
    fetch('/api/days')
      .then(r => r.json())
      .then(data => {
        setDays(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const dayMap = Object.fromEntries(days.map(d => [d.date, d]));

  const prevMonth = useCallback(() => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }, [viewMonth]);

  const nextMonth = useCallback(() => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }, [viewMonth]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const monthName = new Date(viewYear, viewMonth, 1).toLocaleString('default', { month: 'long' });

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Pad to complete weeks
  while (cells.length % 7 !== 0) cells.push(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <span className="text-slate-500">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 max-w-3xl mx-auto">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevMonth} className="text-slate-400 hover:text-white px-3 py-1 rounded bg-slate-800 text-sm">← Prev</button>
        <h2 className="text-slate-200 font-semibold text-lg">{monthName} {viewYear}</h2>
        <button onClick={nextMonth} className="text-slate-400 hover:text-white px-3 py-1 rounded bg-slate-800 text-sm">Next →</button>
      </div>

      {/* Day of week headers */}
      <div className="grid grid-cols-7 mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-slate-600 text-xs py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={idx} />;
          }

          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const entry = dayMap[dateStr];
          const score = entry?.pm_score ?? entry?.am_score ?? null;
          const hasData = !!entry;

          return (
            <Link key={idx} href={`/day/${dateStr}`}>
              <div className={`relative border rounded p-1 min-h-[60px] flex flex-col cursor-pointer hover:opacity-80 transition-opacity ${hasData ? getScoreBg(score) : 'bg-slate-900 border-slate-800 opacity-40 cursor-default'}`}>
                <span className="text-xs text-slate-400 leading-none">{day}</span>
                {hasData && (
                  <>
                    <div className="flex gap-0.5 mt-0.5 flex-wrap">
                      {entry.has_pre && <span title="PRE event">⚡</span>}
                      {score !== null && score >= 8 && <span title="High score">🚀</span>}
                    </div>
                    {score !== null && (
                      <span className="text-xs font-bold text-blue-300 mt-auto">{getScoreText(score)}</span>
                    )}
                  </>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span className="font-medium text-slate-400">Score Legend:</span>
        {[
          { label: 'No score', cls: 'bg-slate-800' },
          { label: '1–3', cls: 'bg-slate-700' },
          { label: '4–5', cls: 'bg-slate-700 border-slate-500' },
          { label: '6–7', cls: 'bg-blue-950' },
          { label: '8–9', cls: 'bg-blue-900' },
          { label: '10', cls: 'bg-blue-800' },
        ].map(l => (
          <span key={l.label} className="flex items-center gap-1">
            <span className={`inline-block w-4 h-4 rounded border border-slate-700 ${l.cls}`} />
            {l.label}
          </span>
        ))}
        <span className="ml-2">⚡ = PRE  🚀 = Score ≥8</span>
      </div>
    </div>
  );
}

import { NextResponse } from 'next/server';
import { listAllDates, getEvalFile, readJSON } from '@/lib/fs-utils';

interface EvalData {
  date: string;
  pm_score?: number;
  am_score?: number;
  score?: number;
  factors?: Record<string, {
    predicted?: string;
    actual?: string;
    weight?: number;
    score?: number;
    status?: string;
    new_parameter_candidate?: boolean;
  }>;
}

export async function GET() {
  const allDates = listAllDates();
  const last90 = allDates.slice(0, 90);

  const entries: EvalData[] = [];
  const factorStats: Record<string, {
    totalScore: number;
    count: number;
    statuses: string[];
    candidate: boolean;
    last30Scores: number[];
    optimalWeights: number[];
  }> = {};

  for (const date of last90) {
    const evalRaw = readJSON(getEvalFile(date)) as Record<string, unknown> | null;
    if (!evalRaw) continue;

    const entry: EvalData = { date };
    entry.pm_score = typeof evalRaw.pm_score === 'number' ? evalRaw.pm_score : undefined;
    entry.am_score = typeof evalRaw.am_score === 'number' ? evalRaw.am_score : undefined;
    if (entry.pm_score === undefined && typeof evalRaw.score === 'number') {
      entry.pm_score = evalRaw.score as number;
    }

    const factors = evalRaw.factors as EvalData['factors'];
    if (factors) {
      entry.factors = factors;
      for (const [name, data] of Object.entries(factors)) {
        if (!factorStats[name]) {
          factorStats[name] = { totalScore: 0, count: 0, statuses: [], candidate: false, last30Scores: [], optimalWeights: [] };
        }
        const fs = factorStats[name];
        if (data.score !== undefined) {
          fs.totalScore += data.score;
          fs.count++;
          if (last90.indexOf(date) < 30) fs.last30Scores.push(data.score);
        }
        if (data.status) fs.statuses.push(data.status);
        if (data.new_parameter_candidate) fs.candidate = true;
        if (typeof (data as Record<string, unknown>).optimal_weight_in_hindsight === 'number') {
          fs.optimalWeights.push((data as Record<string, unknown>).optimal_weight_in_hindsight as number);
        }
      }
    }

    entries.push(entry);
  }

  const factorCalibration = Object.entries(factorStats).map(([name, s]) => ({
    factor: name,
    avg_score_contribution: s.count > 0 ? +(s.totalScore / s.count).toFixed(2) : 0,
    status: s.statuses.length > 0
      ? s.statuses.sort((a, b) =>
          s.statuses.filter(x => x === b).length - s.statuses.filter(x => x === a).length
        )[0]
      : 'UNKNOWN',
    trend_last30: s.last30Scores.length > 0
      ? +(s.last30Scores.reduce((a, b) => a + b, 0) / s.last30Scores.length).toFixed(2)
      : null,
    avg_optimal_weight: s.optimalWeights.length > 0
      ? +(s.optimalWeights.reduce((a, b) => a + b, 0) / s.optimalWeights.length).toFixed(1)
      : null,
    new_parameter_candidate: s.candidate,
  }));

  const pmScores = entries.filter(e => e.pm_score !== undefined).map(e => e.pm_score as number);
  const amScores = entries.filter(e => e.am_score !== undefined).map(e => e.am_score as number);
  const avg = (arr: number[]) => arr.length > 0 ? +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : null;

  return NextResponse.json({
    scores: entries.map(e => ({
      date: e.date,
      pm_score: e.pm_score ?? null,
      am_score: e.am_score ?? null,
    })),
    summary: {
      avg_pm_score: avg(pmScores),
      avg_am_score: avg(amScores),
      total_days: entries.length,
    },
    factor_calibration: factorCalibration,
    parameter_candidates: factorCalibration.filter(f => f.new_parameter_candidate),
  });
}

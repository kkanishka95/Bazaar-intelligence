import { NextResponse } from 'next/server';
import {
  listAllDates,
  getDataFile,
  getPredictionFile,
  getEvalFile,
  readJSON,
} from '@/lib/fs-utils';
import fs from 'fs';

export async function GET() {
  const dates = listAllDates();

  const result = dates.map(date => {
    const hasPmData = fs.existsSync(getDataFile(date, 'pm'));
    const hasAmData = fs.existsSync(getDataFile(date, 'am'));
    const hasPre = fs.existsSync(getDataFile(date, 'pre'));
    const hasPmPrediction = fs.existsSync(getPredictionFile(date, 'pm'));
    const hasAmPrediction = fs.existsSync(getPredictionFile(date, 'am'));
    const evalFile = getEvalFile(date);
    const hasEval = fs.existsSync(evalFile);

    let pmScore: number | null = null;
    let amScore: number | null = null;

    if (hasEval) {
      const evalData = readJSON(evalFile) as Record<string, unknown> | null;
      if (evalData) {
        pmScore = typeof evalData.pm_score === 'number' ? evalData.pm_score : null;
        amScore = typeof evalData.am_score === 'number' ? evalData.am_score : null;
        if (pmScore === null && typeof evalData.score === 'number') {
          pmScore = evalData.score as number;
        }
      }
    }

    return {
      date,
      has_pm_data: hasPmData,
      has_am_data: hasAmData,
      has_pre: hasPre,
      has_pm_prediction: hasPmPrediction,
      has_am_prediction: hasAmPrediction,
      has_eval: hasEval,
      pm_score: pmScore,
      am_score: amScore,
    };
  });

  return NextResponse.json(result);
}

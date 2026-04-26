import { NextResponse } from 'next/server';
import {
  getDataFile,
  getPredictionFile,
  getEvalFile,
  getWhatsappFile,
  readJSON,
  readText,
} from '@/lib/fs-utils';

// Agents nest the call under prediction.call — flatten to top level for UI
function flattenPrediction(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  // If already flat (has call at top level)
  if (typeof r.call === 'string') return r;
  // Nested under r.prediction
  const inner = r.prediction as Record<string, unknown> | undefined;
  if (inner && typeof inner.call === 'string') {
    return {
      ...r,
      call: inner.call,
      magnitude: inner.nifty_range_pts ?? inner.magnitude,
      approach: (r.suggested_approach as string) ?? inner.approach,
      watch_variable: (r.watch_variable as string) ?? inner.watch_variable,
      dominant_factors: Array.isArray(r.dominant_factors)
        ? r.dominant_factors
        : r.dominant_factor
          ? [(r.dominant_factor as Record<string, unknown>).name ?? r.dominant_factor]
          : [],
      confidence: inner.confidence,
      predictability_tier: inner.predictability_tier,
    };
  }
  return r;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
  }

  const pmData      = readJSON(getDataFile(date, 'pm'));
  const amData      = readJSON(getDataFile(date, 'am'));
  const preData     = readJSON(getDataFile(date, 'pre'));
  const pmPredRaw   = readJSON(getPredictionFile(date, 'pm'));
  const amPredRaw   = readJSON(getPredictionFile(date, 'am'));
  const evalData    = readJSON(getEvalFile(date));
  const pmWhatsapp  = readText(getWhatsappFile(date, 'pm'));
  const amWhatsapp  = readText(getWhatsappFile(date, 'am'));

  return NextResponse.json({
    date,
    pm_data:        pmData,
    am_data:        amData,
    pre_data:       preData,
    pm_prediction:  flattenPrediction(pmPredRaw),
    am_prediction:  flattenPrediction(amPredRaw),
    eval:           evalData,
    pm_whatsapp:    pmWhatsapp,
    am_whatsapp:    amWhatsapp,
  });
}

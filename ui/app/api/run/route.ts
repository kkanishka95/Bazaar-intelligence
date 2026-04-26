import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

const REPO_ROOT = path.join(process.cwd(), '..');

const AGENT_SCRIPTS: Record<string, { script: string; args: (param: string) => string[] }> = {
  pre_monitor:         { script: 'scripts/run_pre_monitor.sh',    args: (d) => [d] },
  data_collector_pm:   { script: 'scripts/run_data_collector.sh', args: (d) => ['pm', d] },
  predictor_pm:        { script: 'scripts/run_predictor_pm.sh',   args: (d) => [d] },
  data_collector_am:   { script: 'scripts/run_data_collector.sh', args: (d) => ['am', d] },
  predictor_am:        { script: 'scripts/run_predictor_am.sh',   args: (d) => [d] },
  evaluator:           { script: 'scripts/run_evaluator.sh',      args: (d) => [d] },
  quarterly_mini:      { script: 'scripts/run_quarterly_mini.sh', args: (p) => [p] },
  quarterly_full:      { script: 'scripts/run_quarterly_full.sh', args: (p) => [p] },
  apply_quarterly:     { script: 'scripts/apply_quarterly_diffs.sh', args: (p) => [p] },
};

function istToday(): string {
  return new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function currentYearMonth(): string {
  return new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 7);
}

function currentQuarter(): string {
  const d = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  const q = Math.floor(d.getUTCMonth() / 3) + 1;
  return `${d.getUTCFullYear()}-Q${q}`;
}

export async function POST(req: NextRequest) {
  const { agent, param } = await req.json();

  if (!agent || !AGENT_SCRIPTS[agent]) {
    return NextResponse.json({ error: 'Unknown agent' }, { status: 400 });
  }

  const { script, args } = AGENT_SCRIPTS[agent];
  let resolvedParam = param;
  if (!resolvedParam) {
    if (agent === 'quarterly_mini')  resolvedParam = currentYearMonth();
    else if (agent === 'quarterly_full' || agent === 'apply_quarterly') resolvedParam = currentQuarter();
    else resolvedParam = istToday();
  }

  const scriptPath = path.join(REPO_ROOT, script);

  return new NextResponse(
    new ReadableStream({
      start(controller) {
        const enc = new TextEncoder();
        const proc = spawn('bash', [scriptPath, ...args(resolvedParam)], {
          cwd: REPO_ROOT,
          env: { ...process.env },
        });

        proc.stdout.on('data', (chunk: Buffer) => controller.enqueue(enc.encode(chunk.toString())));
        proc.stderr.on('data', (chunk: Buffer) => controller.enqueue(enc.encode(chunk.toString())));
        proc.on('close', (code) => {
          controller.enqueue(enc.encode(`\n__EXIT_CODE__:${code}\n`));
          controller.close();
        });
        proc.on('error', (err) => {
          controller.enqueue(enc.encode(`\nERROR: ${err.message}\n`));
          controller.close();
        });
      },
    }),
    {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    }
  );
}

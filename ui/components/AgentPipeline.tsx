'use client';

import { useState } from 'react';

export interface AgentStatus {
  id: string;
  name: string;
  dueTime: string;
  ran: boolean;
}

// Stage keywords to watch in output stream — infer current stage from log content
const STAGE_DEFS: Record<string, { label: string; keyword: string }[]> = {
  pre_monitor:       [{ label: 'Searching PRE events', keyword: '' }, { label: 'Classifying', keyword: 'CLASSIF' }, { label: 'Writing output', keyword: 'Writing' }],
  data_collector_pm: [{ label: 'Fetching market data', keyword: '' }, { label: 'Fetching macro data', keyword: 'macro' }, { label: 'Writing JSON', keyword: 'Writing' }],
  predictor_pm:      [{ label: 'Reading data', keyword: '' }, { label: 'Scoring 13 factors', keyword: 'factor' }, { label: 'Writing prediction', keyword: 'Writing' }],
  data_collector_am: [{ label: 'Fetching Gift Nifty', keyword: '' }, { label: 'Fetching global data', keyword: 'global' }, { label: 'Writing JSON', keyword: 'Writing' }],
  predictor_am:      [{ label: 'Reading data', keyword: '' }, { label: 'Gap anchor calc', keyword: 'gap' }, { label: 'Writing prediction', keyword: 'Writing' }],
  evaluator:         [{ label: 'Reading prediction', keyword: '' }, { label: 'Scoring factors', keyword: 'factor' }, { label: 'Writing eval', keyword: 'Writing' }],
};

function inferStage(agentId: string, log: string): number {
  const stages = STAGE_DEFS[agentId];
  if (!stages) return 0;
  const lowerLog = log.toLowerCase();
  let last = 0;
  stages.forEach((s, i) => {
    if (s.keyword && lowerLog.includes(s.keyword.toLowerCase())) last = i;
  });
  return last;
}

const IS_VERCEL = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_VERCEL === '1';

export default function AgentPipeline({ agents }: { agents: AgentStatus[] }) {
  const [running, setRunning] = useState<string | null>(null);
  const [log, setLog] = useState<string>('');
  const [open, setOpen] = useState(false);
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [currentStage, setCurrentStage] = useState(0);

  async function runAgent(id: string) {
    setRunning(id);
    setLog('');
    setExitCode(null);
    setCurrentStage(0);
    setOpen(true);

    const res = await fetch('/api/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent: id }),
    });

    if (!res.body) { setRunning(null); return; }

    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += dec.decode(value, { stream: true });

      const match = buffer.match(/__EXIT_CODE__:(\d+)/);
      if (match) {
        setExitCode(parseInt(match[1]));
        buffer = buffer.replace(/__EXIT_CODE__:\d+\n?/, '');
      }

      setLog(buffer);
      setCurrentStage(inferStage(id, buffer));
    }

    setRunning(null);
    setTimeout(() => window.location.reload(), 1500);
  }

  const activeAgent = running ? agents.find(a => a.id === running) : null;
  const stages = running ? (STAGE_DEFS[running] || []) : [];
  const totalStages = stages.length;

  return (
    <>
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <div className="text-slate-500 text-xs uppercase tracking-widest mb-3">Agent Pipeline</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {agents.map(agent => (
            <div key={agent.id} className="bg-slate-800 rounded-lg px-3 py-2.5 flex items-center justify-between gap-2">
              <div className="flex flex-col min-w-0">
                <span className="text-slate-200 text-sm font-medium truncate">{agent.name}</span>
                <span className={`text-xs mt-0.5 ${agent.ran ? 'text-green-400' : 'text-slate-500'}`}>
                  {agent.ran ? '✓ Done' : `Due ${agent.dueTime} IST`}
                </span>
              </div>
              {IS_VERCEL ? (
                <span className="shrink-0 text-xs text-slate-600 px-2">Run locally</span>
              ) : (
                <button
                  onClick={() => runAgent(agent.id)}
                  disabled={running !== null}
                  className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded transition-colors
                    ${running === agent.id
                      ? 'bg-blue-900 text-blue-300 animate-pulse cursor-wait'
                      : running !== null
                      ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-blue-700 hover:bg-blue-600 text-white cursor-pointer'
                    }`}
                >
                  {running === agent.id ? 'Running…' : 'Run'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Run modal with staged progress bar */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60">
          <div className="bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[75vh] flex flex-col shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-slate-200 text-sm font-semibold">
                  {activeAgent ? activeAgent.name : 'Agent Output'}
                </span>
                {running && <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />}
                {exitCode !== null && (
                  <span className={`text-xs px-2 py-0.5 rounded ${exitCode === 0 ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                    {exitCode === 0 ? '✓ Success' : `Exit ${exitCode}`}
                  </span>
                )}
              </div>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-200 px-1">✕</button>
            </div>

            {/* Staged progress bar */}
            {running && totalStages > 0 && (
              <div className="px-5 py-3 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-1">
                  {stages.map((stage, i) => (
                    <div key={i} className="flex items-center gap-1 flex-1">
                      <div className={`flex-1 h-1.5 rounded-full transition-colors duration-500 ${
                        i <= currentStage ? 'bg-blue-500' : 'bg-slate-700'
                      }`} />
                      {i < stages.length - 1 && <div className="w-1" />}
                    </div>
                  ))}
                </div>
                <div className="mt-1.5 flex justify-between">
                  {stages.map((stage, i) => (
                    <span key={i} className={`text-xs ${i === currentStage ? 'text-blue-400' : i < currentStage ? 'text-slate-500' : 'text-slate-700'}`}>
                      {stage.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Log output */}
            <pre className="flex-1 overflow-y-auto p-4 text-xs text-slate-300 font-mono whitespace-pre-wrap">
              {log || (running ? 'Starting…' : 'No output')}
            </pre>
          </div>
        </div>
      )}
    </>
  );
}

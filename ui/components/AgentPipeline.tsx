'use client';

import { useState } from 'react';

export interface AgentStatus {
  id: string;
  name: string;
  dueTime: string;
  ran: boolean;
  runDate?: string;
}

const STAGE_DEFS: Record<string, { label: string; keyword: string }[]> = {
  pre_monitor:       [{ label: 'Scanning events', keyword: '' }, { label: 'Classifying', keyword: 'CLASSIF' }, { label: 'Writing', keyword: 'Writing' }],
  data_collector_pm: [{ label: 'Fetching markets', keyword: '' }, { label: 'Fetching macro', keyword: 'macro' }, { label: 'Writing JSON', keyword: 'Writing' }],
  predictor_pm:      [{ label: 'Loading data', keyword: '' }, { label: 'Scoring factors', keyword: 'factor' }, { label: 'Writing prediction', keyword: 'Writing' }],
  data_collector_am: [{ label: 'Fetching Gift Nifty', keyword: '' }, { label: 'Fetching global', keyword: 'global' }, { label: 'Writing JSON', keyword: 'Writing' }],
  predictor_am:      [{ label: 'Loading data', keyword: '' }, { label: 'Gap anchor', keyword: 'gap' }, { label: 'Writing prediction', keyword: 'Writing' }],
  evaluator:         [{ label: 'Reading predictions', keyword: '' }, { label: 'Scoring factors', keyword: 'factor' }, { label: 'Writing eval', keyword: 'Writing' }],
};

function inferStage(agentId: string, log: string): number {
  const stages = STAGE_DEFS[agentId];
  if (!stages) return 0;
  const lower = log.toLowerCase();
  let last = 0;
  stages.forEach((s, i) => {
    if (s.keyword && lower.includes(s.keyword.toLowerCase())) last = i;
  });
  return last;
}

const IS_VERCEL = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_VERCEL === '1';

export default function AgentPipeline({ agents }: { agents: AgentStatus[] }) {
  const [running, setRunning] = useState<string | null>(null);
  const [log, setLog] = useState('');
  const [open, setOpen] = useState(false);
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [currentStage, setCurrentStage] = useState(0);
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);

  async function runAgent(agent: AgentStatus) {
    if (running) return;
    setActiveAgentId(agent.id);
    setRunning(agent.id);
    setLog('');
    setExitCode(null);
    setCurrentStage(0);
    setOpen(true);

    const body: Record<string, string> = { agent: agent.id };
    if (agent.runDate) body.param = agent.runDate;

    const res = await fetch('/api/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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
      setCurrentStage(inferStage(agent.id, buffer));
    }

    setRunning(null);
  }

  const activeAgent = agents.find(a => a.id === activeAgentId);
  const stages = activeAgentId ? (STAGE_DEFS[activeAgentId] || []) : [];

  return (
    <>
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {agents.map((agent, i) => (
          <div key={agent.id} className="flex items-center gap-1.5 shrink-0">
            {i > 0 && <span className="text-slate-700 text-xs select-none">›</span>}
            <button
              onClick={() => !IS_VERCEL && !running && runAgent(agent)}
              disabled={!!running || IS_VERCEL}
              title={IS_VERCEL ? 'Run locally' : `Run ${agent.name}`}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                agent.ran
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:border-emerald-600'
                  : running === agent.id
                  ? 'bg-blue-950 text-blue-300 border-blue-800 animate-pulse cursor-wait'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200 cursor-pointer',
                running && running !== agent.id ? 'opacity-40 cursor-not-allowed' : '',
              ].join(' ')}
            >
              <span className="text-[10px]">
                {agent.ran ? '✓' : running === agent.id ? '●' : '○'}
              </span>
              <span>{agent.name}</span>
              {!agent.ran && running !== agent.id && (
                <span className="text-slate-600 text-[10px] font-normal">{agent.dueTime}</span>
              )}
            </button>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="text-slate-200 text-sm font-semibold">
                  {activeAgent?.name ?? 'Agent Output'}
                </span>
                {running && (
                  <span className="flex items-center gap-1.5 text-blue-400 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    Running…
                  </span>
                )}
                {exitCode !== null && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    exitCode === 0 ? 'bg-emerald-900 text-emerald-300' : 'bg-red-900/60 text-red-300'
                  }`}>
                    {exitCode === 0 ? '✓ Done' : `Exit ${exitCode}`}
                  </span>
                )}
              </div>
              {!running && (
                <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-200 px-1">✕</button>
              )}
            </div>

            {/* Stage progress */}
            {stages.length > 0 && (
              <div className="px-5 py-3 border-b border-slate-800 shrink-0">
                <div className="flex gap-1">
                  {stages.map((s, i) => (
                    <div key={i} className={`flex-1 h-1 rounded-full transition-colors duration-500 ${
                      i < currentStage ? 'bg-emerald-600' : i === currentStage ? 'bg-blue-500' : 'bg-slate-700'
                    }`} />
                  ))}
                </div>
                <div className="flex justify-between mt-1.5">
                  {stages.map((s, i) => (
                    <span key={i} className={`text-[10px] ${
                      i === currentStage ? 'text-blue-400' : i < currentStage ? 'text-emerald-600' : 'text-slate-700'
                    }`}>{s.label}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Log */}
            <pre className="flex-1 overflow-y-auto p-4 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
              {log || (running ? 'Starting…' : 'No output')}
            </pre>

            {/* Footer — shown only when done */}
            {exitCode !== null && (
              <div className="px-5 py-3 border-t border-slate-800 shrink-0 flex justify-end gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="text-slate-400 hover:text-slate-200 text-sm px-4 py-2 rounded transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => { setOpen(false); window.location.reload(); }}
                  className="bg-blue-700 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded transition-colors"
                >
                  Refresh Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

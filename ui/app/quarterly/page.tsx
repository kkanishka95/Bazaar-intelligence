'use client';

import { useEffect, useState } from 'react';

const IS_VERCEL = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_VERCEL === '1';

interface QuarterlyFile {
  filename: string;
  type: 'mini' | 'full';
  period: string;
  hasJson: boolean;
  mdContent: string;
  jsonContent: DiffJson | null;
}

interface DiffItem {
  id: string;
  type: string;
  description: string;
  current_value?: unknown;
  proposed_value?: unknown;
  reason?: string;
  approval?: 'APPROVE' | 'REJECT' | null;
}

interface DiffJson {
  diffs?: DiffItem[];
  [key: string]: unknown;
}

function RunAgentPanel() {
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState('');
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [agent, setAgent] = useState<'quarterly_mini' | 'quarterly_full'>('quarterly_mini');
  const [param, setParam] = useState('');
  const [showLog, setShowLog] = useState(false);

  const now = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  const defaultMonth = now.toISOString().slice(0, 7);
  const defaultQuarter = `${now.getUTCFullYear()}-Q${Math.floor(now.getUTCMonth() / 3) + 1}`;

  async function run() {
    setRunning(true);
    setLog('');
    setExitCode(null);
    setShowLog(true);

    const res = await fetch('/api/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent, param: param || (agent === 'quarterly_mini' ? defaultMonth : defaultQuarter) }),
    });

    if (!res.body) { setRunning(false); return; }
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const match = buf.match(/__EXIT_CODE__:(\d+)/);
      if (match) { setExitCode(parseInt(match[1])); buf = buf.replace(/__EXIT_CODE__:\d+\n?/, ''); }
      setLog(buf);
    }
    setRunning(false);
    setTimeout(() => window.location.reload(), 1500);
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="text-slate-300 text-sm font-semibold mb-4">Run a Review</div>
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-slate-500 text-xs block mb-1">Agent</label>
          <select
            value={agent}
            onChange={e => setAgent(e.target.value as 'quarterly_mini' | 'quarterly_full')}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded px-3 py-2"
          >
            <option value="quarterly_mini">Quartermaster Monthly</option>
            <option value="quarterly_full">Quartermaster Full (Quarterly)</option>
          </select>
        </div>
        <div>
          <label className="text-slate-500 text-xs block mb-1">
            {agent === 'quarterly_mini' ? 'Month (YYYY-MM)' : 'Quarter (YYYY-QN)'}
          </label>
          <input
            type="text"
            value={param}
            onChange={e => setParam(e.target.value)}
            placeholder={agent === 'quarterly_mini' ? defaultMonth : defaultQuarter}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded px-3 py-2 w-36"
          />
        </div>
        <button
          onClick={run}
          disabled={running}
          className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${running ? 'bg-blue-900 text-blue-300 animate-pulse cursor-wait' : 'bg-blue-700 hover:bg-blue-600 text-white'}`}
        >
          {running ? 'Running…' : 'Run'}
        </button>
        {(log || exitCode !== null) && (
          <button onClick={() => setShowLog(s => !s)} className="text-slate-400 text-xs underline">
            {showLog ? 'Hide log' : 'Show log'}
          </button>
        )}
      </div>

      {showLog && log && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-1">
            {running && <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />}
            {exitCode !== null && (
              <span className={`text-xs px-2 py-0.5 rounded ${exitCode === 0 ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                {exitCode === 0 ? 'Success' : `Exit ${exitCode}`}
              </span>
            )}
          </div>
          <pre className="bg-slate-950 rounded p-3 text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">
            {log}
          </pre>
        </div>
      )}
    </div>
  );
}

function ApplyDiffsButton({ period }: { period: string }) {
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState('');
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [show, setShow] = useState(false);

  async function apply() {
    setRunning(true);
    setLog('');
    setExitCode(null);
    setShow(true);

    const res = await fetch('/api/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent: 'apply_quarterly', param: period }),
    });

    if (!res.body) { setRunning(false); return; }
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const match = buf.match(/__EXIT_CODE__:(\d+)/);
      if (match) { setExitCode(parseInt(match[1])); buf = buf.replace(/__EXIT_CODE__:\d+\n?/, ''); }
      setLog(buf);
    }
    setRunning(false);
  }

  return (
    <div>
      <button
        onClick={apply}
        disabled={running}
        className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${running ? 'bg-amber-900 text-amber-300 animate-pulse cursor-wait' : 'bg-amber-700 hover:bg-amber-600 text-white'}`}
      >
        {running ? 'Applying…' : 'Apply Approved Diffs'}
      </button>
      <p className="text-slate-500 text-xs mt-1">Writes APPROVED changes to knowledge/ files and prints git commands</p>
      {show && log && (
        <div className="mt-3">
          {exitCode !== null && (
            <span className={`text-xs px-2 py-0.5 rounded ${exitCode === 0 ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
              {exitCode === 0 ? 'Success' : `Exit ${exitCode}`}
            </span>
          )}
          <pre className="bg-slate-950 rounded p-3 text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-64 overflow-y-auto mt-2">
            {log}
          </pre>
        </div>
      )}
    </div>
  );
}

function DiffCard({ file }: { file: QuarterlyFile }) {
  const [expanded, setExpanded] = useState(false);
  const [approvals, setApprovals] = useState<Record<string, 'APPROVE' | 'REJECT' | null>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const diffs: DiffItem[] = file.jsonContent?.diffs ?? [];
  const hasDiffs = diffs.length > 0;

  function toggle(id: string, val: 'APPROVE' | 'REJECT') {
    setApprovals(prev => ({ ...prev, [id]: prev[id] === val ? null : val }));
    setSaved(false);
  }

  async function saveApprovals() {
    setSaving(true);
    await fetch('/api/quarterly/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ period: file.period, approvals }),
    });
    setSaving(false);
    setSaved(true);
  }

  const approvedCount = Object.values(approvals).filter(v => v === 'APPROVE').length;
  const rejectedCount = Object.values(approvals).filter(v => v === 'REJECT').length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-800/50 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${file.type === 'full' ? 'bg-purple-900 text-purple-300' : 'bg-blue-900 text-blue-300'}`}>
            {file.type === 'full' ? 'Quarterly' : 'Monthly'}
          </span>
          <span className="text-slate-200 font-medium">{file.period}</span>
          {hasDiffs && (
            <span className="text-slate-500 text-xs">{diffs.length} proposed change{diffs.length !== 1 ? 's' : ''}</span>
          )}
        </div>
        <span className="text-slate-500 text-sm">{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div className="border-t border-slate-800 px-5 py-4 space-y-5">
          {/* Structured diffs with approve/reject */}
          {hasDiffs && (
            <div>
              <div className="text-slate-400 text-xs uppercase tracking-widest mb-3">Proposed Changes</div>
              <div className="space-y-3">
                {diffs.map(diff => (
                  <div key={diff.id} className="bg-slate-800 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-slate-500 text-xs bg-slate-700 px-2 py-0.5 rounded">{diff.type}</span>
                          <span className="text-slate-200 text-sm font-medium">{diff.id}</span>
                        </div>
                        <p className="text-slate-300 text-sm">{diff.description}</p>
                        {diff.reason && <p className="text-slate-500 text-xs mt-1">Reason: {diff.reason}</p>}
                        {diff.current_value !== undefined && (
                          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-slate-500 block mb-0.5">Current</span>
                              <code className="text-red-300 bg-slate-900 px-2 py-1 rounded block">{JSON.stringify(diff.current_value)}</code>
                            </div>
                            <div>
                              <span className="text-slate-500 block mb-0.5">Proposed</span>
                              <code className="text-green-300 bg-slate-900 px-2 py-1 rounded block">{JSON.stringify(diff.proposed_value)}</code>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0 mt-1">
                        <button
                          onClick={() => toggle(diff.id, 'APPROVE')}
                          className={`text-xs font-semibold px-3 py-1.5 rounded transition-colors ${approvals[diff.id] === 'APPROVE' ? 'bg-green-700 text-white' : 'bg-slate-700 text-slate-400 hover:text-green-300'}`}
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => toggle(diff.id, 'REJECT')}
                          className={`text-xs font-semibold px-3 py-1.5 rounded transition-colors ${approvals[diff.id] === 'REJECT' ? 'bg-red-800 text-white' : 'bg-slate-700 text-slate-400 hover:text-red-300'}`}
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Save + apply */}
              <div className="mt-4 flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800">
                <span className="text-slate-500 text-xs">{approvedCount} approved · {rejectedCount} rejected · {diffs.length - approvedCount - rejectedCount} pending</span>
                <button
                  onClick={saveApprovals}
                  disabled={saving}
                  className="px-4 py-1.5 bg-blue-800 hover:bg-blue-700 text-white text-xs font-semibold rounded transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Decisions'}
                </button>
              </div>
              {saved && file.type === 'full' && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <ApplyDiffsButton period={file.period} />
                </div>
              )}
            </div>
          )}

          {/* Raw markdown */}
          <div>
            <div className="text-slate-400 text-xs uppercase tracking-widest mb-2">Full Report (Markdown)</div>
            <pre className="bg-slate-950 rounded p-4 text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
              {file.mdContent || 'No content'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuarterlyPage() {
  const [files, setFiles] = useState<QuarterlyFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/quarterly').then(r => r.json()).then(data => { setFiles(data); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-100 text-xl font-bold">Quarterly Reviews</h1>
          <p className="text-slate-500 text-sm mt-0.5">Run reviews · approve or reject proposed changes · apply to knowledge base</p>
        </div>
        <a href="/" className="text-slate-400 hover:text-slate-200 text-sm">← Dashboard</a>
      </div>

      {/* Run panel */}
      {IS_VERCEL ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-500 text-sm">
          Agents run locally via shell scripts. Deploy new data by running agents on your machine — GitHub Actions auto-commits output and triggers a Vercel redeploy.
        </div>
      ) : (
        <RunAgentPanel />
      )}

      {/* Schedule reminder */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
        <div className="text-slate-400 text-xs uppercase tracking-widest mb-3">Schedule</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex gap-3 items-start">
            <span className="text-blue-400 text-lg mt-0.5">📅</span>
            <div>
              <div className="text-slate-200 font-medium">Quartermaster Monthly</div>
              <div className="text-slate-500 text-xs mt-0.5">First trading day of each month · Run manually via button above</div>
              <div className="text-slate-500 text-xs">Aggregates new_parameter_flags, checks macro regime for changes</div>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-purple-400 text-lg mt-0.5">🔬</span>
            <div>
              <div className="text-slate-200 font-medium">Quartermaster Full</div>
              <div className="text-slate-500 text-xs mt-0.5">First trading day of each quarter (Jan, Apr, Jul, Oct)</div>
              <div className="text-slate-500 text-xs">Full backtested review · proposed weight changes require your APPROVE/REJECT</div>
            </div>
          </div>
        </div>
      </div>

      {/* Existing reviews */}
      <div>
        <div className="text-slate-400 text-xs uppercase tracking-widest mb-3">Past Reviews</div>
        {loading ? (
          <div className="text-slate-600 text-sm py-8 text-center">Loading…</div>
        ) : files.length === 0 ? (
          <div className="text-slate-600 text-sm py-8 text-center bg-slate-900 rounded-xl border border-slate-800">
            No reviews yet. Run your first review above.
          </div>
        ) : (
          <div className="space-y-3">
            {files.map(f => <DiffCard key={f.filename} file={f} />)}
          </div>
        )}
      </div>
    </div>
  );
}

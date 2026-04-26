import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const QUARTERLY_DIR = path.join(process.cwd(), '..', 'quarterly');

// Writes approval decisions into the _full_diffs.json so apply_quarterly_diffs.sh can read them.
// Also rewrites the _full_diffs.md to add APPROVE/REJECT next to each checkbox.
export async function POST(req: NextRequest) {
  const { period, approvals } = await req.json() as {
    period: string;
    approvals: Record<string, 'APPROVE' | 'REJECT' | null>;
  };

  if (!period || !approvals) {
    return NextResponse.json({ error: 'Missing period or approvals' }, { status: 400 });
  }

  // Update JSON file
  const jsonPath = path.join(QUARTERLY_DIR, `${period}_full_diffs.json`);
  if (fs.existsSync(jsonPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      if (Array.isArray(data.diffs)) {
        data.diffs = data.diffs.map((d: { id: string }) => ({
          ...d,
          approval: approvals[d.id] ?? null,
        }));
      }
      fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
    } catch {
      return NextResponse.json({ error: 'Failed to parse JSON' }, { status: 500 });
    }
  }

  // Update markdown file — rewrite [ ] lines to [APPROVE] or [REJECT]
  const mdPath = path.join(QUARTERLY_DIR, `${period}_full_diffs.md`);
  if (fs.existsSync(mdPath)) {
    let md = fs.readFileSync(mdPath, 'utf-8');
    for (const [id, decision] of Object.entries(approvals)) {
      if (!decision) continue;
      // Match lines like: - [ ] id: ... or - [APPROVE] id: ...  etc.
      const regex = new RegExp(`(- \\[)(APPROVE|REJECT|\\s*)(\\] )(${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'g');
      md = md.replace(regex, `- [${decision}] ${id}`);
    }
    fs.writeFileSync(mdPath, md);
  }

  return NextResponse.json({ ok: true });
}

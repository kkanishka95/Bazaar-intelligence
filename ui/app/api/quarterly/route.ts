import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const QUARTERLY_DIR = path.join(process.cwd(), '..', 'quarterly');

export interface QuarterlyFile {
  filename: string;
  type: 'mini' | 'full';
  period: string; // e.g. "2026-05" or "2026-Q2"
  hasJson: boolean;
  mdContent: string;
  jsonContent: unknown;
}

export async function GET() {
  if (!fs.existsSync(QUARTERLY_DIR)) {
    return NextResponse.json([]);
  }

  const files = fs.readdirSync(QUARTERLY_DIR).filter(f => f.endsWith('_diffs.md'));
  const results: QuarterlyFile[] = files
    .sort()
    .reverse()
    .map(filename => {
      const isFull = filename.includes('_full_diffs');
      const isMini = filename.includes('_mini_diffs');
      if (!isFull && !isMini) return null;

      const period = filename.replace('_full_diffs.md', '').replace('_mini_diffs.md', '');
      const mdPath = path.join(QUARTERLY_DIR, filename);
      const jsonPath = mdPath.replace('.md', '.json');
      const mdContent = fs.existsSync(mdPath) ? fs.readFileSync(mdPath, 'utf-8') : '';
      const hasJson = fs.existsSync(jsonPath);
      let jsonContent = null;
      if (hasJson) {
        try { jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf-8')); } catch { /* ignore */ }
      }
      return {
        filename,
        type: isFull ? 'full' : 'mini',
        period,
        hasJson,
        mdContent,
        jsonContent,
      } as QuarterlyFile;
    })
    .filter(Boolean) as QuarterlyFile[];

  return NextResponse.json(results);
}

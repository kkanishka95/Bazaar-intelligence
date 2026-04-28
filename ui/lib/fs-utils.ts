import fs from 'fs';
import path from 'path';

const ROOT = path.join(process.cwd(), '..');

export const DATA_DIR = path.join(ROOT, 'data');
export const PREDICTIONS_DIR = path.join(ROOT, 'predictions');
export const FEEDBACK_DIR = path.join(ROOT, 'feedback');
export const OUTPUT_DIR = path.join(ROOT, 'output');

export function getISTDate(date?: Date): Date {
  const d = date || new Date();
  return new Date(d.getTime() + 330 * 60 * 1000);
}

export function getISTNow() {
  return getISTDate(new Date());
}

export function formatDate(d: Date): string {
  const ist = getISTDate(d);
  const y = ist.getUTCFullYear();
  const m = String(ist.getUTCMonth() + 1).padStart(2, '0');
  const day = String(ist.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayIST(): string {
  return formatDate(new Date());
}

function datePath(base: string, date: string): string {
  const [y, m] = date.split('-');
  return path.join(base, y, m);
}

export function readJSON(filePath: string): unknown | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

export function readText(filePath: string): string | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

export function getDataFile(date: string, type: 'pm' | 'am' | 'pre') {
  const dir = datePath(DATA_DIR, date);
  const suffix = type === 'pre' ? '_pre.json' : `_${type}_data.json`;
  return path.join(dir, `${date}${suffix}`);
}

export function getPredictionFile(date: string, type: 'pm' | 'am') {
  const dir = datePath(PREDICTIONS_DIR, date);
  // Agents write YYYY-MM-DD_pm.json (not _prediction suffix)
  return path.join(dir, `${date}_${type}.json`);
}

export function getEvalFile(date: string) {
  const dir = datePath(FEEDBACK_DIR, date);
  return path.join(dir, `${date}_eval.json`);
}

export function getWhatsappFile(date: string, type: 'pm' | 'am') {
  const dir = datePath(OUTPUT_DIR, date);
  return path.join(dir, `${date}_${type}_whatsapp.txt`);
}

export function getPrevTradingDay(date: string): string {
  const d = new Date(date + 'T12:00:00Z');
  do {
    d.setUTCDate(d.getUTCDate() - 1);
  } while (d.getUTCDay() === 0 || d.getUTCDay() === 6);
  return d.toISOString().slice(0, 10);
}

export function listAllDates(): string[] {
  const dates = new Set<string>();
  const dirs = [DATA_DIR, PREDICTIONS_DIR, FEEDBACK_DIR, OUTPUT_DIR];

  for (const base of dirs) {
    if (!fs.existsSync(base)) continue;
    try {
      const years = fs.readdirSync(base).filter(d => /^\d{4}$/.test(d));
      for (const year of years) {
        const yPath = path.join(base, year);
        const months = fs.readdirSync(yPath).filter(d => /^\d{2}$/.test(d));
        for (const month of months) {
          const mPath = path.join(yPath, month);
          const files = fs.readdirSync(mPath);
          for (const file of files) {
            const match = file.match(/^(\d{4}-\d{2}-\d{2})/);
            if (match) dates.add(match[1]);
          }
        }
      }
    } catch {
      // ignore
    }
  }

  return Array.from(dates).sort((a, b) => b.localeCompare(a));
}

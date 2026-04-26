import { NextResponse } from 'next/server';
import { todayIST, getDataFile, readJSON } from '@/lib/fs-utils';

export async function GET() {
  const today = todayIST();
  const preFile = getDataFile(today, 'pre');
  const data = readJSON(preFile);

  if (!data) {
    return NextResponse.json({ date: today, data: null });
  }

  return NextResponse.json({ date: today, data });
}

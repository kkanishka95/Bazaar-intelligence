'use client';

interface ScoreBadgeProps {
  score: number | null;
  avg?: number | null;
  size?: 'sm' | 'md' | 'lg';
}

function getScoreColor(score: number | null): string {
  if (score === null) return 'text-slate-500';
  if (score >= 9) return 'text-blue-300';
  if (score >= 7) return 'text-blue-400';
  if (score >= 5) return 'text-blue-500';
  if (score >= 3) return 'text-slate-400';
  return 'text-slate-500';
}

export default function ScoreBadge({ score, avg, size = 'md' }: ScoreBadgeProps) {
  const sizeClass = size === 'lg' ? 'text-3xl font-bold' : size === 'sm' ? 'text-sm' : 'text-base font-semibold';

  if (score === null) {
    return <span className={`${sizeClass} text-slate-500`}>Pending</span>;
  }

  return (
    <span className={`${sizeClass} ${getScoreColor(score)}`}>
      {score}/10
      {avg !== undefined && avg !== null && (
        <span className="text-slate-500 text-sm font-normal ml-1">(30d avg: {avg})</span>
      )}
    </span>
  );
}

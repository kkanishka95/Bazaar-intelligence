'use client';

interface CallBadgeProps {
  call: string;
  size?: 'sm' | 'md' | 'lg';
}

function getCallColor(call: string): string {
  if (!call) return 'bg-slate-700 text-slate-200';
  const upper = call.toUpperCase();
  if (upper.includes('GAP_UP')) return 'bg-green-900 text-green-300 border border-green-700';
  if (upper.includes('GAP_DOWN')) return 'bg-red-900 text-red-300 border border-red-700';
  if (upper.includes('FLAT')) return 'bg-slate-700 text-slate-300 border border-slate-600';
  if (upper.includes('HIGH_VOLATILITY') || upper.includes('VOLATILE')) return 'bg-amber-900 text-amber-300 border border-amber-700';
  return 'bg-slate-700 text-slate-300 border border-slate-600';
}

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5 rounded',
  md: 'text-sm px-3 py-1 rounded-md font-semibold',
  lg: 'text-2xl px-4 py-2 rounded-lg font-bold',
};

export default function CallBadge({ call, size = 'md' }: CallBadgeProps) {
  return (
    <span className={`inline-block font-mono ${sizeClasses[size]} ${getCallColor(call)}`}>
      {call || 'UNKNOWN'}
    </span>
  );
}

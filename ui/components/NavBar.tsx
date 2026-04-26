'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface PreData {
  status?: string;
  event_name?: string;
}

export default function NavBar() {
  const pathname = usePathname();
  const [preAlert, setPreAlert] = useState(false);
  const [preLabel, setPreLabel] = useState('');

  useEffect(() => {
    async function pollPre() {
      try {
        const res = await fetch('/api/pre/latest');
        if (!res.ok) return;
        const data: PreData = await res.json();
        if (data?.status === 'CONFIRMED_PRE') {
          setPreAlert(true);
          setPreLabel(data.event_name || 'PRE EVENT');
        } else {
          setPreAlert(false);
        }
      } catch { /* ignore */ }
    }

    pollPre();
    const id = setInterval(pollPre, 5 * 60 * 1000); // every 5 min
    return () => clearInterval(id);
  }, []);

  const links = [
    { href: '/', label: 'Dashboard' },
    { href: '/history', label: 'History' },
    { href: '/performance', label: 'Performance' },
    { href: '/quarterly', label: 'Quarterly' },
  ];

  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center gap-6 sticky top-0 z-40">
      <span className="text-blue-400 font-bold text-sm tracking-widest mr-4">BAZAAR INTEL</span>
      {links.map(l => (
        <Link
          key={l.href}
          href={l.href}
          className={`text-sm font-medium transition-colors ${
            pathname === l.href
              ? 'text-white border-b-2 border-blue-500 pb-0.5'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {l.label}
        </Link>
      ))}
      {preAlert && (
        <span className="ml-auto flex items-center gap-1.5 bg-red-950 border border-red-700 text-red-300 text-xs font-semibold px-3 py-1 rounded-full animate-pulse">
          ⚡ {preLabel}
        </span>
      )}
    </nav>
  );
}

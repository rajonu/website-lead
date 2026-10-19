'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, CheckCircle2 } from 'lucide-react';

export default function SyncBrevoEventsButton() {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setStatus(null);
    try {
      const res = await fetch('/api/leads/sync-events', { method: 'POST' });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        setStatus(`Synced: ${data.stats?.bouncedCount || 0} bounced, ${data.stats?.deliveredCount || 0} delivered`);
        router.refresh();
      } else {
        setStatus('Failed to sync events from Brevo');
      }
    } catch {
      setStatus('Network error syncing Brevo events');
    } finally {
      setSyncing(false);
      setTimeout(() => setStatus(null), 4000);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {status && (
        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          {status}
        </span>
      )}
      <button
        onClick={handleSync}
        disabled={syncing}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
        title="Check Brevo API for bounces, deliveries, and opens"
      >
        <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${syncing ? 'animate-spin' : ''}`} />
        <span>{syncing ? 'Checking Brevo...' : 'Check Brevo Events'}</span>
      </button>
    </div>
  );
}

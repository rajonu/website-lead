'use client';

import { useState, useEffect } from 'react';
import { 
  Bot, 
  Play, 
  Pause, 
  RefreshCw, 
  Clock, 
  Send, 
  MessageSquare, 
  Trash2, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Flame
} from 'lucide-react';
import { AutopilotState, AutopilotLogEntry } from '@/lib/services/autopilot';

const ROTATION_STEPS = [
  { step: 0, label: 'Dhaka Audit #1', flag: '🇧🇩', market: 'BD (Dhanmondi)' },
  { step: 1, label: 'Dhaka Audit #2', flag: '🇧🇩', market: 'BD (Uttara)' },
  { step: 2, label: 'Dhaka Audit #3', flag: '🇧🇩', market: 'BD (Gulshan)' },
  { step: 3, label: 'Dhaka Audit #4', flag: '🇧🇩', market: 'BD (Banani)' },
  { step: 4, label: 'Dhaka Audit #5', flag: '🇧🇩', market: 'BD (Mirpur)' },
];

export default function AutopilotCard() {
  const [state, setState] = useState<AutopilotState | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningAction, setRunningAction] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/autopilot');
      const json = await res.json();
      if (json.success && json.data) {
        setState(json.data);
      }
    } catch (err) {
      console.error('Failed to load autopilot status', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleToggle = async () => {
    if (!state) return;
    setRunningAction(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/autopilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', enabled: !state.enabled }),
      });
      const json = await res.json();
      if (json.success) {
        setState(json.data);
        setFeedback(json.message);
      }
    } catch (err) {
      setFeedback('Failed to update autopilot state.');
    } finally {
      setRunningAction(false);
    }
  };

  const handleToggleDryRun = async () => {
    if (!state) return;
    setRunningAction(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/autopilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_dry_run', dryRun: !state.dryRun }),
      });
      const json = await res.json();
      if (json.success) {
        setState(json.data);
        setFeedback(json.message);
      }
    } catch (err) {
      setFeedback('Failed to update sending mode.');
    } finally {
      setRunningAction(false);
    }
  };

  const handleRunCycle = async () => {
    setRunningAction(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/autopilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run_cycle' }),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback(`Success: Audited ${json.data?.market} prospect "${json.data?.lead?.name || ''}" (${json.data?.action}).`);
        await fetchStatus();
      } else {
        setFeedback(`Cycle alert: ${json.data?.error || json.message || 'Execution halted'}`);
      }
    } catch (err) {
      setFeedback('Network error while running autopilot cycle.');
    } finally {
      setRunningAction(false);
    }
  };

  const handleRunDhakaDailyBatch = async () => {
    setRunningAction(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/autopilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run_dhaka_batch', count: 5 }),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback(json.message || `Successfully audited 5 Dhaka websites!`);
        await fetchStatus();
      } else {
        setFeedback(`Audit alert: ${json.message || 'Execution halted'}`);
      }
    } catch {
      setFeedback('Network error while running Dhaka daily batch audit.');
    } finally {
      setRunningAction(false);
    }
  };

  const currentStep = state ? state.rotationStep % 5 : 0;
  const currentStepObj = ROTATION_STEPS[currentStep];

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white rounded-2xl border border-indigo-900/50 shadow-xl overflow-hidden">
      {/* Top Banner */}
      <div className="p-5 md:p-6 border-b border-indigo-950/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start md:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">Dhaka Mobile Audit Autopilot</h3>
              {state?.enabled ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active 24/7 (Dhaka Focus)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  Paused
                </span>
              )}

              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                🇧🇩 Domestic Target (US/UK Paused)
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              গুগল ম্যাপস থেকে ভালো রিভিউর ৫টি ঢাকা ওয়েবসাইট অডিট ➔ মোবাইল সমস্যা চিহ্নিতকরণ ➔ Cloudflare Edge ডেমো ➔ ১-ক্লিক হোয়াটসঅ্যাপ আউটরিচ।
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleRunDhakaDailyBatch}
            disabled={runningAction || loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/30 active:scale-95 cursor-pointer"
            title="Execute daily batch of 5 Dhaka website mobile audits"
          >
            <span>📱 Audit 5 Dhaka Sites</span>
          </button>

          <button
            onClick={handleRunCycle}
            disabled={runningAction || loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/30 active:scale-95 cursor-pointer"
            title="Execute 1 hourly prospecting cycle immediately"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${runningAction ? 'animate-spin' : ''}`} />
            <span>Audit 1 Site Now</span>
          </button>

          <button
            onClick={handleToggle}
            disabled={runningAction || loading}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              state?.enabled
                ? 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
            }`}
          >
            {state?.enabled ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Resume</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Feedback banner if present */}
      {feedback && (
        <div className="px-6 py-2.5 bg-indigo-950/80 border-b border-indigo-900/50 flex items-center justify-between text-xs text-indigo-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white text-xs px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Market Rotation Indicator Bar */}
      <div className="p-5 md:p-6 bg-slate-900/50 border-b border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Dhaka Hub Target Neighborhoods (Daily Audit Sequence)
          </span>
          <span className="text-xs text-sky-400 font-medium">
            Next target: <strong className="text-white font-bold">{currentStepObj.flag} {currentStepObj.market}</strong> (Step {currentStep + 1} of 5)
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {ROTATION_STEPS.map((s) => {
            const isCurrent = s.step === currentStep;
            const isPast = state ? (state.rotationStep % 5) > s.step : false;

            return (
              <div
                key={s.step}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isCurrent
                    ? 'bg-indigo-600/30 border-indigo-400/80 ring-2 ring-indigo-500/40 shadow-lg'
                    : isPast
                    ? 'bg-slate-800/50 border-slate-700/60 text-slate-400'
                    : 'bg-slate-900/80 border-slate-800 text-slate-500'
                }`}
              >
                <div className="text-base">{s.flag}</div>
                <div className={`text-xs font-bold mt-1 ${isCurrent ? 'text-white' : 'text-slate-300'}`}>
                  {s.market} #{s.step === 0 || s.step === 2 ? '1' : s.step === 1 || s.step === 3 ? '2' : '1'}
                </div>
                <div className="text-[10px] mt-0.5 font-mono text-slate-400">
                  {isCurrent ? (
                    <span className="text-sky-300 font-bold animate-pulse">UPCOMING</span>
                  ) : (
                    <span>Step {s.step + 1}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-5 md:p-6 bg-slate-950/40">
        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
          <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
            <span>Total Cycles</span>
            <Clock className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-2xl font-black text-white mt-1.5">{state?.totalRuns ?? 0}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Scrapes executed</div>
        </div>

        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
          <div className="text-[11px] font-medium text-sky-400 flex items-center justify-between">
            <span>Automated Emails</span>
            <Send className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-sky-300 mt-1.5">{state?.emailsSent ?? 0}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {state?.dryRun ? 'Simulated (Dry-Run)' : 'Live sent via Brevo API'}
          </div>
        </div>

        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
          <div className="text-[11px] font-medium text-emerald-400 flex items-center justify-between">
            <span>WhatsApp Queue</span>
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-300 mt-1.5">{state?.whatsappQueued ?? 0}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Saved for Raj&apos;s review</div>
        </div>

        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
          <div className="text-[11px] font-medium text-purple-400 flex items-center justify-between">
            <span>30-Day Purged</span>
            <Trash2 className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-300 mt-1.5">{state?.cleanedCount ?? 0}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Cloudflare KV cleaned</div>
        </div>
      </div>

      {/* Toggle Activity Logs Drawer */}
      <div className="border-t border-slate-800 px-5 md:px-6 py-3 bg-slate-950/70 flex items-center justify-between">
        <button
          onClick={() => setShowLogs(!showLogs)}
          className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5"
        >
          <span>Recent Autopilot Activity Log ({state?.recentLogs?.length || 0})</span>
          {showLogs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
          <span>Hosted on Cloudflare Edge KV (Independent of Pi uptime)</span>
        </div>
      </div>

      {/* Recent Logs List */}
      {showLogs && (
        <div className="p-5 md:p-6 bg-slate-950/90 border-t border-slate-800 space-y-2 max-h-72 overflow-y-auto">
          {(!state?.recentLogs || state.recentLogs.length === 0) ? (
            <div className="text-xs text-slate-500 text-center py-4">
              No recent activity recorded yet. Click &quot;Run 1 Cycle Now&quot; to test the pipeline.
            </div>
          ) : (
            state.recentLogs.slice(0, 10).map((log: AutopilotLogEntry) => (
              <div
                key={log.id}
                className="p-3 bg-slate-900/90 rounded-lg border border-slate-800/80 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">
                      {log.market === 'US' ? '🇺🇸 US' : log.market === 'UK' ? '🇬🇧 UK' : '🇧🇩 BD'}
                    </span>
                    <span className="text-white font-semibold">{log.leadName}</span>
                    {log.action === 'email_sent' && (
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          log.dryRun
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {log.dryRun ? 'Email Simulated' : 'Live Email Sent'}
                      </span>
                    )}
                    {log.action === 'whatsapp_queued' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        WhatsApp Queued
                      </span>
                    )}
                    {log.action === 'cleaned_expired' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        30d Cleaned
                      </span>
                    )}
                    {log.action === 'error' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Error
                      </span>
                    )}
                  </div>
                  <div className="text-slate-400 text-[11px] leading-relaxed">{log.details}</div>
                </div>

                <div className="flex flex-col items-end shrink-0 gap-1">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {log.leadSlug && (
                    <a
                      href={`https://live.d4f.me/${log.leadSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1"
                    >
                      <span>Edge Demo</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                  {log.dryRun && log.action === 'email_sent' && (
                    <a
                      href="/recommendations?tab=sent"
                      className="text-[10px] text-amber-300 hover:text-amber-200 underline font-semibold flex items-center gap-0.5"
                      title="View in Sent History to dispatch live"
                    >
                      <span>Send Live →</span>
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

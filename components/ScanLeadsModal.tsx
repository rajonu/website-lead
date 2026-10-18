'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, Sparkles, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

export default function ScanLeadsModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [count, setCount] = useState<number>(3);
  const [market, setMarket] = useState<string>('ALL');
  const [niche, setNiche] = useState<string>('ALL');
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{ count: number; message: string } | null>(null);

  const handleRunScan = async () => {
    setScanning(true);
    setError(null);
    setSuccessResult(null);

    try {
      const res = await fetch('/api/leads/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count, market, niche }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error || 'Failed to scan leads.');
        return;
      }

      setSuccessResult({
        count: data.addedCount,
        message: data.message || `Successfully added ${data.addedCount} new qualified leads.`,
      });

      router.refresh();

      setTimeout(() => {
        if (data.addedCount > 0) {
          setIsOpen(false);
          setSuccessResult(null);
        }
      }, 2000);
    } catch {
      setError('Communication error with server scan engine.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
          setError(null);
          setSuccessResult(null);
        }}
        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
      >
        <Search className="w-3.5 h-3.5" />
        <span>Scan New Leads</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Scan &amp; Discover Local Leads</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Scan Google Maps profiles without websites and generate instant mobile demos.
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                disabled={scanning}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Error & Success Messages */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successResult && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">{successResult.message}</div>
                  <div className="text-[11px] text-emerald-700">Updating your Pending Review Queue...</div>
                </div>
              </div>
            )}

            {/* Scan Configuration Form */}
            <div className="space-y-4 text-xs">
              {/* Batch Size Selector (2, 3, or 5) */}
              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-slate-600 text-[11px]">
                  Leads per Scan Batch:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[2, 3, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCount(num)}
                      className={`py-2 px-3 rounded-lg border text-xs font-bold text-center transition-all cursor-pointer ${
                        count === num
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {num} Leads
                    </button>
                  ))}
                </div>
              </div>

              {/* Market Filter */}
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-slate-600 text-[11px]">
                  Target Region / Market:
                </label>
                <select
                  value={market}
                  onChange={(e) => setMarket(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">🌐 All Available Regions</option>
                  <option value="US">🇺🇸 United States (Dallas, Austin, Fort Worth, Miami)</option>
                  <option value="UK">🇬🇧 United Kingdom (London, Birmingham, Manchester)</option>
                  <option value="BD">🇧🇩 Bangladesh (Dhaka - Dhanmondi, Uttara)</option>
                </select>
              </div>

              {/* Niche Filter */}
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-slate-600 text-[11px]">
                  Business Niche:
                </label>
                <select
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">🎯 All High-Ticket Trade Niches</option>
                  <option value="HVAC">❄️ HVAC &amp; Air Conditioning</option>
                  <option value="Roofing">🏠 Roofing Contractor</option>
                  <option value="Plumbing">🔧 Plumbing &amp; Water Heaters</option>
                  <option value="Electrician">⚡ Certified Electricians</option>
                  <option value="Dental">🦷 Dental Practice</option>
                  <option value="Healthcare">🏥 Diagnostic &amp; Clinics</option>
                  <option value="Salon">💆 Salon &amp; Bridal Spa</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div className="font-semibold text-slate-700">What the scanner does:</div>
                <div>• Scans businesses with 50+ reviews &amp; no official website.</div>
                <div>• Auto-generates high-converting mobile demo structure.</div>
                <div>• Pre-populates outreach draft with your verified signature.</div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsOpen(false)}
                disabled={scanning}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRunScan}
                disabled={scanning}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
              >
                {scanning ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Scanning Places...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Scan {count} Prospects Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import { MARKETS } from '@/lib/config/markets';
import { Settings, Globe, Mail, Sliders, ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-700" />
          <span>System & Market Experiment Configurations</span>
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Configurable market tracks, outreach sender identity, and daily curation limits.
        </p>
      </div>

      {/* Outreach Identity */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
          <Mail className="w-5 h-5 text-sky-600" />
          <span>Personal Outreach Identity</span>
        </div>
        <p className="text-xs text-slate-500">
          Personal identity configuration for value-first cold outreach (zero bulk spam).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-400 block font-medium">Sender Name:</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">Raj</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-400 block font-medium">Sender Mailbox (Dedicated domain):</span>
            <span className="font-mono font-bold text-sky-700 text-sm mt-0.5 block">raj@d4f.me</span>
          </div>
        </div>
      </div>

      {/* Market Tracks */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
          <Globe className="w-5 h-5 text-indigo-600" />
          <span>Active Market Experiment Tracks</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {Object.entries(MARKETS).map(([key, config]) => (
            <div key={key} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">{config.name}</h3>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-mono font-bold">
                  {config.currency} ({config.currencySymbol})
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <span className="font-semibold text-slate-700 block">Target Metros & Cities:</span>
                <div className="space-y-1">
                  {config.cities.map((city, idx) => (
                    <div key={idx} className="p-2 bg-slate-50 rounded border border-slate-100">
                      <div className="font-medium text-slate-800">{city.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Niches: {city.suggestedNiches.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-xs space-y-1">
                <span className="font-semibold text-slate-700 block">Pricing Experiments:</span>
                {config.pricingTiers.map((tier, idx) => (
                  <div key={idx} className="flex justify-between text-[11px] text-slate-600">
                    <span>{tier.name}</span>
                    <span className="font-bold text-slate-900">
                      {config.currencySymbol}{tier.monthlyFee}/mo
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Safety & Concurrency Limits */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
          <Sliders className="w-5 h-5 text-emerald-600" />
          <span>System Guardrails & Rate Limits</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-400 block font-medium">Daily Recommendation Cap:</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">5 leads / day</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-400 block font-medium">Automated Bulk Sending:</span>
            <span className="font-bold text-emerald-700 text-sm mt-0.5 block">DISABLED (Strict QA)</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-400 block font-medium">Deployment Target:</span>
            <span className="font-mono text-slate-700 text-sm mt-0.5 block">Raspberry Pi ARM64 / Docker</span>
          </div>
        </div>
      </div>
    </div>
  );
}

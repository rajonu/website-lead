import Link from 'next/link';
import AutopilotCard from '@/components/AutopilotCard';
import { LeadRepository } from '@/lib/db';
import { MARKETS } from '@/lib/config/markets';
import { 
  Sparkles, 
  ArrowRight, 
  ExternalLink, 
  MapPin, 
  Star, 
  CheckCircle2, 
  Clock, 
  Eye, 
  Send, 
  ShieldAlert,
  Building2,
  DollarSign
} from 'lucide-react';

export const revalidate = 0;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ market?: string }>;
}) {
  const { market } = await searchParams;
  const currentMarket = market || 'ALL';

  const metrics = await LeadRepository.getFunnelMetrics(currentMarket !== 'ALL' ? currentMarket : undefined);
  const recommendations = await LeadRepository.getDailyRecommendations(3);
  const allLeads = await LeadRepository.getAllLeads(currentMarket !== 'ALL' ? { market: currentMarket } : undefined);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header & Market Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">
            Pipeline overview, daily human approval queue, and customer maintenance.
          </p>
        </div>

        {/* Market Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-lg text-xs font-medium">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-md transition-colors ${
              currentMarket === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Markets
          </Link>
          <Link
            href="/?market=US"
            className={`px-3 py-1.5 rounded-md transition-colors ${
              currentMarket === 'US' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🇺🇸 US (DFW, HOU, ORL)
          </Link>
          <Link
            href="/?market=UK"
            className={`px-3 py-1.5 rounded-md transition-colors ${
              currentMarket === 'UK' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🇬🇧 UK (MCR, BHM, LDS)
          </Link>
          <Link
            href="/?market=BD"
            className={`px-3 py-1.5 rounded-md transition-colors ${
              currentMarket === 'BD' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🇧🇩 BD (Dhaka)
          </Link>
        </div>
      </div>

      {/* Hourly Prospecting Autopilot System */}
      <AutopilotCard />

      {/* Funnel Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Discovered</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{metrics.totalDiscovered}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Places audited</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Researched</div>
          <div className="text-2xl font-bold text-indigo-600 mt-1">{metrics.researched}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Website checked</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">High Score</div>
          <div className="text-2xl font-bold text-sky-600 mt-1">{metrics.qualifiedHighScore}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Score ≥ 80</div>
        </div>

        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 shadow-sm">
          <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider">For Raj Today</div>
          <div className="text-2xl font-bold text-amber-800 mt-1">{metrics.awaitingReview}</div>
          <div className="text-[11px] text-amber-600 mt-0.5">Awaiting QA</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Demos Live</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{metrics.demosReady}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Multi-tenant</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Contacted</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{metrics.contacted}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Personal sent</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Replied</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">{metrics.replied}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Conversations</div>
        </div>

        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 shadow-sm">
          <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Won Clients</div>
          <div className="text-2xl font-bold text-emerald-800 mt-1">{metrics.activeClients}</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Retained MRR</div>
        </div>
      </div>

      {/* Daily Top Recommendations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-slate-900">Today&apos;s Recommended Prospects</h3>
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
              Curated: {recommendations.length} of 5 max
            </span>
          </div>
          <Link
            href="/recommendations"
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            Open Full Daily Queue <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {recommendations.map((lead) => (
            <div
              key={lead.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {lead.category}
                    </span>
                    <h4 className="font-bold text-slate-900 text-base leading-snug">{lead.name}</h4>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-extrabold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                      {lead.qualification?.score ?? 0} pts
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {Math.round((lead.qualification?.confidence ?? 0.8) * 100)}% conf
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{lead.location.city}, {lead.location.country}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="font-semibold">{lead.businessSignals?.rating}</span>
                    <span className="text-slate-400">({lead.businessSignals?.reviewCount})</span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg text-xs space-y-1.5 border border-slate-100">
                  <div className="font-medium text-slate-700 text-[11px]">Why Recommended:</div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {lead.qualification?.reason || lead.research?.summary}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link
                  href={`/preview/${lead.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-sky-600"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Demo</span>
                </Link>

                <Link
                  href="/recommendations"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
                >
                  <span>Review & Approve</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Pipeline Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Current Pipeline Leads</h3>
            <p className="text-xs text-slate-500">Live prospects across lifecycle stages</p>
          </div>
          <Link
            href="/pipeline"
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            View Kanban Board <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="p-3.5">Business Name</th>
                  <th className="p-3.5">Market & Category</th>
                  <th className="p-3.5">Google Reputation</th>
                  <th className="p-3.5">Website State</th>
                  <th className="p-3.5">Stage</th>
                  <th className="p-3.5">Score</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">
                      <div>{lead.name}</div>
                      <div className="text-[11px] font-normal text-slate-400">{lead.contacts[0]?.value || 'No email'}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-medium text-slate-700">{lead.category}</div>
                      <div className="text-slate-400">{lead.location.city}, {lead.location.country}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="font-bold">{lead.businessSignals?.rating ?? 'N/A'}</span>
                        <span className="text-slate-400">({lead.businessSignals?.reviewCount ?? 0})</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                        lead.website.status === 'none' ? 'bg-amber-100 text-amber-800' :
                        lead.website.status === 'adequate' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {lead.website.status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
                        {lead.lifecycle}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-sky-600">
                      {lead.qualification?.score ?? 0}
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <Link
                        href={`/preview/${lead.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-slate-600 hover:text-sky-600 font-medium"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Demo</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

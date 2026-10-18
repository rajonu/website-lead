import { LeadRepository } from '@/lib/db';
import { WebsiteLead, LifecycleStage } from '@/lib/types/lead';
import Link from 'next/link';
import { 
  Kanban, 
  MapPin, 
  Star, 
  ExternalLink, 
  Eye, 
  Phone, 
  Mail, 
  CheckCircle2 
} from 'lucide-react';

export const revalidate = 0;

const PIPELINE_COLUMNS: Array<{ stage: LifecycleStage; label: string; color: string }> = [
  { stage: 'new', label: '1. New Discovered', color: 'border-slate-300 bg-slate-50' },
  { stage: 'researching', label: '2. AI Researching', color: 'border-indigo-300 bg-indigo-50/30' },
  { stage: 'demo_ready', label: '3. Demo Live', color: 'border-blue-300 bg-blue-50/30' },
  { stage: 'review', label: '4. For Raj QA', color: 'border-amber-300 bg-amber-50/30' },
  { stage: 'approved', label: '5. Approved', color: 'border-emerald-300 bg-emerald-50/30' },
  { stage: 'contacted', label: '6. Contacted', color: 'border-sky-300 bg-sky-50/30' },
  { stage: 'replied', label: '7. Conversations', color: 'border-purple-300 bg-purple-50/30' },
  { stage: 'client', label: '8. Won Customer', color: 'border-emerald-400 bg-emerald-50/50' },
];

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ market?: string }>;
}) {
  const { market } = await searchParams;
  const allLeads = await LeadRepository.getAllLeads(market ? { market } : undefined);

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Kanban className="w-6 h-6 text-indigo-600" />
            <span>Lead Lifecycle Pipeline</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Complete conversion funnel from initial Places discovery to paying maintained client.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <Link
            href="/pipeline"
            className={`px-3 py-1.5 rounded-lg border ${!market ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200'}`}
          >
            All Markets
          </Link>
          <Link
            href="/pipeline?market=US"
            className={`px-3 py-1.5 rounded-lg border ${market === 'US' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200'}`}
          >
            🇺🇸 US
          </Link>
          <Link
            href="/pipeline?market=UK"
            className={`px-3 py-1.5 rounded-lg border ${market === 'UK' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200'}`}
          >
            🇬🇧 UK
          </Link>
          <Link
            href="/pipeline?market=BD"
            className={`px-3 py-1.5 rounded-lg border ${market === 'BD' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200'}`}
          >
            🇧🇩 BD
          </Link>
        </div>
      </div>

      {/* Horizontal Kanban Scroll */}
      <div className="flex gap-4 overflow-x-auto pb-6">
        {PIPELINE_COLUMNS.map((col) => {
          const colLeads = allLeads.filter((l) => l.lifecycle === col.stage);
          return (
            <div
              key={col.stage}
              className={`w-72 flex-shrink-0 rounded-xl border ${col.color} p-3 flex flex-col max-h-[80vh] shadow-sm`}
            >
              <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-200/60 font-bold text-xs text-slate-800">
                <span>{col.label}</span>
                <span className="w-5 h-5 rounded-full bg-slate-200/80 flex items-center justify-center text-[10px] text-slate-700">
                  {colLeads.length}
                </span>
              </div>

              <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                {colLeads.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs italic">
                    No leads here
                  </div>
                ) : (
                  colLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-xs hover:shadow-md transition-shadow space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {lead.category}
                        </span>
                        <span className="text-xs font-black text-sky-600">
                          {lead.qualification?.score ?? 0}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm leading-snug">
                        {lead.name}
                      </h4>

                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{lead.location.city}, {lead.location.country}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span className="font-semibold">{lead.businessSignals?.rating ?? 'N/A'}</span>
                          <span>({lead.businessSignals?.reviewCount ?? 0})</span>
                        </div>

                        <Link
                          href={`/preview/${lead.slug}`}
                          target="_blank"
                          className="text-sky-600 hover:underline font-semibold flex items-center gap-0.5"
                        >
                          <span>Demo</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

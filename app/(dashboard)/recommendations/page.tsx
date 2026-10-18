import { LeadRepository } from '@/lib/db';
import RecommendationCard from '@/components/RecommendationCard';
import { Sparkles, ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function RecommendationsPage() {
  const recommendations = await LeadRepository.getDailyRecommendations(5);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/" className="text-slate-400 hover:text-slate-700">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-500" />
              <span>Daily Recommendation Queue</span>
            </h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Top 2–5 high-confidence prospects curated for Raj&apos;s personal review and outreach approval.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800 font-medium">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>Human Approval Gate Active</span>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-6">
        {recommendations.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
            <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700 text-base">Queue is Empty for Today!</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              All top recommended prospects have been reviewed or approved. New leads from scheduled discovery will appear here tomorrow morning.
            </p>
          </div>
        ) : (
          recommendations.map((lead) => (
            <RecommendationCard key={lead.id} lead={lead} />
          ))
        )}
      </div>
    </div>
  );
}

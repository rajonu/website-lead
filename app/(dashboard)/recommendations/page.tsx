import { LeadRepository } from '@/lib/db';
import RecommendationCard from '@/components/RecommendationCard';
import ContactedLeadCard from '@/components/ContactedLeadCard';
import { Sparkles, ShieldCheck, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function RecommendationsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = 'queue' } = await searchParams;
  const recommendations = await LeadRepository.getDailyRecommendations(10);
  const contactedLeads = await LeadRepository.getContactedLeads();

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
              <span>Daily Outreach Station</span>
            </h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Review top high-confidence prospects, send 1-to-1 personal emails via Brevo, and track client delivery history.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800 font-medium">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>Human Approval Gate Active</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <Link
          href="/recommendations?tab=queue"
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            tab !== 'sent'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Pending Review Queue</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-700 font-semibold">
            {recommendations.length}
          </span>
        </Link>

        <Link
          href="/recommendations?tab=sent"
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            tab === 'sent'
              ? 'border-sky-600 text-sky-600 bg-sky-50/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Sent & Contacted History</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-sky-100 text-sky-700 font-semibold">
            {contactedLeads.length}
          </span>
        </Link>
      </div>

      {/* Tab 1: Pending Queue */}
      {tab !== 'sent' && (
        <div className="space-y-6">
          {recommendations.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-slate-700 text-base">Active Queue is Clear!</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                All high-confidence prospects have been approved or contacted. You can inspect all delivered emails in the{' '}
                <Link href="/recommendations?tab=sent" className="text-sky-600 font-semibold hover:underline">
                  Sent & Contacted History
                </Link>{' '}
                tab.
              </p>
            </div>
          ) : (
            recommendations.map((lead) => (
              <RecommendationCard key={lead.id} lead={lead} />
            ))
          )}
        </div>
      )}

      {/* Tab 2: Sent & Contacted History */}
      {tab === 'sent' && (
        <div className="space-y-4">
          <div className="bg-sky-50/60 border border-sky-100 rounded-lg p-3 text-xs text-sky-900 flex items-center justify-between">
            <span>
              All transactional emails sent via Brevo are delivered with sender <strong>Raj Syful &lt;raj@d4f.me&gt;</strong>.
              Client replies will arrive directly in your <strong>raj@d4f.me</strong> inbox.
            </span>
            <Link
              href="/pipeline"
              className="text-xs font-semibold text-sky-700 hover:underline whitespace-nowrap ml-2"
            >
              View Full Pipeline →
            </Link>
          </div>

          {contactedLeads.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
              <Send className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-700 text-base">No Sent Outreach Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Once you approve a lead in the queue and send an email via Brevo or WhatsApp, its delivery record and timestamp will appear here.
              </p>
            </div>
          ) : (
            contactedLeads.map((lead) => (
              <ContactedLeadCard key={lead.id} lead={lead} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

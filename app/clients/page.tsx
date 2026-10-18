import { LeadRepository } from '@/lib/db';
import Link from 'next/link';
import { 
  Users, 
  Globe, 
  ShieldCheck, 
  Clock, 
  ExternalLink, 
  AlertTriangle, 
  DollarSign,
  HeartPulse,
  CheckCircle2
} from 'lucide-react';

export const revalidate = 0;

export default async function ClientsPage() {
  const allLeads = await LeadRepository.getAllLeads();
  const clients = allLeads.filter(
    (l) => l.customer?.isCustomer || l.lifecycle === 'client' || l.lifecycle === 'maintenance'
  );

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            <span>Clients & Active Maintenance</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Converted business accounts, custom domains, uptime health, and ongoing support tasks.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 text-xs font-semibold text-emerald-800">
          <HeartPulse className="w-4 h-4 text-emerald-600" />
          <span>Active Client Accounts: {clients.length}</span>
        </div>
      </div>

      {/* Retention Value Proposition Box */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-5 shadow-sm space-y-2">
        <div className="flex items-center gap-2 font-bold text-sm text-sky-400">
          <ShieldCheck className="w-4 h-4" />
          <span>The Retention Engine: Why Clients Keep Paying Monthly</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          Recurring subscription revenue is retained by providing ongoing peace of mind: automated SSL certificate renewals, uptime monitoring, monthly Google review synchronization, and up to 2 direct content edits per month.
        </p>
      </div>

      {/* Clients Table / Cards */}
      <div className="space-y-4">
        {clients.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 text-sm">
            No paying clients yet. Approve daily recommendations to close your first local businesses!
          </div>
        ) : (
          clients.map((client) => (
            <div
              key={client.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-slate-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {client.category}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active Subscriber
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{client.name}</h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {client.location.full || `${client.location.city}, ${client.location.country}`}
                  </div>
                </div>

                <div className="flex sm:flex-col sm:items-end justify-between text-xs">
                  <div className="font-bold text-slate-900 text-sm">
                    {client.sales?.quotedPrice ? `${client.sales.quotedPrice} ${client.sales.currency}/mo` : 'Active Retainer'}
                  </div>
                  <div className="text-slate-400 font-mono text-[11px]">
                    Plan: {client.customer?.plan || client.sales?.quotedPlan || 'Managed Web'}
                  </div>
                </div>
              </div>

              {/* Technical Health & Domain Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Custom Domain:</span>
                  <div className="flex items-center gap-1 font-mono font-semibold text-sky-700 mt-0.5">
                    <Globe className="w-3.5 h-3.5 text-sky-500" />
                    <span>{client.customer?.customDomain || `${client.slug}.com`}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">SSL / Cloudflare Status:</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Active & Auto-Renewing
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Next Health Review:</span>
                  <span className="text-slate-700 font-mono mt-0.5 block">
                    {client.maintenance?.nextReviewAt?.split('T')[0] || 'Scheduled monthly'}
                  </span>
                </div>
              </div>

              {/* Open Tasks & Support */}
              {client.maintenance?.openTasks && client.maintenance.openTasks.length > 0 && (
                <div className="text-xs space-y-1">
                  <span className="font-semibold text-slate-700">Open Edit / Maintenance Requests:</span>
                  <ul className="list-disc pl-5 text-slate-600 space-y-0.5">
                    {client.maintenance.openTasks.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

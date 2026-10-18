'use client';

import { useState } from 'react';
import { WebsiteLead } from '@/lib/types/lead';
import { 
  Send, 
  MapPin, 
  Star, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Mail, 
  MessageSquare,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function ContactedLeadCard({ lead }: { lead: WebsiteLead }) {
  const [stage, setStage] = useState(lead.lifecycle);
  const [updating, setUpdating] = useState(false);
  const [showFullHistory, setShowFullHistory] = useState(false);

  const events = lead.outreach?.events || [];
  const latestSentEvent = [...events].reverse().find((e) => e.type === 'sent');
  const recipientEmail = lead.contacts.find((c) => c.channel === 'email')?.value || 'N/A';
  const isDryRun = latestSentEvent?.notes?.includes('[DRY RUN]');

  const handleMarkReplied = async () => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lifecycle: 'replied',
          sales: {
            ...lead.sales,
            stage: 'replied',
            nextAction: 'Review reply and send custom proposal / claim details',
          },
          outreach: {
            ...lead.outreach,
            events: [
              ...events,
              {
                channel: 'email',
                type: 'reply',
                at: new Date().toISOString(),
                notes: 'Client replied to outreach inquiry',
              },
            ],
          },
        }),
      });
      if (res.ok) {
        setStage('replied');
      }
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
              {lead.category}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
              stage === 'replied'
                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                : isDryRun
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}>
              <CheckCircle2 className="w-3 h-3" />
              <span>{stage === 'replied' ? 'Client Replied' : isDryRun ? 'Simulated [DRY RUN]' : 'Delivered via Brevo'}</span>
            </span>
          </div>

          <h3 className="text-lg font-bold text-slate-900 mt-1">{lead.name}</h3>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{lead.location.city}, {lead.location.country}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="font-semibold text-slate-700">{lead.businessSignals?.rating ?? 'N/A'}</span>
              <span>({lead.businessSignals?.reviewCount ?? 0})</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`/preview/${lead.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            <span>View Demo Site</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Sent Delivery Record Box */}
      <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200/80 space-y-2 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-slate-700">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-sky-600" />
            <span>Sent to: <strong className="font-mono text-slate-900">{recipientEmail}</strong></span>
          </div>
          {latestSentEvent?.at && (
            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{new Date(latestSentEvent.at).toLocaleString()}</span>
            </div>
          )}
        </div>

        {latestSentEvent?.notes && (
          <p className="text-[11px] text-slate-600 font-mono bg-white p-2 rounded border border-slate-200 leading-normal">
            {latestSentEvent.notes}
          </p>
        )}
      </div>

      {/* Actions & History Accordion */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          {stage !== 'replied' ? (
            <button
              onClick={handleMarkReplied}
              disabled={updating}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Mark as Client Replied</span>
            </button>
          ) : (
            <span className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              Conversation Active
            </span>
          )}

          <a
            href={`mailto:${recipientEmail}?subject=${encodeURIComponent(`Following up: Website preview for ${lead.name}`)}`}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors flex items-center gap-1"
          >
            <Send className="w-3.5 h-3.5 text-slate-500" />
            <span>Send Follow-up</span>
          </a>
        </div>

        {events.length > 0 && (
          <button
            onClick={() => setShowFullHistory(!showFullHistory)}
            className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium text-[11px]"
          >
            <span>Activity Log ({events.length})</span>
            {showFullHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>

      {/* Expanded History */}
      {showFullHistory && events.length > 0 && (
        <div className="pt-2 border-t border-slate-100 space-y-1.5">
          {events.map((evt, idx) => (
            <div key={idx} className="flex items-start justify-between gap-2 text-[11px] text-slate-600 bg-slate-50 p-2 rounded">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${
                  evt.type === 'sent' ? 'bg-sky-500' : evt.type === 'reply' ? 'bg-purple-500' : 'bg-emerald-500'
                }`} />
                <strong className="uppercase text-slate-800">{evt.type}</strong>
                <span>({evt.channel}): {evt.notes}</span>
              </div>
              {evt.at && (
                <span className="text-slate-400 font-mono text-[10px] whitespace-nowrap">
                  {new Date(evt.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

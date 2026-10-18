'use client';

import { useState } from 'react';
import { WebsiteLead, OutreachEvent } from '@/lib/types/lead';
import { getEmailSubject } from '@/lib/ai/outreach';
import { 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Send, 
  Copy, 
  Edit3,
  MessageSquare,
  AlertCircle,
  ShieldCheck,
  History
} from 'lucide-react';

export default function RecommendationCard({ lead }: { lead: WebsiteLead }) {
  const [draft, setDraft] = useState(lead.outreach?.draft || '');
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [status, setStatus] = useState<string>(
    lead.lifecycle === 'contacted' ? 'contacted' : lead.humanReview?.decision || 'pending'
  );
  const [skipReason, setSkipReason] = useState('');
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Brevo Transactional Email Modal State
  const initialEmail = lead.contacts.find((c) => c.channel === 'email')?.value || '';
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTo, setEmailTo] = useState(initialEmail);
  const [emailSubject, setEmailSubject] = useState(getEmailSubject(lead));
  const [isDryRun, setIsDryRun] = useState(true); // Default to true for safe local testing
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccessNote, setEmailSuccessNote] = useState<string | null>(null);
  const [events, setEvents] = useState<OutreachEvent[]>(lead.outreach?.events || []);
  const [showEvents, setShowEvents] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lifecycle: 'approved',
          humanReview: {
            decision: 'approved',
            reviewedAt: new Date().toISOString(),
          },
          outreach: {
            ...lead.outreach,
            draft,
            events: [
              ...(lead.outreach?.events || []),
              {
                channel: lead.outreach?.recommendedChannel || 'email',
                type: 'approved',
                at: new Date().toISOString(),
                notes: 'Approved by Raj via Daily Recommendation Queue',
              },
            ],
          },
        }),
      });
      if (res.ok) {
        setStatus('approved');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lifecycle: 'rejected',
          humanReview: {
            decision: 'skipped',
            reason: skipReason || 'Manually skipped during QA',
            reviewedAt: new Date().toISOString(),
          },
        }),
      });
      if (res.ok) {
        setStatus('skipped');
        setShowSkipModal(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendBrevoEmail = async () => {
    setSendingEmail(true);
    setEmailError(null);
    setEmailSuccessNote(null);

    try {
      const res = await fetch(`/api/leads/${lead.id}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailTo,
          subject: emailSubject,
          body: draft,
          confirmed: true,
          dryRun: isDryRun,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setEmailError(data?.error || 'Failed to send transactional email.');
        return;
      }

      setStatus('contacted');
      const note = data.dryRun
        ? `Simulation successful [DRY RUN: ${data.messageId}]`
        : `Email delivered via Brevo [${data.messageId}]`;
      setEmailSuccessNote(note);

      if (data.data?.outreach?.events) {
        setEvents(data.data.outreach.events);
      }

      setTimeout(() => {
        setShowEmailModal(false);
        setEmailSuccessNote(null);
      }, 1800);
    } catch {
      setEmailError('Network communication error with server.');
    } finally {
      setSendingEmail(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (status === 'skipped') {
    return (
      <div className="bg-slate-100/80 rounded-xl p-4 border border-slate-200 text-slate-500 text-sm flex items-center justify-between">
        <span className="line-through">{lead.name} (Skipped: {lead.humanReview?.reason || skipReason})</span>
        <button 
          onClick={() => setStatus('pending')}
          className="text-xs text-sky-600 hover:underline font-medium"
        >
          Undo
        </button>
      </div>
    );
  }

  const emailContact = lead.contacts.find((c) => c.channel === 'email')?.value;
  const whatsappContact = lead.contacts.find((c) => c.channel === 'whatsapp' || c.channel === 'phone')?.value;

  return (
    <div className={`bg-white rounded-xl border ${status === 'contacted' ? 'border-sky-300 ring-2 ring-sky-100' : status === 'approved' ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-slate-200'} p-6 shadow-sm space-y-6 transition-all`}>
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
              {lead.category}
            </span>
            <span className="text-xs text-slate-400">ID: {lead.id}</span>
            {status === 'approved' && (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle className="w-3.5 h-3.5" /> Approved
              </span>
            )}
            {status === 'contacted' && (
              <span className="flex items-center gap-1 text-xs font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                <Send className="w-3.5 h-3.5" /> Contacted
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-slate-900 mt-1">{lead.name}</h3>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-1.5">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{lead.location.full || `${lead.location.city}, ${lead.location.country}`}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="font-bold text-slate-800">{lead.businessSignals?.rating ?? 'N/A'}</span>
              <span className="text-slate-400">({lead.businessSignals?.reviewCount ?? 0} reviews)</span>
            </div>
          </div>
        </div>

        {/* Score & Confidence */}
        <div className="flex flex-col sm:items-end">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-sky-600">{lead.qualification?.score ?? 0}</span>
            <span className="text-xs text-slate-400 font-semibold">/100</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Confidence: {Math.round((lead.qualification?.confidence ?? 0.8) * 100)}%
          </span>
          <span className="mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
            {lead.qualification?.recommendation ?? 'high'}
          </span>
        </div>
      </div>

      {/* Two Column Grid: Audit/Opportunity & Contacts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Opportunity & Why Recommended */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-2">
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <span>🎯 Why Recommended</span>
          </div>
          <p className="text-slate-700 leading-relaxed font-medium">
            {lead.qualification?.reason}
          </p>
          <div className="pt-2 border-t border-slate-200/60 text-slate-500 space-y-1">
            <div><span className="font-semibold text-slate-600">Website Status:</span> {lead.website.status}</div>
            <div><span className="font-semibold text-slate-600">Opportunity:</span> {lead.website.opportunities?.[0] || 'Mobile conversion & call CTA'}</div>
          </div>
        </div>

        {/* Contacts & Live Preview Link */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="font-bold text-slate-800">Verified Contact Routes:</div>
            {lead.contacts.map((c, idx) => (
              <div key={idx} className="flex items-center gap-2 text-slate-700">
                {c.channel === 'phone' && <Phone className="w-3.5 h-3.5 text-slate-400" />}
                {c.channel === 'whatsapp' && <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />}
                {c.channel === 'email' && <Mail className="w-3.5 h-3.5 text-sky-500" />}
                <span className="font-mono">{c.value}</span>
                <span className="text-[10px] text-slate-400">({c.label || c.channel})</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
            <span className="text-slate-500">Pre-built Demo:</span>
            <a
              href={`/preview/${lead.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold shadow-sm transition-colors"
            >
              <span>Inspect Demo Site</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Suggested Outreach Draft (Editable) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-sky-600" />
            <span className="text-xs font-bold text-slate-800">
              Personal Outreach Draft ({lead.outreach?.recommendedChannel || 'Email'} from Raj &lt;raj@d4f.me&gt;)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditingDraft(!isEditingDraft)}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" />
              <span>{isEditingDraft ? 'Done' : 'Edit Draft'}</span>
            </button>
            <button
              onClick={copyToClipboard}
              className="text-xs text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>
          </div>
        </div>

        {isEditingDraft ? (
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={6}
            className="w-full text-xs font-mono p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        ) : (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed">
            {draft}
          </div>
        )}
      </div>

      {/* Human Actions Gate */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          {status === 'pending' ? (
            <button
              onClick={handleApprove}
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approve for Personal Outreach</span>
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border flex items-center gap-1 ${
                status === 'contacted'
                  ? 'text-sky-700 bg-sky-50 border-sky-200'
                  : 'text-emerald-700 bg-emerald-50 border-emerald-200'
              }`}>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                {status === 'contacted' ? 'Contacted' : 'Approved & In Pipeline'}
              </span>

              {/* Brevo Transactional Email Send Button */}
              {emailContact && (
                <button
                  onClick={() => setShowEmailModal(true)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send via Brevo</span>
                </button>
              )}

              {/* Mailto Fallback Option (Always preserved) */}
              {emailContact && (
                <a
                  href={`mailto:${emailContact}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(draft)}`}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                  title="Open draft in your local email client (fallback)"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>Mail Client (Fallback)</span>
                </a>
              )}

              {/* WhatsApp Button */}
              {whatsappContact && (
                <a
                  href={`https://wa.me/${whatsappContact.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(draft)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send via WhatsApp</span>
                </a>
              )}
            </div>
          )}

          <button
            onClick={() => setShowSkipModal(true)}
            disabled={loading}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <XCircle className="w-4 h-4 text-slate-500" />
            <span>Skip Candidate</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {events.length > 0 && (
            <button
              onClick={() => setShowEvents(!showEvents)}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
            >
              <History className="w-3.5 h-3.5" />
              <span>History ({events.length})</span>
            </button>
          )}

          <div className="text-[11px] text-slate-400 font-mono">
            Market: {lead.experiment?.market || lead.location.country} • Niche: {lead.category}
          </div>
        </div>
      </div>

      {/* Outreach Event History Panel */}
      {showEvents && events.length > 0 && (
        <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200/80 text-xs space-y-2">
          <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>Outreach Event History</span>
          </div>
          <div className="space-y-1.5">
            {events.map((evt, idx) => (
              <div key={idx} className="flex items-start justify-between gap-2 text-slate-600 text-[11px] border-b border-slate-200/50 pb-1.5 last:border-0 last:pb-0">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    evt.type === 'sent' ? 'bg-sky-500' : evt.type === 'failed' ? 'bg-red-500' : 'bg-emerald-500'
                  }`} />
                  <span className="font-semibold uppercase text-slate-700">{evt.type}</span>
                  <span className="text-slate-400">({evt.channel})</span>
                  <span className="text-slate-700">{evt.notes}</span>
                </div>
                {evt.at && (
                  <span className="text-slate-400 whitespace-nowrap font-mono text-[10px]">
                    {new Date(evt.at).toLocaleString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Brevo Review & Confirmation Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Send className="w-4 h-4 text-indigo-600" />
                  <span>Review & Confirm Transactional Email</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sending 1 personal email from <strong className="text-slate-700">Raj &lt;raj@d4f.me&gt;</strong> via Brevo API
                </p>
              </div>
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setEmailError(null);
                  setEmailSuccessNote(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Error & Success Banners */}
            {emailError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span>{emailError}</span>
              </div>
            )}
            {emailSuccessNote && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{emailSuccessNote}</span>
              </div>
            )}

            {/* Recipient */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Recipient Email
              </label>
              <input
                type="email"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                placeholder="owner@business.com"
                className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Subject */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Email Subject
              </label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
              />
            </div>

            {/* Message Body */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Email Body (Editable)
              </label>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={7}
                className="w-full text-xs font-mono p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Dry Run / Safety Simulation Toggle */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 text-xs space-y-1.5">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-amber-900">
                <input
                  type="checkbox"
                  checked={isDryRun}
                  onChange={(e) => setIsDryRun(e.target.checked)}
                  className="rounded border-amber-400 text-amber-600 focus:ring-amber-500 h-4 w-4"
                />
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Dry-run simulation mode (Recommended for dev & testing)</span>
              </label>
              <p className="text-[11px] text-amber-800 leading-normal pl-6">
                When enabled, validates inputs and records outreach events without contacting the live Brevo API or dispatching real emails.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setEmailError(null);
                }}
                disabled={sendingEmail}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendBrevoEmail}
                disabled={sendingEmail}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sendingEmail ? 'Sending...' : isDryRun ? 'Confirm & Simulate Send' : 'Confirm & Send 1 Email'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skip Modal */}
      {showSkipModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-xl space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">Skip Reason (Required for AI calibration)</h4>
            <select
              value={skipReason}
              onChange={(e) => setSkipReason(e.target.value)}
              className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none"
            >
              <option value="">Select a reason...</option>
              <option value="Phone disconnected or unverified">Phone disconnected or unverified</option>
              <option value="Weak niche conversion potential">Weak niche conversion potential</option>
              <option value="Existing website found elsewhere">Existing website found elsewhere</option>
              <option value="Low review relevance">Low review relevance</option>
              <option value="Other">Other</option>
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSkipModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSkip}
                className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white font-semibold rounded"
              >
                Confirm Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


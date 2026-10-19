'use client';

import { useState } from 'react';
import Link from 'next/link';
import { WebsiteLead, OutreachEvent } from '@/lib/types/lead';
import { 
  getEmailSubject, 
  splitBodyAndSignature, 
  formatEmailPreviewHtml,
  generateWhatsAppTemplate
} from '@/lib/ai/outreach';
import { 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  ExternalLink, 
  CheckCircle, 
  CheckCircle2,
  XCircle, 
  Clock, 
  Send, 
  Copy, 
  Edit3,
  MessageSquare,
  AlertCircle,
  ShieldCheck,
  History,
  Eye,
  FileText,
  Sparkles,
  Trash2,
  Cloud,
  Check
} from 'lucide-react';

export default function RecommendationCard({ lead }: { lead: WebsiteLead }) {
  const isBd = lead.experiment?.market === 'BD' || lead.location.country.includes('Bangladesh');
  const initialSplit = splitBodyAndSignature(lead.outreach?.draft || '', isBd);
  
  const [messageBody, setMessageBody] = useState(initialSplit.body);
  const [signature] = useState(initialSplit.signature);
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [status, setStatus] = useState<string>(
    lead.lifecycle === 'contacted' ? 'contacted' : lead.humanReview?.decision || 'pending'
  );
  const [skipReason, setSkipReason] = useState('');
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
  const [modalTab, setModalTab] = useState<'compose' | 'preview'>('compose');
  const [sentSuccessData, setSentSuccessData] = useState<{ messageId: string; dryRun: boolean } | null>(null);
  const [events, setEvents] = useState<OutreachEvent[]>(lead.outreach?.events || []);
  const [showEvents, setShowEvents] = useState(false);

  // Cloudflare Edge Deployment State
  const [edgeDeployment, setEdgeDeployment] = useState(lead.cloudflareDeployment);
  const [deployingEdge, setDeployingEdge] = useState(false);
  const [edgeNotice, setEdgeNotice] = useState<string | null>(null);

  const handleDeployEdge = async () => {
    setDeployingEdge(true);
    setEdgeNotice(null);
    try {
      const res = await fetch(`/api/leads/${lead.id}/deploy`, { method: 'POST' });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        setEdgeDeployment(data.data?.cloudflareDeployment);
        setEdgeNotice(data.deployResult?.mode === 'cloudflare_edge' ? 'Synced to Cloudflare Edge!' : 'Exported static HTML locally.');
      } else {
        setEdgeNotice(data?.error || 'Deploy failed');
      }
    } catch {
      setEdgeNotice('Network error deploying to edge');
    } finally {
      setDeployingEdge(false);
      setTimeout(() => setEdgeNotice(null), 4000);
    }
  };

  const fullDraft = `${messageBody.trim()}\n\n${signature}`;

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
            draft: fullDraft,
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

    try {
      const res = await fetch(`/api/leads/${lead.id}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailTo,
          subject: emailSubject,
          body: fullDraft,
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
      setSentSuccessData({
        messageId: data.messageId,
        dryRun: Boolean(data.dryRun),
      });

      if (data.data?.outreach?.events) {
        setEvents(data.data.outreach.events);
      }
    } catch {
      setEmailError('Network communication error with server.');
    } finally {
      setSendingEmail(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}`, { method: 'DELETE' });
      if (res.ok) {
        setIsDeleted(true);
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isDeleted) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500 italic flex items-center justify-between">
        <span>Lead &ldquo;{lead.name}&rdquo; and demo site were permanently deleted.</span>
      </div>
    );
  }


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

          <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Pre-built Demo:</span>
              {edgeDeployment?.deployed && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1">
                  <Cloud className="w-3 h-3 text-sky-600" />
                  Edge Ready
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleDeployEdge}
                disabled={deployingEdge}
                title="Sync self-contained static site to Cloudflare Edge KV and local export"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Cloud className="w-3.5 h-3.5 text-sky-600" />
                <span>{deployingEdge ? 'Syncing...' : 'Deploy to Edge'}</span>
              </button>

              <a
                href={`/preview/${lead.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold shadow-sm transition-colors"
              >
                <span>Inspect Demo</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          {edgeNotice && (
            <div className="text-[11px] font-medium text-sky-700 bg-sky-50 border border-sky-200 rounded p-1.5 text-center">
              {edgeNotice}
            </div>
          )}
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
              className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>{isEditingDraft ? 'Done Editing' : 'Edit Pitch'}</span>
            </button>
            <button
              onClick={copyToClipboard}
              className="text-xs text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              <span>{copied ? 'Copied Full Draft!' : 'Copy Text'}</span>
            </button>
          </div>
        </div>

        {isEditingDraft ? (
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Edit Message Pitch (Professional signature is attached cleanly below):
            </label>
            <textarea
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              rows={6}
              className="w-full text-xs font-sans p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none leading-relaxed"
            />
          </div>
        ) : (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans text-slate-700 whitespace-pre-wrap leading-relaxed">
            {messageBody}
          </div>
        )}

        {/* Clean Signature Preview Pill */}
        <div className="px-3 py-2 bg-slate-100/70 border border-slate-200 rounded-lg flex items-center justify-between text-[11px] text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Signature:</span>
            <span>Raj Syful — Senior Web Developer (Top Rated Plus | www.d4f.me | WhatsApp)</span>
          </div>
          <span className="text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
            Deduplicated & Clean
          </span>
        </div>
      </div>

      {/* Human Actions Gate */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          {status === 'pending' ? (
            <button
              onClick={handleApprove}
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
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
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send via Brevo</span>
                </button>
              )}

              {/* Mailto Fallback Option (Always preserved) */}
              {emailContact && (
                <a
                  href={`mailto:${emailContact}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(fullDraft)}`}
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
                  href={`https://wa.me/${whatsappContact.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(generateWhatsAppTemplate(lead))}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={async () => {
                    await fetch(`/api/leads/${lead.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        lifecycle: 'contacted',
                        sales: {
                          ...lead.sales,
                          stage: 'contacted',
                          nextAction: 'Monitor WhatsApp reply',
                        },
                        outreach: {
                          ...lead.outreach,
                          events: [
                            ...(lead.outreach?.events || []),
                            {
                              channel: 'whatsapp',
                              type: 'sent',
                              at: new Date().toISOString(),
                              notes: `Sent 1-click personal WhatsApp message to ${whatsappContact}`,
                            },
                          ],
                        },
                      }),
                    }).catch(() => {});
                    setStatus('contacted');
                  }}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                  title="Open WhatsApp with short mobile-ready message"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send via WhatsApp</span>
                </a>
              )}
            </div>
          )}

          <button
            onClick={() => setShowSkipModal(true)}
            disabled={loading || isDeleting}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <XCircle className="w-4 h-4 text-slate-500" />
            <span>Skip Candidate</span>
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={loading || isDeleting}
            className="px-2.5 py-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
            title="Permanently delete this demo site & lead"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Demo</span>
          </button>
        </div>


        <div className="flex items-center gap-3">
          {events.length > 0 && (
            <button
              onClick={() => setShowEvents(!showEvents)}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium cursor-pointer"
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
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in duration-150 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Send className="w-4 h-4 text-indigo-600" />
                  <span>Review & Send Email via Brevo</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sender: <strong className="text-slate-800">Raj Syful &lt;raj@d4f.me&gt;</strong> (Client replies arrive at <strong className="text-slate-800">raj@d4f.me</strong>)
                </p>
              </div>
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setEmailError(null);
                  setSentSuccessData(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Error Banner */}
            {emailError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span>{emailError}</span>
              </div>
            )}

            {/* Success State Card */}
            {sentSuccessData ? (
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h5 className="font-bold text-emerald-950 text-sm">
                      {sentSuccessData.dryRun ? 'Simulation Succeeded [DRY RUN]' : 'Email Dispatched via Brevo!'}
                    </h5>
                    <p className="text-xs text-emerald-800">
                      {sentSuccessData.dryRun
                        ? `Dry-run validation successful. Simulated message ID: ${sentSuccessData.messageId}`
                        : `Successfully delivered to ${emailTo}. Brevo message ID: ${sentSuccessData.messageId}`}
                    </p>
                    <p className="text-[11px] text-emerald-700 pt-1 font-medium">
                      💡 When the prospect replies, the email will land directly in your <strong>raj@d4f.me</strong> inbox.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-emerald-200">
                  <Link
                    href="/recommendations?tab=sent"
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    View in Sent & Contacted History →
                  </Link>
                  <button
                    onClick={() => {
                      setShowEmailModal(false);
                      setSentSuccessData(null);
                    }}
                    className="px-3.5 py-1.5 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100/60 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Mode Tabs */}
                <div className="flex items-center gap-1 border-b border-slate-200 pb-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setModalTab('compose')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                      modalTab === 'compose'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Compose Message</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalTab('preview')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                      modalTab === 'preview'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Live Email Preview</span>
                  </button>
                </div>

                {modalTab === 'compose' ? (
                  <div className="space-y-3.5">
                    {/* Recipient */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                          Recipient Email
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setEmailTo('rajsyfyl@gmail.com');
                            setEmailSubject(`[TEST] Website preview for ${lead.name}`);
                            setIsDryRun(false); // Enable live send so it delivers to Gmail
                          }}
                          className="text-[11px] font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-2 py-0.5 rounded transition-colors flex items-center gap-1 cursor-pointer"
                          title="Fill recipient with your Gmail to test live delivery"
                        >
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          <span>⚡ Test on Myself (rajsyfyl@gmail.com)</span>
                        </button>
                      </div>
                      <input
                        type="email"
                        value={emailTo}
                        onChange={(e) => setEmailTo(e.target.value)}
                        placeholder="owner@business.com"
                        className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                      {emailTo === 'rajsyfyl@gmail.com' && (
                        <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 font-medium">
                          🔔 Test mode active: A live email will be delivered to your Gmail (rajsyfyl@gmail.com).
                        </p>
                      )}
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
                        Email Pitch (Editable)
                      </label>
                      <textarea
                        value={messageBody}
                        onChange={(e) => setMessageBody(e.target.value)}
                        rows={6}
                        className="w-full text-xs font-sans p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
                      />
                    </div>

                    {/* Clean Signature Preview Box */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Attached Professional Signature (Deduplicated):
                      </span>
                      <div className="text-[11px] font-mono text-slate-600 whitespace-pre-wrap bg-white p-2 rounded border border-slate-200">
                        {signature}
                      </div>
                    </div>

                    {/* Dry Run Toggle */}
                    <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 text-xs space-y-1.5">
                      <label className="flex items-center gap-2 cursor-pointer font-semibold text-amber-900">
                        <input
                          type="checkbox"
                          checked={isDryRun}
                          onChange={(e) => setIsDryRun(e.target.checked)}
                          className="rounded border-amber-400 text-amber-600 focus:ring-amber-500 h-4 w-4"
                        />
                        <ShieldCheck className="w-4 h-4 text-amber-700" />
                        <span>Dry-run simulation mode (Simulates send without dispatching real email)</span>
                      </label>
                      <p className="text-[11px] text-amber-800 leading-normal pl-6">
                        {isDryRun
                          ? '✅ Dry-run is ON: Safe simulation. Uncheck if you want to send a real email via Brevo.'
                          : '⚠️ Live send is ON: A real transactional email will be dispatched via Brevo.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Live Preview Tab */
                  <div className="space-y-3">
                    <div className="bg-slate-100 p-2.5 rounded-lg text-xs space-y-1 font-mono text-slate-700">
                      <div><strong>From:</strong> Raj Syful &lt;raj@d4f.me&gt;</div>
                      <div><strong>To:</strong> {emailTo || '(Recipient Email)'}</div>
                      <div><strong>Subject:</strong> {emailSubject}</div>
                    </div>

                    <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-xs max-h-72 overflow-y-auto">
                      <div
                        className="text-xs leading-relaxed text-slate-800 whitespace-pre-wrap font-sans"
                        dangerouslySetInnerHTML={{
                          __html: formatEmailPreviewHtml(fullDraft),
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setShowEmailModal(false);
                      setEmailError(null);
                    }}
                    disabled={sendingEmail}
                    className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendBrevoEmail}
                    disabled={sendingEmail}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {sendingEmail
                        ? 'Sending...'
                        : isDryRun
                        ? 'Confirm & Simulate Send'
                        : `Confirm & Send to ${emailTo === 'rajsyfyl@gmail.com' ? 'Myself' : 'Recipient'}`}
                    </span>
                  </button>
                </div>
              </>
            )}
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
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSkip}
                className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white font-semibold rounded cursor-pointer"
              >
                Confirm Skip
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-xl space-y-3 border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-600" />
              <span>Delete Demo Site &amp; Lead?</span>
            </h4>
            <p className="text-xs text-slate-600 leading-normal">
              Are you sure you want to delete <strong>{lead.name}</strong> and remove its demo site (<code>/preview/{lead.slug}</code>)? This cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-lg cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


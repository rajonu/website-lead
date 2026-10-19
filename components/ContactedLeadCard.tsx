'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
  ChevronUp,
  Trash2,
  RotateCcw,
  Cloud,
  AlertTriangle,
  PhoneCall
} from 'lucide-react';

export default function ContactedLeadCard({ lead }: { lead: WebsiteLead }) {
  const router = useRouter();
  const [stage, setStage] = useState(lead.lifecycle);
  const [updating, setUpdating] = useState(false);
  const [undoing, setUndoing] = useState(false);
  const [isMovedToQueue, setIsMovedToQueue] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

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

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [sendingLive, setSendingLive] = useState(false);
  const [liveSendNotice, setLiveSendNotice] = useState<string | null>(null);
  const [isLiveSentSuccess, setIsLiveSentSuccess] = useState(false);

  const events = lead.outreach?.events || [];
  const latestSentEvent = [...events].reverse().find((e) => e.type === 'sent');
  const recipientEmail = lead.contacts.find((c) => c.channel === 'email')?.value || 'N/A';
  const isBounced = lead.outreach?.deliveryStatus === 'bounced' || events.some((e) => e.type === 'bounced');
  const bounceReason = lead.outreach?.bounceReason || events.find((e) => e.type === 'bounced')?.notes || 'Recipient mail server rejected message (No MX record found)';
  const whatsappContact = lead.contacts.find((c) => c.channel === 'whatsapp' || c.channel === 'phone')?.value;
  const isDryRun = (latestSentEvent?.notes?.includes('[DRY RUN]') || false) && !isLiveSentSuccess && !isBounced;

  const [deletingSiteOnly, setDeletingSiteOnly] = useState(false);
  const [siteDeletedNotice, setSiteDeletedNotice] = useState<string | null>(null);

  const handleDeleteSiteOnly = async () => {
    setDeletingSiteOnly(true);
    setSiteDeletedNotice(null);
    try {
      const res = await fetch(`/api/leads/${lead.id}/deploy`, { method: 'DELETE' });
      if (res.ok) {
        setSiteDeletedNotice('Live site has been purged from Cloudflare Edge KV.');
        setEdgeDeployment(undefined);
        router.refresh();
      } else {
        setSiteDeletedNotice('Failed to purge site from Cloudflare.');
      }
    } catch {
      setSiteDeletedNotice('Network error purging site.');
    } finally {
      setDeletingSiteOnly(false);
      setTimeout(() => setSiteDeletedNotice(null), 5000);
    }
  };

  const handleSwitchToWhatsApp = async () => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lifecycle: 'review',
          humanReview: { decision: 'pending' },
          outreach: {
            ...lead.outreach,
            recommendedChannel: 'whatsapp',
            events: [
              ...events,
              {
                channel: 'system',
                type: 'drafted',
                at: new Date().toISOString(),
                notes: 'Switched from bounced email to WhatsApp outreach queue',
              },
            ],
          },
        }),
      });
      if (res.ok) {
        setIsMovedToQueue(true);
        router.refresh();
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleSendLiveNow = async () => {
    setSendingLive(true);
    setLiveSendNotice(null);
    try {
      const email = lead.contacts.find((c) => c.channel === 'email')?.value;
      if (!email) {
        setLiveSendNotice('No email contact found for this lead');
        return;
      }
      const res = await fetch(`/api/leads/${lead.id}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: `Website preview for ${lead.name}`,
          body: lead.outreach?.draft || '',
          confirmed: true,
          dryRun: false,
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        setIsLiveSentSuccess(true);
        setLiveSendNotice(`Delivered live via Brevo! Message ID: ${data.messageId}`);
        router.refresh();
      } else {
        setLiveSendNotice(`Delivery failed: ${data?.error || 'Unknown error'}`);
      }
    } catch {
      setLiveSendNotice('Network error dispatching live email');
    } finally {
      setSendingLive(false);
    }
  };

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

  const handleUndoToQueue = async () => {
    setUndoing(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lifecycle: 'review',
          humanReview: {
            decision: 'pending',
          },
          sales: {
            ...lead.sales,
            stage: 'none',
          },
          outreach: {
            ...lead.outreach,
            events: [],
          },
        }),
      });
      if (res.ok) {
        setIsMovedToQueue(true);
        router.refresh();
      }
    } finally {
      setUndoing(false);
    }
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

  if (isMovedToQueue) {
    return (
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-xs text-sky-850 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sky-900">
          <RotateCcw className="w-4 h-4 text-sky-600" />
          <span>&ldquo;{lead.name}&rdquo; has been moved back to the Pending Review Queue!</span>
        </div>
        <a href="/recommendations?tab=queue" className="text-xs font-bold text-sky-700 hover:underline">
          Go to Pending Queue →
        </a>
      </div>
    );
  }

  if (isDeleted) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500 italic flex items-center justify-between">
        <span>Lead &ldquo;{lead.name}&rdquo; and demo site were permanently deleted.</span>
      </div>
    );
  }


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
                : isBounced
                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                : isDryRun
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}>
              {isBounced ? <AlertTriangle className="w-3 h-3 text-rose-600" /> : <CheckCircle2 className="w-3 h-3" />}
              <span>{stage === 'replied' ? 'Client Replied' : isBounced ? 'Email Bounced' : isDryRun ? 'Simulated [DRY RUN]' : 'Delivered via Brevo'}</span>
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

        <div className="flex flex-wrap items-center gap-2">
          {edgeDeployment?.deployed && (
            <span className="px-2 py-1 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1">
              <Cloud className="w-3 h-3 text-sky-600" />
              Edge Ready
            </span>
          )}

          <button
            type="button"
            onClick={handleDeployEdge}
            disabled={deployingEdge}
            title="Deploy or sync site to Cloudflare Edge"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Cloud className="w-3.5 h-3.5 text-sky-600" />
            <span>{deployingEdge ? 'Syncing...' : 'Deploy to Edge'}</span>
          </button>

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

      {edgeNotice && (
        <div className="text-[11px] font-medium text-sky-700 bg-sky-50 border border-sky-200 rounded p-1.5 text-center">
          {edgeNotice}
        </div>
      )}

      {siteDeletedNotice && (
        <div className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded p-2 flex items-center justify-between">
          <span>{siteDeletedNotice}</span>
          <button onClick={() => setSiteDeletedNotice(null)} className="text-amber-800 text-xs font-bold">✕</button>
        </div>
      )}

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

      {/* Bounced Delivery Warning & Recovery Box */}
      {isBounced && (
        <div className="bg-rose-50/90 border border-rose-200 rounded-lg p-3.5 space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-rose-800 font-bold">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Email Delivery Bounced by Mail Server</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider bg-rose-100 text-rose-700 px-2 py-0.5 rounded font-mono font-bold">
              Soft Bounce / Invalid Domain
            </span>
          </div>

          <p className="text-[11px] text-rose-700 font-mono bg-white p-2.5 rounded border border-rose-200 leading-normal">
            {bounceReason}
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-rose-100 text-[11px]">
            <span className="text-slate-600">
              {whatsappContact ? (
                <span>
                  💡 <strong>Recommendation:</strong> Use WhatsApp ({whatsappContact}) to message the owner directly.
                </span>
              ) : (
                <span>
                  💡 <strong>Recommendation:</strong> Delete dead prospect &amp; take down live site to clean storage.
                </span>
              )}
            </span>

            <div className="flex items-center gap-2 shrink-0">
              {whatsappContact && (
                <button
                  type="button"
                  onClick={handleSwitchToWhatsApp}
                  disabled={updating}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                  title="Move to WhatsApp outreach queue"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>Switch to WhatsApp</span>
                </button>
              )}

              {edgeDeployment?.deployed && (
                <button
                  type="button"
                  onClick={handleDeleteSiteOnly}
                  disabled={deletingSiteOnly}
                  className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded transition-colors flex items-center gap-1 cursor-pointer"
                  title="Purge live site from Cloudflare Workers KV"
                >
                  <Cloud className="w-3 h-3 text-slate-600" />
                  <span>{deletingSiteOnly ? 'Purging...' : 'Take Down Site Only'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                title="Permanently delete lead and Cloudflare demo site"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete Lead &amp; Site</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {liveSendNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3.5 py-2 rounded-lg font-medium flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{liveSendNotice}</span>
          </div>
          <button
            onClick={() => setLiveSendNotice(null)}
            className="text-emerald-600 hover:text-emerald-800 text-[11px] font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Actions & History Accordion */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          {isDryRun && (
            <button
              onClick={handleSendLiveNow}
              disabled={sendingLive}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Send real live email via Brevo immediately"
            >
              <Send className={`w-3.5 h-3.5 ${sendingLive ? 'animate-spin' : ''}`} />
              <span>{sendingLive ? 'Sending Live...' : 'Send Live Email Now'}</span>
            </button>
          )}

          {stage !== 'replied' ? (
            <button
              onClick={handleMarkReplied}
              disabled={updating}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
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

          <button
            onClick={handleUndoToQueue}
            disabled={undoing}
            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Undo contacted status and return this lead to the Pending Review Queue"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${undoing ? 'animate-spin' : ''}`} />
            <span>{undoing ? 'Moving...' : 'Undo to Queue'}</span>
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}

            disabled={isDeleting}
            className="px-2.5 py-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors flex items-center gap-1 cursor-pointer"
            title="Permanently delete this demo site & lead"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Demo</span>
          </button>
        </div>

        {events.length > 0 && (
          <button
            onClick={() => setShowFullHistory(!showFullHistory)}
            className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium text-[11px] cursor-pointer"
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

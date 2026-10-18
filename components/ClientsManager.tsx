'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WebsiteLead } from '@/lib/types/lead';
import { 
  Users, 
  Globe, 
  ShieldCheck, 
  HeartPulse, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  Plus, 
  AlertCircle, 
  XCircle, 
  CheckSquare, 
  Square,
  Sparkles
} from 'lucide-react';

export default function ClientsManager({ initialClients }: { initialClients: WebsiteLead[] }) {
  const router = useRouter();
  const [clients, setClients] = useState<WebsiteLead[]>(initialClients);

  // Add / Edit Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<WebsiteLead | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('United States');
  const [customDomain, setCustomDomain] = useState('');
  const [plan, setPlan] = useState('Growth Managed Plan');
  const [price, setPrice] = useState('99');
  const [currency, setCurrency] = useState('USD');
  const [accountHealth, setAccountHealth] = useState<'healthy' | 'attention' | 'at_risk'>('healthy');
  const [tasksText, setTasksText] = useState('');

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<WebsiteLead | null>(null);

  const openAddModal = () => {
    setEditingClient(null);
    setName('');
    setCategory('HVAC Contractor');
    setCity('Dallas');
    setCountry('United States');
    setCustomDomain('');
    setPlan('Growth Managed Plan');
    setPrice('99');
    setCurrency('USD');
    setAccountHealth('healthy');
    setTasksText('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (client: WebsiteLead) => {
    setEditingClient(client);
    setName(client.name);
    setCategory(client.category || 'General Service');
    setCity(client.location.city || '');
    setCountry(client.location.country || 'United States');
    setCustomDomain(client.customer?.customDomain || '');
    setPlan(client.customer?.plan || client.sales?.quotedPlan || 'Growth Managed Plan');
    setPrice(String(client.sales?.quotedPrice || 99));
    setCurrency(client.sales?.currency || 'USD');
    setAccountHealth(
      client.customer?.accountHealth === 'attention' || client.customer?.accountHealth === 'at_risk'
        ? client.customer.accountHealth
        : 'healthy'
    );
    setTasksText((client.maintenance?.openTasks || []).join('\n'));
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Client / Business name is required.');
      return;
    }

    setSaving(true);
    setFormError(null);

    const openTasks = tasksText
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    const cleanPrice = parseFloat(price) || 0;

    try {
      if (editingClient) {
        // Update existing client
        const updates: Partial<WebsiteLead> = {
          name: name.trim(),
          category: category.trim(),
          location: {
            ...editingClient.location,
            city: city.trim(),
            country: country.trim(),
            full: `${city.trim()}, ${country.trim()}`,
          },
          customer: {
            ...editingClient.customer,
            isCustomer: true,
            plan: plan.trim(),
            customDomain: customDomain.trim(),
            accountHealth,
            billingStatus: 'active',
          },
          sales: {
            ...editingClient.sales,
            quotedPlan: plan.trim(),
            quotedPrice: cleanPrice,
            currency: currency.trim(),
          },
          maintenance: {
            ...editingClient.maintenance,
            openTasks,
          },
        };

        const res = await fetch(`/api/leads/${editingClient.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          setFormError(errData?.error || 'Failed to update client.');
          return;
        }

        const data = await res.json();
        setClients((prev) => prev.map((c) => (c.id === editingClient.id ? data.data : c)));
      } else {
        // Create new client
        const slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        const newClient: Partial<WebsiteLead> = {
          id: `client_${Date.now()}`,
          slug: `${slug}-${Math.floor(Math.random() * 1000)}`,
          name: name.trim(),
          category: category.trim(),
          location: {
            city: city.trim(),
            country: country.trim(),
            full: `${city.trim()}, ${country.trim()}`,
          },
          sources: [
            {
              provider: 'manual-client-onboarding',
              retrievedAt: new Date().toISOString(),
              notes: 'Added via Clients & Active Maintenance Manager',
            },
          ],
          businessSignals: {
            rating: 5.0,
            reviewCount: 50,
          },
          website: {
            status: customDomain.trim() ? 'strong' : 'adequate',
            url: customDomain.trim() ? `https://${customDomain.trim()}` : undefined,
          },
          contacts: [],
          qualification: {
            score: 100,
            recommendation: 'priority',
          },
          preview: {
            slug,
            url: `/preview/${slug}`,
            status: 'approved',
          },
          lifecycle: 'client',
          customer: {
            isCustomer: true,
            customerSince: new Date().toISOString(),
            plan: plan.trim(),
            customDomain: customDomain.trim(),
            accountHealth,
            billingStatus: 'active',
            deploymentStatus: 'live',
          },
          sales: {
            stage: 'won',
            quotedPlan: plan.trim(),
            quotedPrice: cleanPrice,
            currency: currency.trim(),
          },
          maintenance: {
            openTasks,
            nextReviewAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const res = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newClient),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          setFormError(errData?.error || 'Failed to save new client.');
          return;
        }

        const data = await res.json();
        setClients((prev) => [data.data, ...prev]);
      }

      setIsModalOpen(false);
      router.refresh();
    } catch {
      setFormError('Network communication error with server.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!showDeleteModal) return;
    setDeletingId(showDeleteModal.id);

    try {
      const res = await fetch(`/api/leads/${showDeleteModal.id}`, { method: 'DELETE' });
      if (res.ok) {
        setClients((prev) => prev.filter((c) => c.id !== showDeleteModal.id));
        setShowDeleteModal(null);
        router.refresh();
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            <span>Clients &amp; Active Maintenance</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Paying recurring business accounts, custom domains, uptime health, and ongoing support requests.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={openAddModal}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Client</span>
          </button>

          <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200 text-xs font-semibold text-emerald-800">
            <HeartPulse className="w-4 h-4 text-emerald-600" />
            <span>Active: {clients.length}</span>
          </div>
        </div>
      </div>

      {/* Retention Value Proposition Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-5 shadow-sm space-y-2">
        <div className="flex items-center gap-2 font-bold text-sm text-sky-400">
          <ShieldCheck className="w-4 h-4" />
          <span>The Retention Engine: Monthly Peace of Mind</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          Recurring subscription revenue is retained by providing ongoing peace of mind: automated SSL certificate renewals, uptime monitoring, monthly Google review synchronization, and direct content edits.
        </p>
      </div>

      {/* Clients List */}
      <div className="space-y-4">
        {clients.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700 text-base">No Client Accounts Yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Once you close a prospect from your recommendations or pipeline, click &ldquo;Add New Client&rdquo; to track their domain, monthly fee, and maintenance tasks here.
            </p>
            <button
              onClick={openAddModal}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Client</span>
            </button>
          </div>
        ) : (
          clients.map((client) => {
            const domain = client.customer?.customDomain || (client.website?.url ? client.website.url.replace(/^https?:\/\//, '') : `${client.slug}.com`);
            const health = client.customer?.accountHealth || 'healthy';
            const priceDisplay = client.sales?.quotedPrice 
              ? `${client.sales.quotedPrice} ${client.sales.currency || 'USD'}/mo`
              : 'Active Retainer';

            return (
              <div
                key={client.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-colors space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {client.category}
                      </span>
                      <span className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${
                        health === 'healthy'
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                          : health === 'attention'
                          ? 'text-amber-700 bg-amber-50 border-amber-200'
                          : 'text-red-700 bg-red-50 border-red-200'
                      }`}>
                        <CheckCircle2 className="w-3 h-3" />
                        <span className="capitalize">{health} Account</span>
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mt-1">{client.name}</h3>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {client.location.full || `${client.location.city}, ${client.location.country}`}
                    </div>
                  </div>

                  <div className="flex sm:flex-col sm:items-end justify-between text-xs gap-1">
                    <div className="font-bold text-slate-900 text-sm">
                      {priceDisplay}
                    </div>
                    <div className="text-slate-500 font-mono text-[11px]">
                      Plan: {client.customer?.plan || client.sales?.quotedPlan || 'Managed Web'}
                    </div>
                  </div>
                </div>

                {/* Technical Health & Domain Status */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Custom Domain:</span>
                    <a
                      href={`https://${domain}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-mono font-semibold text-sky-700 hover:underline mt-0.5"
                    >
                      <Globe className="w-3.5 h-3.5 text-sky-500" />
                      <span>{domain}</span>
                    </a>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">SSL / Uptime Status:</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Active &amp; Auto-Renewing
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
                  <div className="text-xs space-y-1.5 bg-amber-50/50 p-3 rounded-lg border border-amber-200/60">
                    <span className="font-bold text-amber-900 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Open Support &amp; Content Requests ({client.maintenance.openTasks.length}):</span>
                    </span>
                    <ul className="space-y-1 pl-1">
                      {client.maintenance.openTasks.map((t, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-slate-700 text-[11px]">
                          <Square className="w-3 h-3 text-amber-600 flex-shrink-0" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(client)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                      <span>Edit Account &amp; Tasks</span>
                    </button>

                    <button
                      onClick={() => setShowDeleteModal(client)}
                      className="px-2.5 py-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono">
                    ID: {client.id}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-base">
                  {editingClient ? `Edit Client: ${editingClient.name}` : 'Add New Client Account'}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure custom domain, monthly retainer plan, and maintenance support tasks.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveClient} className="space-y-3.5 text-xs">
              {/* Business Name */}
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-slate-600 text-[11px]">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Apex Comfort Solutions"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Category & City */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-slate-600 text-[11px]">
                    Niche / Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="HVAC Contractor"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-slate-600 text-[11px]">
                    City &amp; Country
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Dallas, TX"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Custom Domain */}
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-slate-600 text-[11px]">
                  Custom Domain
                </label>
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="apexcomfortdallas.com"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                />
              </div>

              {/* Retainer Plan, Price & Currency */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1 space-y-1">
                  <label className="font-bold uppercase tracking-wider text-slate-600 text-[11px]">
                    Monthly Retainer
                  </label>
                  <input
                    type="text"
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    placeholder="Growth Plan"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-slate-600 text-[11px]">
                    Fee
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="99"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-slate-600 text-[11px]">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="BDT">BDT (৳)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>

              {/* Account Health */}
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-slate-600 text-[11px]">
                  Account Health
                </label>
                <select
                  value={accountHealth}
                  onChange={(e) => setAccountHealth(e.target.value as any)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value="healthy">🟢 Healthy (Billing active, no issues)</option>
                  <option value="attention">🟡 Needs Attention (Pending task / review)</option>
                  <option value="at_risk">🔴 At Risk (Overdue payment or cancellation risk)</option>
                </select>
              </div>

              {/* Open Tasks / Edits */}
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-slate-600 text-[11px]">
                  Open Support Tasks (1 per line):
                </label>
                <textarea
                  value={tasksText}
                  onChange={(e) => setTasksText(e.target.value)}
                  rows={3}
                  placeholder="Update phone number&#10;Add summer AC repair promo banner"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono text-xs leading-normal"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  {saving ? 'Saving...' : editingClient ? 'Save Changes' : 'Create Client Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-xl space-y-3 border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-600" />
              <span>Delete Client Account?</span>
            </h4>
            <p className="text-xs text-slate-600 leading-normal">
              Are you sure you want to delete <strong>{showDeleteModal.name}</strong> from active clients? This will remove all custom domain and retainer tracking for this business.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteClient}
                disabled={Boolean(deletingId)}
                className="px-3.5 py-1.5 text-xs bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-lg cursor-pointer"
              >
                {deletingId ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

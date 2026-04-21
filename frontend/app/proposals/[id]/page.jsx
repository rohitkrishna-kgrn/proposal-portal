'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/Layout';
import api from '@/lib/api';
import { ChevronLeft, Download, Mail, Building2, Layers, Pencil, Check, X, Plus, Trash2 } from 'lucide-react';

const SERVICE_NAMES = ['Gap Analysis', 'Implementation', 'Annual Subscription'];
const CURRENCIES = ['USD', 'AED', 'EUR'];
const STATUSES = ['draft', 'active', 'sent', 'accepted', 'rejected'];

function StatusBadge({ status }) {
  const styles = {
    draft: 'bg-gray-100 text-gray-600',
    active: 'bg-blue-100 text-blue-700',
    sent: 'bg-orange-100 text-orange-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold capitalize ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

function InfoRow({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-2 py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500 w-44 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

function EditRow({ label, children }) {
  return (
    <div className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500 w-44 shrink-0">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

const inp = "w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent";
const sel = "w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 bg-white";

function formatCurrency(v, currency = 'USD') {
  if (!v && v !== 0) return 'TBD';
  const n = Number(v).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  if (currency === 'EUR') return `€${n}`;
  return `${currency} ${n}`;
}

function proposalToEditForm(p) {
  const svcMap = {};
  SERVICE_NAMES.forEach(name => {
    const found = p.selectedServices?.find(s => s.name === name);
    svcMap[name] = { checked: !!found, price: found?.price ?? '' };
  });
  return {
    clientName: p.clientName || '',
    entityGroupName: p.entityGroupName || '',
    proposalDate: p.proposalDate ? new Date(p.proposalDate).toISOString().split('T')[0] : '',
    currency: p.currency || 'USD',
    status: p.status || 'draft',
    industry: p.industry || '',
    revenueModel: p.revenueModel || '',
    customerBase: p.customerBase || '',
    erpSystem: p.erpSystem || '',
    transaction: p.transaction || '',
    services: svcMap,
    gapAnalysisPrice: p.gapAnalysisPrice ?? '',
    implementationPrice: p.implementationPrice ?? '',
    annualSubscriptionPrice: p.annualSubscriptionPrice ?? '',
    overagePrice: p.overagePrice ?? '',
    includeManagedServices: p.includeManagedServices !== false,
    monitorPrice: p.monitorPrice ?? 4000,
    assurePrice: p.assurePrice ?? 6000,
    operatePrice: p.operatePrice ?? 9500,
    erpNames: p.erpNames?.join(', ') || '',
  };
}

function editFormToPayload(f) {
  const selectedServices = SERVICE_NAMES
    .filter(name => f.services[name]?.checked)
    .map(name => ({ name, price: Number(f.services[name].price) || 0 }));

  return {
    clientName: f.clientName,
    entityGroupName: f.entityGroupName,
    proposalDate: f.proposalDate || undefined,
    currency: f.currency,
    status: f.status,
    industry: f.industry,
    revenueModel: f.revenueModel,
    customerBase: f.customerBase,
    erpSystem: f.erpSystem,
    transaction: f.transaction,
    selectedServices,
    gapAnalysisPrice: f.gapAnalysisPrice !== '' ? Number(f.gapAnalysisPrice) : undefined,
    implementationPrice: f.implementationPrice !== '' ? Number(f.implementationPrice) : undefined,
    annualSubscriptionPrice: f.annualSubscriptionPrice !== '' ? Number(f.annualSubscriptionPrice) : undefined,
    overagePrice: f.overagePrice !== '' ? Number(f.overagePrice) : undefined,
    includeManagedServices: f.includeManagedServices,
    monitorPrice: Number(f.monitorPrice) || 4000,
    assurePrice: Number(f.assurePrice) || 6000,
    operatePrice: Number(f.operatePrice) || 9500,
    erpNames: f.erpNames.split(',').map(s => s.trim()).filter(Boolean),
  };
}

export default function ProposalDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const [emailModal, setEmailModal] = useState(false);
  const [emailForm, setEmailForm] = useState({ to: '', subject: '', body: '' });
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get(`/proposals/${id}`);
        setProposal(data);
        setEmailForm({
          to: data.emailSentTo || '',
          subject: `Proposal ${data.referenceNo} - ${data.clientName}`,
          body: `<p>Dear ${data.clientName},</p><p>Please find attached the eInvoicing Compliance & Implementation Proposal (Ref: ${data.referenceNo}).</p><p>We look forward to your feedback.</p><p>Best regards,<br/>KGRN Chartered Accountants LLC</p>`,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  function startEdit() {
    setEditForm(proposalToEditForm(proposal));
    setSaveError('');
    setEditMode(true);
  }

  function cancelEdit() {
    setEditMode(false);
    setEditForm(null);
    setSaveError('');
  }

  async function handleSave() {
    setSaving(true);
    setSaveError('');
    try {
      const payload = editFormToPayload(editForm);
      const { data } = await api.put(`/proposals/${id}`, payload);
      setProposal(data);
      setEditMode(false);
      setEditForm(null);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  }

  async function handleDownload() {
    setDownloading(true);
    setDownloadError('');
    try {
      const response = await api.get(`/proposals/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${proposal.referenceNo}-${proposal.clientName}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      let message = 'PDF generation failed. Check server logs.';
      try {
        if (err.response?.data instanceof Blob) {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          message = json.message || message;
        } else {
          message = err.response?.data?.message || err.message || message;
        }
      } catch { /* keep default */ }
      setDownloadError(message);
    } finally {
      setDownloading(false);
    }
  }

  async function handleSendEmail(e) {
    e.preventDefault();
    setSendingEmail(true);
    setEmailError('');
    try {
      await api.post(`/proposals/${id}/send`, emailForm);
      setProposal(prev => ({ ...prev, status: 'sent', emailSentTo: emailForm.to }));
      setEmailModal(false);
      alert('Email sent successfully!');
    } catch (err) {
      setEmailError(err.response?.data?.message || 'Failed to send email. Check SMTP configuration.');
    } finally {
      setSendingEmail(false);
    }
  }

  function setField(key, value) {
    setEditForm(prev => ({ ...prev, [key]: value }));
  }

  function setSvcField(name, key, value) {
    setEditForm(prev => ({
      ...prev,
      services: { ...prev.services, [name]: { ...prev.services[name], [key]: value } },
    }));
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#F15C22' }}></div>
        </div>
      </AppLayout>
    );
  }

  if (!proposal) {
    return (
      <AppLayout>
        <div className="p-6 text-center text-gray-400">Proposal not found</div>
      </AppLayout>
    );
  }

  const cur = proposal.currency;

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-gray-900">
                  {editMode ? editForm.clientName || 'Editing…' : proposal.clientName}
                </h1>
                <StatusBadge status={editMode ? editForm.status : proposal.status} />
              </div>
              <p className="text-sm text-gray-500 font-mono">{proposal.referenceNo}</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            {editMode ? (
              <>
                <button
                  onClick={cancelEdit}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <X size={14} />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-60 hover:opacity-90 transition-opacity"
                  style={{ background: '#F15C22' }}
                >
                  <Check size={14} />
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={startEdit}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Pencil size={14} />
                  Edit
                </button>
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition-colors"
                >
                  <Download size={15} />
                  {downloading ? 'Generating…' : 'Download PDF'}
                </button>
                <button
                  onClick={() => setEmailModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                  style={{ background: '#F15C22' }}
                >
                  <Mail size={15} />
                  Send Email
                </button>
              </>
            )}
          </div>
        </div>

        {downloadError && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
            <span className="font-semibold shrink-0">PDF Error:</span>
            <span className="font-mono">{downloadError}</span>
          </div>
        )}
        {saveError && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {saveError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* ── Client Information ── */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Building2 size={16} style={{ color: '#F15C22' }} />
              <h2 className="text-sm font-bold text-gray-900">Client Information</h2>
            </div>
            {editMode ? (
              <>
                <EditRow label="Client Name">
                  <input className={inp} value={editForm.clientName} onChange={e => setField('clientName', e.target.value)} placeholder="Client Name" />
                </EditRow>
                <EditRow label="Entity / Group">
                  <input className={inp} value={editForm.entityGroupName} onChange={e => setField('entityGroupName', e.target.value)} placeholder="Entity or group name" />
                </EditRow>
                <EditRow label="Proposal Date">
                  <input type="date" className={inp} value={editForm.proposalDate} onChange={e => setField('proposalDate', e.target.value)} />
                </EditRow>
                <EditRow label="Currency">
                  <select className={sel} value={editForm.currency} onChange={e => setField('currency', e.target.value)}>
                    {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </EditRow>
                <EditRow label="Status">
                  <select className={sel} value={editForm.status} onChange={e => setField('status', e.target.value)}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </EditRow>
              </>
            ) : (
              <>
                <InfoRow label="Client Name" value={proposal.clientName} />
                <InfoRow label="Entity / Group" value={proposal.entityGroupName} />
                <InfoRow label="Proposal Date" value={proposal.proposalDate ? new Date(proposal.proposalDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null} />
                <InfoRow label="Currency" value={proposal.currency || 'USD'} />
                <InfoRow label="Created By" value={proposal.createdBy?.name} />
                <InfoRow label="Created At" value={new Date(proposal.createdAt).toLocaleDateString()} />
                {proposal.emailSentTo && <InfoRow label="Email Sent To" value={proposal.emailSentTo} />}
                {proposal.emailSentAt && <InfoRow label="Email Sent At" value={new Date(proposal.emailSentAt).toLocaleDateString()} />}
              </>
            )}
          </div>

          {/* ── Business Context ── */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Layers size={16} style={{ color: '#F15C22' }} />
              <h2 className="text-sm font-bold text-gray-900">Business Context</h2>
            </div>
            {editMode ? (
              <>
                <EditRow label="Industry">
                  <input className={inp} value={editForm.industry} onChange={e => setField('industry', e.target.value)} placeholder="e.g. B2B, B2G or B2C" />
                </EditRow>
                <EditRow label="Revenue Model">
                  <input className={inp} value={editForm.revenueModel} onChange={e => setField('revenueModel', e.target.value)} placeholder="e.g. 50M, 60M, 70M…" />
                </EditRow>
                <EditRow label="Customer Base">
                  <input className={inp} value={editForm.customerBase} onChange={e => setField('customerBase', e.target.value)} placeholder="e.g. Single Entity" />
                </EditRow>
                <EditRow label="ERP System">
                  <input className={inp} value={editForm.erpSystem} onChange={e => setField('erpSystem', e.target.value)} placeholder="e.g. SAP S/4HANA" />
                </EditRow>
                <EditRow label="Yearly Invoice Count">
                  <input className={inp} value={editForm.transaction} onChange={e => setField('transaction', e.target.value)} placeholder="e.g. 50M, 60M, 70M+" />
                </EditRow>
              </>
            ) : (
              <>
                <InfoRow label="Industry" value={proposal.industry} />
                <InfoRow label="Revenue Model" value={proposal.revenueModel} />
                <InfoRow label="Customer Base" value={proposal.customerBase} />
                <InfoRow label="ERP System" value={proposal.erpSystem} />
                <InfoRow label="Yearly Invoice Count" value={proposal.transaction} />
              </>
            )}
          </div>

          {/* ── Services ── */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-4">Selected Services</h2>
            {editMode ? (
              <div className="space-y-3">
                {SERVICE_NAMES.map(name => (
                  <div key={name}>
                    <label className="flex items-center gap-2 cursor-pointer mb-1">
                      <input
                        type="checkbox"
                        checked={editForm.services[name]?.checked || false}
                        onChange={e => setSvcField(name, 'checked', e.target.checked)}
                        className="rounded"
                        style={{ accentColor: '#F15C22' }}
                      />
                      <span className="text-sm font-medium text-gray-800">{name}</span>
                    </label>
                    {editForm.services[name]?.checked && (
                      <div className="ml-6">
                        <input
                          type="number"
                          className={inp}
                          value={editForm.services[name].price}
                          onChange={e => setSvcField(name, 'price', e.target.value)}
                          placeholder={`Price (${editForm.currency})`}
                          min="0"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              proposal.selectedServices?.length > 0 ? (
                <div className="space-y-2">
                  {proposal.selectedServices.map((s, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <span className="text-sm text-gray-700 font-medium">{s.name}</span>
                      <span className="text-sm font-bold" style={{ color: '#F15C22' }}>{formatCurrency(s.price, cur)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No services selected</p>
              )
            )}
          </div>

          {/* ── Pricing ── */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900">Pricing</h2>
              {!editMode && proposal.currency && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600">{proposal.currency}</span>
              )}
            </div>
            {editMode ? (
              <>
                <EditRow label="Gap Analysis">
                  <input type="number" className={inp} value={editForm.gapAnalysisPrice} onChange={e => setField('gapAnalysisPrice', e.target.value)} placeholder="Price" min="0" />
                </EditRow>
                <EditRow label="Implementation">
                  <input type="number" className={inp} value={editForm.implementationPrice} onChange={e => setField('implementationPrice', e.target.value)} placeholder="Price" min="0" />
                </EditRow>
                <EditRow label="Annual Subscription">
                  <input type="number" className={inp} value={editForm.annualSubscriptionPrice} onChange={e => setField('annualSubscriptionPrice', e.target.value)} placeholder="Price" min="0" />
                </EditRow>
                <EditRow label="Overage (per 1k inv.)">
                  <input type="number" className={inp} value={editForm.overagePrice} onChange={e => setField('overagePrice', e.target.value)} placeholder="Price" min="0" />
                </EditRow>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Managed Services</span>
                    <button
                      type="button"
                      onClick={() => setField('includeManagedServices', !editForm.includeManagedServices)}
                      className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0"
                      style={{ background: editForm.includeManagedServices ? '#F15C22' : '#d1d5db' }}
                    >
                      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${editForm.includeManagedServices ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  {editForm.includeManagedServices && (
                    <>
                      <EditRow label="Monitor">
                        <input type="number" className={inp} value={editForm.monitorPrice} onChange={e => setField('monitorPrice', e.target.value)} min="0" />
                      </EditRow>
                      <EditRow label="Assure">
                        <input type="number" className={inp} value={editForm.assurePrice} onChange={e => setField('assurePrice', e.target.value)} min="0" />
                      </EditRow>
                      <EditRow label="Operate">
                        <input type="number" className={inp} value={editForm.operatePrice} onChange={e => setField('operatePrice', e.target.value)} min="0" />
                      </EditRow>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <InfoRow label="Gap Analysis" value={proposal.gapAnalysisPrice ? formatCurrency(proposal.gapAnalysisPrice, cur) : null} />
                <InfoRow label="Implementation" value={proposal.implementationPrice ? formatCurrency(proposal.implementationPrice, cur) : null} />
                <InfoRow label="Annual Subscription" value={proposal.annualSubscriptionPrice ? formatCurrency(proposal.annualSubscriptionPrice, cur) : null} />
                <InfoRow label="Overage (per 1k inv.)" value={proposal.overagePrice ? formatCurrency(proposal.overagePrice, cur) : null} />
                {proposal.includeManagedServices !== false && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Managed Services</div>
                    <InfoRow label="Monitor" value={formatCurrency(proposal.monitorPrice ?? 4000, cur)} />
                    <InfoRow label="Assure" value={formatCurrency(proposal.assurePrice ?? 6000, cur)} />
                    <InfoRow label="Operate" value={formatCurrency(proposal.operatePrice ?? 9500, cur)} />
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── ERP Ecosystem ── */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 md:col-span-2">
            <h2 className="text-sm font-bold text-gray-900 mb-3">ERP Ecosystem</h2>
            {editMode ? (
              <div>
                <textarea
                  rows={2}
                  className={`${inp} font-mono resize-none`}
                  value={editForm.erpNames}
                  onChange={e => setField('erpNames', e.target.value)}
                  placeholder="Odoo, SAP S/4HANA, Oracle NetSuite, Microsoft Dynamics 365, ..."
                />
                <p className="text-xs text-gray-400 mt-1">Comma-separated list of ERP system names</p>
              </div>
            ) : (
              proposal.erpNames?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {proposal.erpNames.map(name => (
                    <span key={name} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 border border-gray-200 text-gray-700">
                      {name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No ERP systems listed</p>
              )
            )}
          </div>

        </div>
      </div>

      {/* Email Modal */}
      {emailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Send Proposal by Email</h2>
              <p className="text-sm text-gray-500 mt-1">{proposal.referenceNo} — {proposal.clientName}</p>
            </div>
            <form onSubmit={handleSendEmail} className="p-6 space-y-4">
              {emailError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{emailError}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Email <span style={{ color: '#F15C22' }}>*</span></label>
                <input type="email" required value={emailForm.to} onChange={e => setEmailForm({ ...emailForm, to: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2" placeholder="client@company.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input type="text" value={emailForm.subject} onChange={e => setEmailForm({ ...emailForm, subject: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message Body (HTML)</label>
                <textarea rows={6} value={emailForm.body} onChange={e => setEmailForm({ ...emailForm, body: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 font-mono" />
              </div>
              <p className="text-xs text-gray-400">The PDF will be auto-generated and attached to this email.</p>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEmailModal(false)} className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={sendingEmail} className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-60 hover:opacity-90 transition-opacity" style={{ background: '#F15C22' }}>
                  {sendingEmail ? 'Sending…' : 'Send Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/Layout';
import api from '@/lib/api';
import { ChevronLeft, Download, Mail, Calendar, Building2, Layers } from 'lucide-react';

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
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500 w-40 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

function formatCurrency(v, currency = 'USD') {
  if (!v && v !== 0) return 'TBD';
  const n = Number(v).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  if (currency === 'EUR') return `\u20ac${n}`;
  return `${currency} ${n}`;
}

export default function ProposalDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [emailModal, setEmailModal] = useState(false);
  const [emailForm, setEmailForm] = useState({ to: '', subject: '', body: '' });
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    async function fetch() {
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
    fetch();
  }, [id]);

  async function handleDownload() {
    setDownloading(true);
    try {
      const response = await api.get(`/proposals/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${proposal.referenceNo}-${proposal.clientName}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download PDF');
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

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-gray-900">{proposal.clientName}</h1>
                <StatusBadge status={proposal.status} />
              </div>
              <p className="text-sm text-gray-500 font-mono">{proposal.referenceNo}</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition-colors"
            >
              <Download size={15} />
              {downloading ? 'Generating...' : 'Download PDF'}
            </button>
            <button
              onClick={() => setEmailModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              style={{ background: '#F15C22' }}
            >
              <Mail size={15} />
              Send Email
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Client Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Building2 size={16} style={{ color: '#F15C22' }} />
              <h2 className="text-sm font-bold text-gray-900">Client Information</h2>
            </div>
            <InfoRow label="Client Name" value={proposal.clientName} />
            <InfoRow label="Entity / Group" value={proposal.entityGroupName} />
            <InfoRow label="Proposal Date" value={proposal.proposalDate ? new Date(proposal.proposalDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null} />
            <InfoRow label="Currency" value={proposal.currency || 'USD'} />
            <InfoRow label="Created By" value={proposal.createdBy?.name} />
            <InfoRow label="Created At" value={new Date(proposal.createdAt).toLocaleDateString()} />
            {proposal.emailSentTo && <InfoRow label="Email Sent To" value={proposal.emailSentTo} />}
            {proposal.emailSentAt && <InfoRow label="Email Sent At" value={new Date(proposal.emailSentAt).toLocaleDateString()} />}
          </div>

          {/* Business Context */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Layers size={16} style={{ color: '#F15C22' }} />
              <h2 className="text-sm font-bold text-gray-900">Business Context</h2>
            </div>
            <InfoRow label="Industry" value={proposal.industry} />
            <InfoRow label="Revenue Model" value={proposal.revenueModel} />
            <InfoRow label="Customer Base" value={proposal.customerBase} />
            <InfoRow label="ERP System" value={proposal.erpSystem} />
            <InfoRow label="Transaction Type" value={proposal.transaction} />
          </div>

          {/* Services */}
          {proposal.selectedServices?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold text-gray-900 mb-4">Selected Services</h2>
              <div className="space-y-2">
                {proposal.selectedServices.map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-700 font-medium">{s.name}</span>
                    <span className="text-sm font-bold" style={{ color: '#F15C22' }}>{formatCurrency(s.price, proposal.currency)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900">Pricing Summary</h2>
              {proposal.currency && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600">{proposal.currency}</span>
              )}
            </div>
            <InfoRow label="Gap Analysis" value={proposal.gapAnalysisPrice ? formatCurrency(proposal.gapAnalysisPrice, proposal.currency) : null} />
            <InfoRow label="Implementation" value={proposal.implementationPrice ? formatCurrency(proposal.implementationPrice, proposal.currency) : null} />
            <InfoRow label="Annual Subscription" value={proposal.annualSubscriptionPrice ? formatCurrency(proposal.annualSubscriptionPrice, proposal.currency) : null} />
            <InfoRow label="Overage (per 1k inv.)" value={proposal.overagePrice ? formatCurrency(proposal.overagePrice, proposal.currency) : null} />
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Managed Services</div>
              <InfoRow label="Monitor" value={formatCurrency(proposal.monitorPrice ?? 4000, proposal.currency)} />
              <InfoRow label="Assure" value={formatCurrency(proposal.assurePrice ?? 6000, proposal.currency)} />
              <InfoRow label="Operate" value={formatCurrency(proposal.operatePrice ?? 9500, proposal.currency)} />
            </div>
          </div>

          {/* ERP Names */}
          {proposal.erpNames?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 md:col-span-2">
              <h2 className="text-sm font-bold text-gray-900 mb-3">ERP Ecosystem</h2>
              <div className="flex flex-wrap gap-2">
                {proposal.erpNames.map(name => (
                  <span key={name} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 border border-gray-200 text-gray-700">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
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
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {emailError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Email <span style={{ color: '#F15C22' }}>*</span></label>
                <input
                  type="email"
                  required
                  value={emailForm.to}
                  onChange={e => setEmailForm({ ...emailForm, to: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  placeholder="client@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={e => setEmailForm({ ...emailForm, subject: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message Body (HTML)</label>
                <textarea
                  rows={6}
                  value={emailForm.body}
                  onChange={e => setEmailForm({ ...emailForm, body: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 font-mono text-xs"
                />
              </div>
              <p className="text-xs text-gray-400">The PDF will be auto-generated and attached to this email.</p>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEmailModal(false)}
                  className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingEmail}
                  className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-60 hover:opacity-90 transition-opacity"
                  style={{ background: '#F15C22' }}
                >
                  {sendingEmail ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/Layout';
import api from '@/lib/api';
import { getUser } from '@/lib/auth';
import { Plus, Download, Mail, Trash2, Eye } from 'lucide-react';

const STATUS_OPTIONS = ['all', 'draft', 'active', 'sent', 'accepted', 'rejected'];

function StatusBadge({ status }) {
  const styles = {
    draft: 'bg-gray-100 text-gray-600',
    active: 'bg-blue-100 text-blue-700',
    sent: 'bg-orange-100 text-orange-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

export default function ProposalsPage() {
  const [user] = useState(() => getUser());
  const [proposals, setProposals] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [emailModal, setEmailModal] = useState(null);
  const [emailForm, setEmailForm] = useState({ to: '', subject: '', body: '' });
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    fetchProposals();
  }, []);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFiltered(proposals);
    } else {
      setFiltered(proposals.filter(p => p.status === statusFilter));
    }
  }, [statusFilter, proposals]);

  async function fetchProposals() {
    try {
      const { data } = await api.get('/proposals');
      setProposals(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(proposal) {
    try {
      const response = await api.get(`/proposals/${proposal._id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${proposal.referenceNo}-${proposal.clientName}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download PDF');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this proposal?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/proposals/${id}`);
      setProposals(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      alert('Failed to delete proposal');
    } finally {
      setDeletingId(null);
    }
  }

  function openEmailModal(proposal) {
    setEmailModal(proposal);
    setEmailForm({
      to: proposal.emailSentTo || '',
      subject: `Proposal ${proposal.referenceNo} - ${proposal.clientName}`,
      body: `<p>Dear ${proposal.clientName},</p><p>Please find attached the eInvoicing Compliance & Implementation Proposal (Ref: ${proposal.referenceNo}).</p><p>We look forward to your feedback.</p><p>Best regards,<br/>KGRN Chartered Accountants LLC</p>`,
    });
    setEmailError('');
  }

  async function handleSendEmail(e) {
    e.preventDefault();
    setSendingEmail(true);
    setEmailError('');
    try {
      await api.post(`/proposals/${emailModal._id}/send`, emailForm);
      setProposals(prev => prev.map(p => p._id === emailModal._id ? { ...p, status: 'sent', emailSentTo: emailForm.to } : p));
      setEmailModal(null);
      alert('Email sent successfully!');
    } catch (err) {
      setEmailError(err.response?.data?.message || 'Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  }

  return (
    <AppLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Proposals</h1>
            <p className="text-gray-500 text-sm mt-1">{filtered.length} proposal{filtered.length !== 1 ? 's' : ''}</p>
          </div>
          <Link
            href="/proposals/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            style={{ background: '#F15C22' }}
          >
            <Plus size={16} />
            New Proposal
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                statusFilter === s ? 'text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
              style={statusFilter === s ? { background: '#F15C22' } : {}}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#F15C22' }}></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FileText size={40} className="mx-auto mb-3 opacity-30" />
              <p>No proposals found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Reference</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Client Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Template</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                    {user?.role === 'admin' && (
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Created By</th>
                    )}
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Date</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">{p.referenceNo}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        <Link href={`/proposals/${p._id}`} className="hover:underline" style={{ color: '#F15C22' }}>
                          {p.clientName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{p.templateName || 'eInvoicing Proposal'}</td>
                      <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                      {user?.role === 'admin' && (
                        <td className="px-4 py-3 text-gray-600 text-xs">{p.createdBy?.name || '—'}</td>
                      )}
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/proposals/${p._id}`}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                            title="View"
                          >
                            <Eye size={15} />
                          </Link>
                          <button
                            onClick={() => handleDownload(p)}
                            className="p-1.5 rounded hover:bg-orange-50 text-gray-400 transition-colors"
                            style={{ '--hover-color': '#F15C22' }}
                            title="Download PDF"
                          >
                            <Download size={15} />
                          </button>
                          <button
                            onClick={() => openEmailModal(p)}
                            className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Send Email"
                          >
                            <Mail size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(p._id)}
                            disabled={deletingId === p._id}
                            className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-40"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              <p className="text-sm text-gray-500 mt-1">{emailModal.referenceNo} — {emailModal.clientName}</p>
            </div>
            <form onSubmit={handleSendEmail} className="p-6 space-y-4">
              {emailError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {emailError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Email *</label>
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
                  rows={5}
                  value={emailForm.body}
                  onChange={e => setEmailForm({ ...emailForm, body: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 font-mono"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEmailModal(null)}
                  className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingEmail}
                  className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-60 hover:opacity-90"
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

// Need to import for the empty state
function FileText({ size, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  );
}

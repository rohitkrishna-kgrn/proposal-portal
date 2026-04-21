'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/Layout';
import api from '@/lib/api';
import { getUser } from '@/lib/auth';
import { Mail, Globe, Webhook, CheckCircle2, AlertCircle, Copy, Check, ExternalLink, Code2, Lock } from 'lucide-react';

const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-colors";

function SectionCard({ title, description, icon: Icon, iconBg, iconColor, badge, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between" style={{ background: 'linear-gradient(135deg,#F9FAFB 0%,#FFFFFF 100%)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: iconBg }}>
            <Icon size={17} style={{ color: iconColor }} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          </div>
        </div>
        {badge && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: badge.bg, color: badge.color }}>
            {badge.label}
          </span>
        )}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Toast({ type, message, onClose }) {
  return (
    <div className={`fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium z-50 ${type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
      {type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 text-lg leading-none">&times;</button>
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors"
      style={{ background: copied ? '#dcfce7' : '#f1f5f9', color: copied ? '#16a34a' : '#64748b' }}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function CodeBlock({ code, lang = 'json' }) {
  return (
    <div className="relative rounded-xl overflow-hidden border border-gray-800">
      <div className="flex items-center justify-between px-4 py-2" style={{ background: '#1e293b' }}>
        <span className="text-xs font-mono font-medium text-gray-400 uppercase tracking-wider">{lang}</span>
        <CopyButton text={code} />
      </div>
      <pre className="text-xs font-mono leading-relaxed overflow-x-auto p-4" style={{ background: '#0f172a', color: '#94a3b8' }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function FieldRow({ label, value }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <code className="text-xs font-mono font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded mt-0.5 shrink-0">{label}</code>
      <span className="text-sm text-gray-600">{value}</span>
    </div>
  );
}

export default function AdminConfigPage() {
  const router = useRouter();
  const [currentUser] = useState(() => getUser());
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeWebhookTab, setActiveWebhookTab] = useState('reference');

  const [smtpForm, setSmtpForm] = useState({ host: '', port: '587', user: '', pass: '', from: '' });
  const [corsForm, setCorsForm] = useState({ allowedOrigins: 'http://localhost:3000' });
  const [savingSmtp, setSavingSmtp] = useState(false);
  const [savingCors, setSavingCors] = useState(false);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (currentUser?.role !== 'admin') { router.replace('/dashboard'); return; }
    async function fetchConfig() {
      try {
        const { data } = await api.get('/config');
        if (data.smtp) setSmtpForm(prev => ({ ...prev, host: data.smtp.host || '', port: String(data.smtp.port || '587'), user: data.smtp.user || '', from: data.smtp.from || '' }));
        if (data.cors) {
          const origins = Array.isArray(data.cors.allowedOrigins) ? data.cors.allowedOrigins.join(',') : (data.cors.allowedOrigins || 'http://localhost:3000');
          setCorsForm({ allowedOrigins: origins });
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    fetchConfig();
  }, [currentUser, router]);

  async function handleSmtpSave(e) {
    e.preventDefault(); setSavingSmtp(true);
    try { await api.post('/config/smtp', { ...smtpForm, port: parseInt(smtpForm.port) }); showToast('success', 'SMTP configuration saved'); }
    catch (err) { showToast('error', err.response?.data?.message || 'Failed to save SMTP config'); }
    finally { setSavingSmtp(false); }
  }

  async function handleCorsSave(e) {
    e.preventDefault(); setSavingCors(true);
    try {
      const allowedOrigins = corsForm.allowedOrigins.split(',').map(o => o.trim()).filter(Boolean);
      await api.post('/config/cors', { allowedOrigins }); showToast('success', 'CORS configuration saved');
    } catch (err) { showToast('error', err.response?.data?.message || 'Failed to save CORS config'); }
    finally { setSavingCors(false); }
  }

  const apiBase = typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '')
    : 'http://localhost:5000';

  const webhookUrl = `${apiBase}/api/webhooks/einvoicing-proposal`;

  const samplePayload = `{
  "clientName": "Acme Corporation",
  "entityGroupName": "Acme Group",
  "proposalDate": "2026-04-01",
  "currency": "AED",
  "selectedServices": [
    { "name": "Gap Analysis", "price": 3000 },
    { "name": "Implementation", "price": 8000 },
    { "name": "Annual Subscription", "price": 12000 }
  ],
  "industry": "B2B, B2G or B2C",
  "revenueModel": "50M, 60M, 70M",
  "customerBase": "UAE-based",
  "erpSystem": "SAP S/4HANA",
  "transaction": "50M+",
  "gapAnalysisPrice": 3000,
  "implementationPrice": 8000,
  "annualSubscriptionPrice": 12000,
  "overagePrice": 500,
  "erpNames": ["Odoo", "SAP S/4HANA", "Oracle NetSuite"],
  "monitorPrice": 4000,
  "assurePrice": 6000,
  "operatePrice": 9500,
  "includeManagedServices": true
}`;

  const curlExample = `curl -X POST \\
  ${webhookUrl} \\
  -H "Content-Type: application/json" \\
  -H "Origin: https://yourapp.com" \\
  --output proposal.pdf \\
  -d '{"clientName":"Acme Corp","currency":"AED",...}'`;

  if (loading) return (
    <AppLayout>
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#F15C22' }}></div>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="p-6 max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuration</h1>
          <p className="text-gray-500 text-sm mt-1">Manage SMTP, CORS, and webhook API settings</p>
        </div>

        {/* SMTP */}
        <SectionCard title="SMTP Configuration" description="Outgoing email for sending proposals to clients" icon={Mail} iconBg="#fff3ef" iconColor="#F15C22">
          <form onSubmit={handleSmtpSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">SMTP Host</label>
                <input type="text" value={smtpForm.host} onChange={e => setSmtpForm({ ...smtpForm, host: e.target.value })} className={inputClass} placeholder="smtp.gmail.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Port</label>
                <input type="number" value={smtpForm.port} onChange={e => setSmtpForm({ ...smtpForm, port: e.target.value })} className={inputClass} placeholder="587" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Username / Email</label>
                <input type="text" value={smtpForm.user} onChange={e => setSmtpForm({ ...smtpForm, user: e.target.value })} className={inputClass} placeholder="your@email.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Password / App Password</label>
                <div className="relative">
                  <input type="password" value={smtpForm.pass} onChange={e => setSmtpForm({ ...smtpForm, pass: e.target.value })} className={inputClass} placeholder="••••••••••••" />
                  <Lock size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">From Name &amp; Email</label>
                <input type="text" value={smtpForm.from} onChange={e => setSmtpForm({ ...smtpForm, from: e.target.value })} className={inputClass} placeholder='KGRN Proposals <proposals@kgrnaudit.com>' />
              </div>
            </div>
            <div className="pt-1 flex items-center gap-3">
              <button type="submit" disabled={savingSmtp} className="px-5 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-60 hover:opacity-90 transition-opacity" style={{ background: '#F15C22' }}>
                {savingSmtp ? 'Saving...' : 'Save SMTP Settings'}
              </button>
              <span className="text-xs text-gray-400">Used when sending proposals via email</span>
            </div>
          </form>
        </SectionCard>

        {/* CORS */}
        <SectionCard title="CORS Configuration" description="Restrict which origins can access the API" icon={Globe} iconBg="#eff6ff" iconColor="#2563eb">
          <form onSubmit={handleCorsSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Allowed Origins</label>
              <textarea rows={3} value={corsForm.allowedOrigins} onChange={e => setCorsForm({ allowedOrigins: e.target.value })} className={`${inputClass} font-mono resize-none`} placeholder="http://localhost:3000,https://yourapp.com" />
              <p className="text-xs text-gray-400 mt-1.5">Separate multiple origins with commas. Changes take effect on the next request.</p>
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={savingCors} className="px-5 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-60 hover:opacity-90 transition-opacity" style={{ background: '#2563eb' }}>
                {savingCors ? 'Saving...' : 'Save CORS Settings'}
              </button>
              <span className="text-xs text-gray-400">Applies to all <code className="font-mono bg-gray-100 px-1 rounded">/api/*</code> routes</span>
            </div>
          </form>
        </SectionCard>

        {/* Webhook API */}
        <SectionCard
          title="Webhook API"
          description="Generate PDFs programmatically — no authentication required"
          icon={Webhook}
          iconBg="#f0fdf4"
          iconColor="#16a34a"
          badge={{ label: 'Public Endpoint', bg: '#dcfce7', color: '#15803d' }}
        >
          {/* Endpoint row */}
          <div className="mb-5">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">eInvoicing Proposal PDF Generator</div>
            <div className="flex items-center gap-2 bg-gray-950 rounded-xl px-4 py-3">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-green-500 text-white">POST</span>
              <code className="flex-1 text-green-400 text-xs font-mono break-all">{webhookUrl}</code>
              <CopyButton text={webhookUrl} />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-4 p-1 bg-gray-100 rounded-lg w-fit">
            {[
              { id: 'reference', label: 'Request Body', icon: Code2 },
              { id: 'curl',      label: 'cURL Example', icon: ExternalLink },
              { id: 'env',       label: 'Environment',  icon: Lock },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveWebhookTab(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${activeWebhookTab === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>

          {activeWebhookTab === 'reference' && (
            <div className="space-y-4">
              <div>
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Field Reference</div>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <FieldRow label="clientName" value="string — required. Client company name." />
                  <FieldRow label="entityGroupName" value="string — Group or entity name (optional)." />
                  <FieldRow label="proposalDate" value='string — ISO date, e.g. "2026-04-01".' />
                  <FieldRow label="currency" value='"USD" | "AED" | "EUR" — defaults to USD.' />
                  <FieldRow label="selectedServices" value='array of { name, price } — services to include.' />
                  <FieldRow label="industry" value="string — Client industry (e.g. Retail, Manufacturing)." />
                  <FieldRow label="revenueModel" value="string — B2B, B2C, or Mixed." />
                  <FieldRow label="customerBase" value="string — e.g. Single Entity, Multi Entity." />
                  <FieldRow label="erpSystem" value="string — Primary ERP system name." />
                  <FieldRow label="transaction" value='string — Yearly invoice count, e.g. "50M+" (shown as "Yearly Invoice Count" in PDF).' />
                  <FieldRow label="gapAnalysisPrice" value="number — One-time gap analysis fee." />
                  <FieldRow label="implementationPrice" value="number — One-time implementation fee." />
                  <FieldRow label="annualSubscriptionPrice" value="number — Annual subscription price." />
                  <FieldRow label="overagePrice" value="number — Per 1,000 invoice overage rate." />
                  <FieldRow label="monitorPrice" value="number — Monitor tier annual price (default 4000)." />
                  <FieldRow label="assurePrice" value="number — Assure tier annual price (default 6000)." />
                  <FieldRow label="operatePrice" value="number — Operate tier annual price (default 9500)." />
                  <FieldRow label="erpNames" value="string[] — List of ERP names shown on ERP slide." />
                  <FieldRow label="includeManagedServices" value="boolean — If false, slide 14 (Managed Services pricing) is excluded from the PDF. Defaults to true." />
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Sample Payload</div>
                <CodeBlock code={samplePayload} lang="json" />
              </div>
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                <CheckCircle2 size={14} className="text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700">Response is a <strong>binary PDF</strong> with <code className="font-mono bg-blue-100 px-1 rounded">Content-Type: application/pdf</code>. Save the response body as a <code className="font-mono bg-blue-100 px-1 rounded">.pdf</code> file.</p>
              </div>
            </div>
          )}

          {activeWebhookTab === 'curl' && (
            <div className="space-y-4">
              <CodeBlock code={curlExample} lang="shell" />
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">JavaScript (fetch) Example</div>
                <CodeBlock code={`const res = await fetch('${webhookUrl}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Origin': 'https://yourapp.com'
  },
  body: JSON.stringify({
    clientName: 'Acme Corporation',
    currency: 'AED',
    // ... other fields
  })
});
const blob = await res.blob();
const url = URL.createObjectURL(blob);
window.open(url);`} lang="javascript" />
              </div>
            </div>
          )}

          {activeWebhookTab === 'env' && (
            <div className="space-y-4">
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Backend .env Variables</div>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <FieldRow label="WEBHOOK_ALLOWED_ORIGINS" value="Comma-separated list of origins permitted to call the webhook. Leave empty to allow all." />
                <FieldRow label="ALLOWED_ORIGINS" value="Comma-separated origins for the main API CORS policy." />
                <FieldRow label="PORT" value="Backend server port (default 5000)." />
                <FieldRow label="JWT_SECRET" value="Secret key for signing JWT tokens." />
                <FieldRow label="MONGODB_URI" value="MongoDB connection string." />
              </div>
              <CodeBlock code={`# .env (backend)
PORT=5000
MONGODB_URI=mongodb://localhost:27017/proposal-portal
JWT_SECRET=your-secret-key

# CORS for main API
ALLOWED_ORIGINS=http://localhost:3000,https://yourapp.com

# CORS for webhook only
WEBHOOK_ALLOWED_ORIGINS=https://yourapp.com,https://partner.com`} lang="dotenv" />
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700">
                  <strong>Security:</strong> The webhook endpoint bypasses JWT auth by design. Always restrict{' '}
                  <code className="font-mono bg-amber-100 px-1 rounded">WEBHOOK_ALLOWED_ORIGINS</code> in production to prevent unauthorized PDF generation.
                </p>
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </AppLayout>
  );
}

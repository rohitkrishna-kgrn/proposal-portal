'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen, LogIn, FileText, Download, Mail, Webhook, Users, Settings,
  Globe, ChevronRight, Code2, CheckCircle2, AlertCircle, Info, Lock,
  LayoutDashboard, Plus, Copy, Check,
} from 'lucide-react';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }
  return (
    <button onClick={handleCopy} className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors" style={{ background: copied ? '#dcfce7' : '#1e293b', color: copied ? '#16a34a' : '#94a3b8' }}>
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function CodeBlock({ code, lang = 'json' }) {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-800 my-3">
      <div className="flex items-center justify-between px-4 py-2" style={{ background: '#1e293b' }}>
        <span className="text-xs font-mono font-medium text-gray-400 uppercase tracking-wider">{lang}</span>
        <CopyButton text={code} />
      </div>
      <pre className="text-xs font-mono leading-relaxed overflow-x-auto p-4" style={{ background: '#0f172a', color: '#94a3b8' }}><code>{code}</code></pre>
    </div>
  );
}

function Callout({ type = 'info', children }) {
  const styles = {
    info:    { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8', icon: Info },
    success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', icon: CheckCircle2 },
    warning: { bg: '#fffbeb', border: '#fde68a', text: '#92400e', icon: AlertCircle },
    danger:  { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', icon: AlertCircle },
  };
  const s = styles[type];
  const Icon = s.icon;
  return (
    <div className="flex items-start gap-3 rounded-lg px-4 py-3 my-3 text-sm border" style={{ background: s.bg, borderColor: s.border, color: s.text }}>
      <Icon size={15} className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

function Section({ id, icon: Icon, title, children }) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-200">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#fff3ef' }}>
          <Icon size={16} style={{ color: '#F15C22' }} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      <div className="text-gray-700 space-y-3 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

function H3({ children }) {
  return <h3 className="text-base font-bold text-gray-900 mt-6 mb-2">{children}</h3>;
}

function FieldTable({ rows }) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden my-3">
      <table className="w-full text-xs">
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            <th className="text-left px-4 py-2.5 font-semibold text-gray-600 border-b border-gray-200 w-40">Field</th>
            <th className="text-left px-4 py-2.5 font-semibold text-gray-600 border-b border-gray-200 w-28">Type</th>
            <th className="text-left px-4 py-2.5 font-semibold text-gray-600 border-b border-gray-200">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([field, type, desc], i) => (
            <tr key={field} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-4 py-2.5 font-mono font-semibold text-orange-600">{field}</td>
              <td className="px-4 py-2.5 text-blue-600 font-mono">{type}</td>
              <td className="px-4 py-2.5 text-gray-600">{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const NAV = [
  { id: 'overview',        label: 'Overview',           icon: BookOpen },
  { id: 'login',           label: 'Login & Access',     icon: LogIn },
  { id: 'dashboard',       label: 'Dashboard',          icon: LayoutDashboard },
  { id: 'proposals',       label: 'Creating Proposals', icon: FileText },
  { id: 'pdf',             label: 'PDF Generation',     icon: Download },
  { id: 'email',           label: 'Sending by Email',   icon: Mail },
  { id: 'webhook',         label: 'Webhook API',        icon: Webhook },
  { id: 'users',           label: 'User Management',    icon: Users },
  { id: 'configuration',   label: 'Configuration',      icon: Settings },
  { id: 'currency',        label: 'Currency Support',   icon: Globe },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('overview');

  function scrollTo(id) {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', -apple-system, 'Segoe UI', sans-serif" }}>
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="text-lg font-bold">
            <span style={{ color: '#F15C22' }}>KGRN</span>
            <span className="font-normal text-base ml-1" style={{ color: '#0070C0' }}>Amplified</span>
          </div>
          <span className="text-xs text-gray-400 border-l border-gray-200 pl-3">Portal Manual</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">v1.0</span>
          <Link href="/login" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity" style={{ background: '#F15C22' }}>
            <LogIn size={13} />
            Sign In
          </Link>
        </div>
      </header>

      <div className="flex max-w-6xl mx-auto">
        {/* Sidebar nav */}
        <aside className="w-56 shrink-0 sticky top-14 self-start h-[calc(100vh-3.5rem)] overflow-y-auto py-6 px-3 hidden lg:block">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Contents</div>
          <nav className="space-y-0.5">
            {NAV.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors ${activeSection === id ? 'font-semibold text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                style={activeSection === id ? { background: '#F15C22' } : {}}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 py-8 px-6 lg:px-10 space-y-14">

          {/* ── Overview ── */}
          <Section id="overview" icon={BookOpen} title="Overview">
            <p>The <strong>KGRN Proposal Portal</strong> is a full-stack web application for creating, managing, and delivering professional PDF proposals for UAE eInvoicing compliance engagements.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              {[
                { icon: FileText, label: 'Proposals', desc: 'Create and manage proposals from reusable templates' },
                { icon: Download, label: 'PDF Export', desc: 'Generate pixel-perfect 16-slide landscape PDFs instantly' },
                { icon: Mail,     label: 'Email Delivery', desc: 'Send proposals directly to clients via configured SMTP' },
                { icon: Webhook,  label: 'Webhook API', desc: 'Integrate PDF generation into external systems via HTTP' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="border border-gray-200 rounded-xl p-4 bg-white flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#fff3ef' }}>
                    <Icon size={15} style={{ color: '#F15C22' }} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <H3>Technology Stack</H3>
            <FieldTable rows={[
              ['Frontend',  'Next.js 16', 'App Router, React, Tailwind CSS v4'],
              ['Backend',   'Node.js',    'Express, MongoDB/Mongoose, JWT auth'],
              ['PDF Engine','Puppeteer',  'Headless Chrome renders HTML → PDF'],
              ['Email',     'Nodemailer', 'SMTP-based email with PDF attachment'],
            ]} />

            <H3>Roles</H3>
            <FieldTable rows={[
              ['admin', 'Full access', 'Dashboard, proposals (all), users, configuration'],
              ['user',  'Limited access', 'Dashboard (own stats), proposals (own only)'],
            ]} />
            <Callout type="info">Only admins can register new users. There is no public registration.</Callout>
          </Section>

          {/* ── Login ── */}
          <Section id="login" icon={LogIn} title="Login & Access">
            <p>Navigate to <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-xs">/login</code> to sign in. The default admin account created on first start is:</p>
            <FieldTable rows={[
              ['Email',    'string', 'admin@kgrn.com'],
              ['Password', 'string', 'Admin@123'],
            ]} />
            <Callout type="warning">Change the default admin password immediately after first login. Go to <strong>Admin → Manage Users</strong> and edit the admin account.</Callout>

            <H3>Session</H3>
            <p>Authentication uses <strong>JWT tokens</strong> stored in <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-xs">localStorage</code>. Sessions persist across page refreshes. Clicking <em>Sign out</em> clears the token. The token has no expiry configured by default — adjust <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-xs">JWT_SECRET</code> and expiry in the backend if needed.</p>
          </Section>

          {/* ── Dashboard ── */}
          <Section id="dashboard" icon={LayoutDashboard} title="Dashboard">
            <p>The dashboard provides an at-a-glance view of portal activity.</p>
            <H3>Admin Dashboard</H3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Stat cards:</strong> Total proposals, total users, active proposals, proposals this month</li>
              <li><strong>Monthly trend chart:</strong> Bar chart of proposals created per month (last 6 months)</li>
              <li><strong>Status distribution:</strong> Pie chart — active / draft / sent breakdown</li>
              <li><strong>Top services:</strong> Bar chart of service usage frequency</li>
            </ul>
            <H3>User Dashboard</H3>
            <p>Users see only their own recent proposals and basic stats (their total proposal count).</p>
          </Section>

          {/* ── Creating Proposals ── */}
          <Section id="proposals" icon={FileText} title="Creating Proposals">
            <p>Navigate to <strong>Proposals → New Proposal</strong> and select the <em>eInvoicing Proposal</em> template.</p>

            <H3>Form Sections</H3>
            <FieldTable rows={[
              ['1 — Client Details',         '', 'Client name, entity/group name, proposal date, currency'],
              ['2 — Services',               '', 'Select Gap Analysis, Implementation, Annual Subscription with prices'],
              ['3 — Business Context',       '', 'Industry, revenue model, customer base, ERP system, transaction type'],
              ['4 — Pricing Details',        '', 'Subscription and overage prices (fallback if not set in services)'],
              ['5 — Managed Services Pricing','','Monitor / Assure / Operate tier annual prices'],
              ['6 — ERP Ecosystem',          '', 'List of ERP systems shown on the ERP compatibility slide'],
            ]} />

            <Callout type="info">The <strong>currency</strong> field in Section 1 controls the currency symbol shown throughout the entire form and in the generated PDF. Changing it updates all price labels instantly.</Callout>

            <H3>Services</H3>
            <p>Tick a service to include it. Each checked service shows a price input. Unchecked services are excluded from the proposal PDF's pricing slides.</p>

            <H3>Proposal Status</H3>
            <FieldTable rows={[
              ['active', 'string', 'Default status on creation'],
              ['draft',  'string', 'Can be set via edit'],
              ['sent',   'string', 'Automatically set when emailed'],
            ]} />
          </Section>

          {/* ── PDF Generation ── */}
          <Section id="pdf" icon={Download} title="PDF Generation">
            <p>Clicking <strong>Download PDF</strong> on any proposal page calls the backend which uses <strong>Puppeteer</strong> (headless Chrome) to render an HTML template into a 16-slide landscape PDF (1440×810 px per slide).</p>

            <H3>Slide Structure</H3>
            <FieldTable rows={[
              ['Slide 1',  'Cover',                   'Client name, entity, date, KGRN logo'],
              ['Slide 2',  'Active Proposal',         'Service overview — Compliance, Implementation, Automation'],
              ['Slide 3',  'Executive Summary',       'Regulatory mandate, investment table, recommendation'],
              ['Slide 4',  'Business Context',        'Client industry, revenue model, ERP system, challenges'],
              ['Slide 5',  'How eInvoicing Works',    'End-to-end flow diagram: ERP → KGRN → Peppol → FTA'],
              ['Slide 6',  'Implementation Approach', '4-phase plan: Gap Assessment → Setup → Testing → Go-Live'],
              ['Slide 7',  'Roles & Responsibilities','Client, KGRN, and Platform ownership model'],
              ['Slide 8',  'Commercial Model',        'One-time fees, annual subscription, overage pricing'],
              ['Slide 9',  'Day-to-Day Processing',   '5-step automated workflow, exception handling'],
              ['Slide 10', 'Cross-Border',            'International invoicing compliance requirements'],
              ['Slide 11', 'ERP Flexibility',         'Supported ERP ecosystem, integration methods'],
              ['Slide 12', 'Compliance Assurance',    'Regulatory assurance, risk mitigation, governance'],
              ['Slide 13', 'Managed Services Model',  'Monitor / Assure / Operate tier descriptions'],
              ['Slide 14', 'Commercial Options',      'Managed services pricing table with tier comparison'],
              ['Slide 15', 'Immediate Next Steps',    'Action items + contact info'],
              ['Slide 16', 'Closing',                 'Recommended way forward, contact details'],
            ]} />

            <Callout type="info">PDF generation requires the backend server to have Puppeteer (headless Chrome) available. On Linux servers, ensure the <code className="font-mono text-xs">--no-sandbox</code> flag is supported.</Callout>

            <H3>Logo</H3>
            <p>The PDF uses the image at <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-xs">frontend/public/logo-kgrn.png</code>. Replace this file to update the logo across all generated PDFs. If the file is missing, a text fallback is used.</p>
          </Section>

          {/* ── Email ── */}
          <Section id="email" icon={Mail} title="Sending by Email">
            <p>From any proposal's detail page, click <strong>Send Email</strong>. A modal appears with a pre-filled body. You can edit the subject and body before sending.</p>

            <H3>How It Works</H3>
            <ol className="list-decimal pl-5 space-y-1">
              <li>The backend generates the PDF on-the-fly (same as Download)</li>
              <li>It reads SMTP credentials from the database (set in Configuration)</li>
              <li>Sends via Nodemailer with the PDF attached</li>
              <li>Proposal status is updated to <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-xs">sent</code></li>
            </ol>

            <Callout type="warning">SMTP must be configured in <strong>Admin → Configuration</strong> before sending emails. Gmail users should use an App Password, not their regular account password.</Callout>

            <H3>Gmail App Password Setup</H3>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Enable 2-Step Verification on your Google account</li>
              <li>Go to <em>Google Account → Security → App Passwords</em></li>
              <li>Generate a password for "Mail"</li>
              <li>Use <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-xs">smtp.gmail.com</code>, port <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-xs">587</code>, and the generated App Password</li>
            </ol>
          </Section>

          {/* ── Webhook API ── */}
          <Section id="webhook" icon={Webhook} title="Webhook API">
            <p>The webhook endpoint generates a PDF and returns the binary directly — no authentication token required. Useful for integrating proposal generation into external systems (CRM, ERP, portals).</p>

            <H3>Endpoint</H3>
            <CodeBlock code="POST /api/webhooks/einvoicing-proposal" lang="http" />

            <H3>Request</H3>
            <CodeBlock code={`Content-Type: application/json
Origin: https://yourapp.com  // must match WEBHOOK_ALLOWED_ORIGINS`} lang="http" />
            <CodeBlock code={`{
  "clientName": "Acme Corporation",      // required
  "entityGroupName": "Acme Group",       // optional
  "proposalDate": "2026-04-01",
  "currency": "AED",                     // "USD" | "AED" | "EUR"
  "selectedServices": [
    { "name": "Gap Analysis", "price": 3000 },
    { "name": "Implementation", "price": 8000 }
  ],
  "industry": "Retail",
  "revenueModel": "B2B",
  "customerBase": "UAE-based",
  "erpSystem": "SAP S/4HANA",
  "transaction": "Domestic B2B",
  "gapAnalysisPrice": 3000,
  "implementationPrice": 8000,
  "annualSubscriptionPrice": 12000,
  "overagePrice": 500,
  "monitorPrice": 4000,
  "assurePrice": 6000,
  "operatePrice": 9500,
  "erpNames": ["Odoo", "SAP", "Oracle NetSuite"]
}`} lang="json" />

            <H3>Response</H3>
            <FieldTable rows={[
              ['200', 'application/pdf', 'PDF binary — save as .pdf file'],
              ['400', 'application/json', '{ "message": "clientName is required" }'],
              ['403', 'application/json', 'Origin not in WEBHOOK_ALLOWED_ORIGINS'],
              ['500', 'application/json', 'PDF generation error'],
            ]} />

            <H3>CORS Restriction</H3>
            <p>Set <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-xs">WEBHOOK_ALLOWED_ORIGINS</code> in your backend <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-xs">.env</code>:</p>
            <CodeBlock code="WEBHOOK_ALLOWED_ORIGINS=https://yourapp.com,https://partner.com" lang="dotenv" />
            <Callout type="danger">Leave <code className="font-mono text-xs">WEBHOOK_ALLOWED_ORIGINS</code> empty and the webhook accepts requests from any origin. Always restrict this in production.</Callout>
          </Section>

          {/* ── Users ── */}
          <Section id="users" icon={Users} title="User Management">
            <p>Navigate to <strong>Admin → Manage Users</strong> to create and manage portal accounts.</p>
            <Callout type="info">Only admins can access this section. Regular users cannot register themselves.</Callout>

            <H3>User Fields</H3>
            <FieldTable rows={[
              ['name',     'string',         'Display name shown in the sidebar'],
              ['email',    'string',         'Login email — must be unique'],
              ['password', 'string',         'Minimum 6 characters. Stored as bcrypt hash.'],
              ['role',     'admin | user',   'Determines access level throughout the portal'],
            ]} />

            <H3>Actions</H3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Add User:</strong> Click the <em>Add User</em> button, fill the form, and submit</li>
              <li><strong>Edit User:</strong> Click the edit icon on any user row to update name, email, password, or role</li>
              <li><strong>Delete User:</strong> Click the trash icon. This is irreversible. You cannot delete the currently logged-in admin.</li>
            </ul>
          </Section>

          {/* ── Configuration ── */}
          <Section id="configuration" icon={Settings} title="Configuration">
            <p>Navigate to <strong>Admin → Configuration</strong> to manage SMTP, CORS, and view webhook documentation.</p>

            <H3>SMTP Settings</H3>
            <FieldTable rows={[
              ['host', 'string', 'SMTP server hostname (e.g. smtp.gmail.com)'],
              ['port', 'number', 'SMTP port — 587 (TLS/STARTTLS) or 465 (SSL)'],
              ['user', 'string', 'SMTP login username or email address'],
              ['pass', 'string', 'SMTP password or App Password (not returned by API for security)'],
              ['from', 'string', 'Sender display — e.g. KGRN Proposals <proposals@kgrnaudit.com>'],
            ]} />

            <H3>CORS Settings</H3>
            <p>Controls which frontend origins can call the backend API. Enter a comma-separated list of allowed origins. Takes effect on the next incoming request (no server restart needed).</p>
            <CodeBlock code="http://localhost:3000,https://proposals.kgrnaudit.com" lang="text" />

            <H3>Environment Variables</H3>
            <p>Some settings are configured via the backend <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-xs">.env</code> file and cannot be changed at runtime:</p>
            <FieldTable rows={[
              ['PORT',                    'number', 'Backend HTTP port (default 5000)'],
              ['MONGODB_URI',             'string', 'MongoDB connection string'],
              ['JWT_SECRET',              'string', 'Secret for signing JWT tokens — keep this private'],
              ['ALLOWED_ORIGINS',         'string', 'Fallback CORS origins if not set in DB'],
              ['WEBHOOK_ALLOWED_ORIGINS', 'string', 'Origins allowed to call the webhook endpoint'],
            ]} />
          </Section>

          {/* ── Currency ── */}
          <Section id="currency" icon={Globe} title="Currency Support">
            <p>The portal supports three currencies. Select one in <strong>Section 1</strong> of the proposal form — it propagates to all price labels in the form and to the generated PDF.</p>

            <FieldTable rows={[
              ['USD', 'US Dollar',  'Formatted as USD 12,000'],
              ['AED', 'UAE Dirham', 'Formatted as AED 12,000'],
              ['EUR', 'Euro',       'Formatted as €12,000'],
            ]} />

            <H3>Webhook</H3>
            <p>Pass <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-xs">"currency": "AED"</code> in the webhook payload to override the currency in the generated PDF. Defaults to <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-xs">"USD"</code> if omitted.</p>

            <Callout type="info">Currency is stored with each proposal in the database. Changing a proposal's currency after creation requires editing the proposal and regenerating the PDF.</Callout>
          </Section>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-8 pb-12 text-center text-xs text-gray-400">
            <p>KGRN Chartered Accountants LLC &nbsp;·&nbsp; Proposal Portal Manual &nbsp;·&nbsp; &copy; 2026 KGRN</p>
            <p className="mt-1">Confidential &nbsp;·&nbsp; For internal use only</p>
          </div>
        </main>
      </div>
    </div>
  );
}

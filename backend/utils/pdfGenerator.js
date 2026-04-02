const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

function formatDate(date) {
  if (!date) return new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function formatCurrency(amount, currency = 'USD') {
  if (amount === null || amount === undefined || amount === '') return 'TBD';
  const n = Number(amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  if (currency === 'EUR') return `\u20ac${n}`;
  return `${currency} ${n}`;
}

function generateHTML(proposal, logoDataURI) {
  const {
    clientName = 'Client Name',
    entityGroupName = '',
    proposalDate,
    selectedServices = [],
    industry = '', revenueModel = '', customerBase = '', erpSystem = '', transaction = '',
    gapAnalysisPrice, implementationPrice, annualSubscriptionPrice, overagePrice,
    currency = 'USD',
    erpNames = ['Odoo','Oracle NetSuite','SAP S/4HANA','Microsoft Dynamics 365','Sage','QuickBooks','Xero','Zoho Books','Epicor','Infor','JD Edwards','Workday','Acumatica','SYSPRO','Priority ERP'],
    monitorPrice = 4000, assurePrice = 6000, operatePrice = 9500
  } = proposal;

  const cur = currency || 'USD';
  const fc = (v) => formatCurrency(v, cur);

  const gapSvc  = selectedServices.find(s => s.name === 'Gap Analysis');
  const implSvc = selectedServices.find(s => s.name === 'Implementation');
  const subSvc  = selectedServices.find(s => s.name === 'Annual Subscription');
  const gapPrice  = gapSvc  ? gapSvc.price  : (gapAnalysisPrice   || null);
  const implPrice = implSvc ? implSvc.price  : (implementationPrice || null);
  const subPrice  = subSvc  ? subSvc.price   : (annualSubscriptionPrice || null);
  const totalOneTime = (Number(gapPrice) || 0) + (Number(implPrice) || 0);

  const logoImg = (h = 42) => logoDataURI
    ? `<img src="${logoDataURI}" style="height:${h}px;object-fit:contain;display:block;" />`
    : `<div style="font-weight:900;color:#F05A28;font-size:22px;letter-spacing:-1px;">KGRN</div>`;

  const bigLogoImg = () => logoDataURI
    ? `<img src="${logoDataURI}" style="height:88px;object-fit:contain;display:block;margin:0 auto;" />`
    : `<div style="font-weight:900;color:#F05A28;font-size:48px;letter-spacing:-2px;">KGRN</div>`;

  const foot = (n, total = 16) => `
    <div class="footer">
      <div>Page ${n} of ${total}&nbsp;&nbsp;|&nbsp;&nbsp;<span style="color:#F05A28;font-weight:700;">KGRN</span> Amplified&nbsp;&nbsp;|&nbsp;&nbsp;&copy; 2026 KGRN&nbsp;&nbsp;|&nbsp;&nbsp;Confidential</div>
      <div><span style="color:#F05A28;font-weight:700;">KGRN</span> Chartered Accountants LLC&nbsp;&nbsp;|&nbsp;&nbsp;Accredited Service Provider</div>
    </div>`;

  const bullet = (items, style = '') => `
    <ul class="bullet-list" style="${style}">
      ${items.map(i => `<li>${i}</li>`).join('')}
    </ul>`;

  const css = `
    :root {
      --primary: #F05A28;
      --primary-light: #fff3ef;
      --primary-dark: #c94418;
      --navy: #1a3a5c;
      --navy-2: #234b7a;
      --dark: #1e293b;
      --gray: #64748b;
      --light-gray: #f8fafc;
      --border: #e2e8f0;
      --shadow-sm: 0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04);
      --shadow-md: 0 4px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #fff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; }

    .slide {
      width: 1440px; height: 810px;
      background: #fff;
      padding: 36px 56px;
      display: flex; flex-direction: column;
      position: relative; overflow: hidden;
      page-break-after: always; page-break-inside: avoid;
    }
    .slide:last-child { page-break-after: auto; }

    /* ── Text ── */
    .text-primary { color: var(--primary); }
    .text-dark    { color: var(--dark); }
    .text-gray    { color: var(--gray); }
    .text-navy    { color: var(--navy); }
    .font-bold    { font-weight: 700; }
    .text-center  { text-align: center; }

    /* ── Layout ── */
    .flex         { display: flex; }
    .flex-col     { display: flex; flex-direction: column; }
    .flex-1       { flex: 1; min-height: 0; }
    .justify-between { justify-content: space-between; }
    .justify-center  { justify-content: center; }
    .align-center    { align-items: center; }
    .align-start     { align-items: flex-start; }
    .mt-auto      { margin-top: auto; }

    .gap-1 { gap: 8px; }
    .gap-2 { gap: 14px; }
    .gap-3 { gap: 20px; }
    .gap-4 { gap: 26px; }

    .mt-1 { margin-top: 8px; }
    .mt-2 { margin-top: 14px; }
    .mt-3 { margin-top: 20px; }
    .mb-1 { margin-bottom: 8px; }
    .mb-2 { margin-bottom: 14px; }
    .mb-3 { margin-bottom: 20px; }

    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
    .grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
    .grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; }

    /* ── Card ── */
    .card {
      background: #fff; border: 1px solid var(--border);
      border-top: 4px solid var(--primary);
      padding: 18px; border-radius: 8px;
      box-shadow: var(--shadow-sm);
      display: flex; flex-direction: column;
    }
    .card-navy {
      background: linear-gradient(135deg, var(--navy) 0%, var(--navy-2) 100%);
      color: #fff; border: none;
      border-top: 4px solid var(--primary);
    }
    .card-featured {
      border: 2px solid var(--primary);
      border-top: 4px solid var(--primary);
      box-shadow: 0 8px 28px rgba(240,90,40,0.16);
    }

    /* ── Header ── */
    .header {
      display: flex; justify-content: space-between; align-items: flex-start;
      padding-bottom: 14px; margin-bottom: 16px;
      border-bottom: 2px solid var(--border);
      position: relative; flex-shrink: 0;
    }
    .header::after {
      content: ''; position: absolute; bottom: -2px; left: 0;
      width: 64px; height: 2px; background: var(--primary);
    }

    /* ── Footer ── */
    .footer {
      margin-top: auto; padding-top: 10px;
      border-top: 1px solid var(--border);
      display: flex; justify-content: space-between;
      font-size: 10px; color: var(--gray);
      align-items: center; letter-spacing: 0.3px;
      flex-shrink: 0;
    }

    /* ── Content ── */
    .content {
      flex: 1; min-height: 0;
      display: flex; flex-direction: column;
      overflow: hidden;
    }

    /* ── Bullet list ── */
    .bullet-list { list-style: none; padding: 0; margin: 0; }
    .bullet-list li {
      position: relative; padding-left: 15px;
      margin-bottom: 5px; font-size: 13px;
      color: var(--dark); line-height: 1.5;
    }
    .bullet-list li::before {
      content: ''; position: absolute;
      left: 3px; top: 6px;
      width: 6px; height: 6px;
      border-radius: 50%; background: var(--primary);
    }

    /* ── Tag ── */
    .tag {
      background: var(--primary); color: #fff;
      padding: 3px 10px; border-radius: 20px;
      font-size: 10px; font-weight: 700;
      display: inline-block; letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    /* ── Highlight box ── */
    .highlight {
      background: var(--primary-light);
      border-left: 4px solid var(--primary);
      padding: 12px 14px; border-radius: 0 8px 8px 0;
    }

    /* ── Flow ── */
    .flow-container {
      display: flex; align-items: center; justify-content: space-between;
      background: var(--light-gray);
      padding: 16px; border-radius: 10px; border: 1px solid var(--border);
    }
    .flow-step  { display: flex; flex-direction: column; align-items: center; text-align: center; flex: 1; }
    .flow-arrow { font-size: 20px; color: var(--primary); margin: 0 6px; flex-shrink: 0; font-weight: 700; }
    .flow-box {
      background: #fff; border: 2px solid var(--border);
      padding: 12px; border-radius: 8px;
      min-height: 72px; display: flex; flex-direction: column;
      justify-content: center; width: 100%;
      box-shadow: var(--shadow-sm);
    }

    /* ── Phase label ── */
    .phase-label {
      display: inline-flex; align-items: center; gap: 4px;
      background: var(--primary-light); color: var(--primary);
      font-size: 10px; font-weight: 700; padding: 2px 8px;
      border-radius: 20px; letter-spacing: 0.5px;
      text-transform: uppercase; margin-bottom: 5px;
    }

    /* ── Step circle ── */
    .step-num {
      width: 36px; height: 36px; border-radius: 50%;
      background: var(--primary-light); border: 2px solid var(--primary);
      color: var(--primary); font-weight: 800; font-size: 15px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }

    /* ── Cost table ── */
    .cost-table { width: 100%; border-collapse: collapse; border-radius: 8px; overflow: hidden; box-shadow: var(--shadow-sm); }
    .cost-table th, .cost-table td { border: 1px solid var(--border); padding: 8px 12px; text-align: left; font-size: 13px; }
    .cost-table th { background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); color: #fff; font-weight: 600; }
    .cost-table tr:nth-child(even) { background: var(--light-gray); }

    /* ── Cover ── */
    .slide-cover {
      background: linear-gradient(160deg, #ffffff 0%, #fff8f5 60%, #fff3ef 100%);
      justify-content: center; text-align: center;
      padding: 48px 80px;
    }
    .slide-cover::after {
      content: ''; position: absolute; bottom: 0; left: 0; right: 0;
      height: 4px; background: linear-gradient(90deg, var(--primary) 0%, var(--primary-dark) 100%);
    }
  `;

  /* ══════════════════════════════════════════════
     SLIDE 1 — COVER
  ══════════════════════════════════════════════ */
  const slide1 = `
  <section class="slide slide-cover">
    <div style="position:absolute;top:36px;right:56px;font-size:13px;color:var(--gray);">${formatDate(proposalDate)}</div>
    <div class="flex-col align-center justify-center flex-1 gap-3">
      ${bigLogoImg()}
      <div style="margin-top:20px;">
        <h1 style="font-size:50px;font-weight:800;color:var(--dark);margin:0 0 8px;line-height:1.1;letter-spacing:-1.5px;">
          UAE eInvoicing Compliance<br><span style="color:var(--primary);">&amp; Implementation</span>
        </h1>
        <h2 style="font-size:22px;font-weight:400;color:var(--gray);margin:0;letter-spacing:-0.3px;">Advisory and Managed Services Proposal</h2>
      </div>
      <div style="background:#fff;border:1px solid var(--border);border-top:4px solid var(--primary);border-radius:10px;padding:18px 44px;box-shadow:var(--shadow-md);max-width:640px;width:100%;">
        <div style="font-size:17px;font-weight:700;color:var(--dark);">
          <span style="color:var(--primary);">End-to-End Compliance</span>&nbsp;&nbsp;|&nbsp;&nbsp;<span style="color:var(--primary);">Implementation</span>&nbsp;&nbsp;|&nbsp;&nbsp;<span style="color:var(--primary);">Managed Services</span>
        </div>
      </div>
      <div style="margin-top:6px;">
        <div style="font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--gray);margin-bottom:5px;">Prepared for</div>
        <div style="font-size:28px;font-weight:800;color:var(--primary);letter-spacing:-0.5px;">${clientName}</div>
        ${entityGroupName ? `<div style="font-size:17px;color:var(--dark);margin-top:3px;">${entityGroupName}</div>` : ''}
      </div>
      <p style="font-size:14px;color:var(--gray);max-width:580px;margin:4px auto 0;line-height:1.7;font-style:italic;">
        Tailored advisory and implementation approach aligned to your business model and ERP landscape
      </p>
    </div>
  </section>`;

  /* ══════════════════════════════════════════════
     SLIDE 2 — ACTIVE PROPOSAL (icons kept)
  ══════════════════════════════════════════════ */
  const slide2 = `
  <section class="slide">
    <div class="header">
      <div>
        <h2 style="font-size:38px;font-weight:800;color:var(--dark);letter-spacing:-1px;">Active Proposal</h2>
      </div>
      ${logoImg()}
    </div>
    <div class="content">
      <div class="grid-3 mb-2">
        <div class="card align-start">
          <div style="font-size:30px;margin-bottom:8px;">1</div>
          <div style="font-size:18px;font-weight:700;color:var(--primary);margin-bottom:4px;">Compliance</div>
          <div style="font-size:14px;color:var(--dark);">Regulatory alignment</div>
        </div>
        <div class="card align-start">
          <div style="font-size:30px;margin-bottom:8px;">2</div>
          <div style="font-size:18px;font-weight:700;color:var(--primary);margin-bottom:4px;">Implementation</div>
          <div style="font-size:14px;color:var(--dark);">System integration</div>
        </div>
        <div class="card align-start">
          <div style="font-size:30px;margin-bottom:8px;">3</div>
          <div style="font-size:18px;font-weight:700;color:var(--primary);margin-bottom:4px;">Automation</div>
          <div style="font-size:14px;color:var(--dark);">Process optimization</div>
        </div>
      </div>
      <div class="grid-2 mt-1">
        <div class="highlight">
          <div style="font-size:20px;font-weight:700;color:var(--primary);margin-bottom:6px;">Accredited Service Provider</div>
          <div style="font-size:16px;color:var(--dark);">Certified Peppol Access Point</div>
        </div>
        <div class="card">
          <div style="font-size:17px;font-weight:700;color:var(--dark);margin-bottom:10px;">Key Benefits</div>
          ${bullet(['Full compliance with UAE regulations','Seamless ERP integration','24/7 support and monitoring','Automated reporting'])}
        </div>
      </div>
    </div>
    ${foot(2)}
  </section>`;

  /* ══════════════════════════════════════════════
     SLIDE 3 — EXECUTIVE SUMMARY
  ══════════════════════════════════════════════ */
  const slide3 = `
  <section class="slide">
    <div class="header">
      <div>
        <div style="font-size:10px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--gray);margin-bottom:3px;">KGRN Consulting | UAE eInvoicing Readiness Assessment</div>
        <h2 style="margin:0;font-size:30px;font-weight:800;color:var(--primary);letter-spacing:-0.5px;">Executive Summary — UAE eInvoicing Readiness</h2>
        <div style="font-size:13px;color:var(--dark);margin-top:3px;">Strategic assessment and implementation roadmap</div>
      </div>
      <div class="tag" style="font-size:12px;padding:6px 16px;border-radius:6px;align-self:flex-start;margin-top:2px;">URGENT</div>
    </div>
    <div class="content">
      <div class="grid-2" style="flex:1;gap:16px;">
        <div class="card">
          <h3 style="font-size:17px;font-weight:700;color:var(--primary);margin:0 0 5px;">Regulatory Mandate &amp; Business Impact</h3>
          <div style="font-size:11px;color:var(--gray);margin-bottom:8px;">FTA compliance requirements and penalties</div>
          ${bullet(['<strong>FTA mandate:</strong> PINT AE XML format required','<strong>Deadline:</strong> January 2027','<strong>Penalties:</strong> AED 2,500–10,000 per violation','<strong>Impact:</strong> VAT blockage and invoice rejection'])}
          <div class="highlight mt-2" style="padding:8px 12px;margin-top:10px;font-size:12px;">Direct impact on cash flow and operations</div>
        </div>
        <div class="card">
          <h3 style="font-size:17px;font-weight:700;color:var(--primary);margin:0 0 5px;">Current Challenge &amp; KGRN Solution</h3>
          <div style="font-size:11px;color:var(--gray);margin-bottom:8px;">Gap analysis and solution framework</div>
          <div style="font-size:12px;font-weight:600;color:var(--dark);margin-bottom:4px;">Challenges:</div>
          <div style="font-size:12px;color:var(--gray);margin-bottom:10px;">Non-structured ERP &nbsp;&#183;&nbsp; No real-time validation &nbsp;&#183;&nbsp; Manual processes</div>
          <div class="grid-2" style="gap:8px;font-size:12px;">
            <div style="display:flex;align-items:center;gap:5px;"><span style="font-weight:700;color:var(--primary);">&#8594;</span> XML conversion</div>
            <div style="display:flex;align-items:center;gap:5px;"><span style="font-weight:700;color:var(--primary);">&#8594;</span> Real-time validation</div>
            <div style="display:flex;align-items:center;gap:5px;"><span style="font-weight:700;color:var(--primary);">&#8594;</span> Peppol submission</div>
            <div style="display:flex;align-items:center;gap:5px;"><span style="font-weight:700;color:var(--primary);">&#8594;</span> Monitoring</div>
          </div>
          <div style="font-size:12px;font-weight:700;color:var(--primary);margin-top:10px;">KGRN manages full compliance lifecycle</div>
        </div>
        <div class="card">
          <h3 style="font-size:17px;font-weight:700;color:var(--primary);margin:0 0 5px;">Implementation &amp; Investment</h3>
          <div style="font-size:11px;color:var(--gray);margin-bottom:6px;">4-phase rollout plan</div>
          <div style="font-size:12px;color:var(--gray);margin-bottom:8px;">Timeline: 4–6 weeks | 4-phase implementation</div>
          <table class="cost-table" style="margin-top:0;">
            <tr><th>Service</th><th>Investment</th></tr>
            ${selectedServices.length > 0
              ? selectedServices.map(s => `<tr><td>${s.name}</td><td>${fc(s.price)}</td></tr>`).join('')
              : `<tr><td>Gap Analysis</td><td>${fc(gapPrice)}</td></tr>
                 <tr><td>Implementation</td><td>${fc(implPrice)}</td></tr>
                 <tr><td>Annual Subscription</td><td>${fc(subPrice)}</td></tr>`}
          </table>
        </div>
        <div class="card">
          <h3 style="font-size:17px;font-weight:700;color:var(--primary);margin:0 0 5px;">Recommendation</h3>
          <div style="font-size:11px;color:var(--gray);margin-bottom:8px;">Strategic action plan</div>
          <div class="highlight" style="margin-top:6px;">
            <div style="font-size:16px;font-weight:700;color:var(--primary);">Initiate within 2–3 weeks</div>
            <div style="font-size:12px;color:var(--dark);margin-top:3px;">to ensure readiness for January 2027 deadline</div>
          </div>
          <div style="font-size:12px;color:var(--gray);margin-top:10px;">Early implementation reduces risk of penalties</div>
          <div style="font-size:12px;font-weight:700;color:var(--primary);margin-top:7px;">Ready for implementation</div>
        </div>
      </div>
    </div>
    ${foot(3)}
  </section>`;

  /* ══════════════════════════════════════════════
     SLIDE 4 — WHAT THIS MEANS FOR CLIENT
  ══════════════════════════════════════════════ */
  const slide4 = `
  <section class="slide">
    <div class="header">
      <div>
        <h2 style="margin:0;font-size:30px;font-weight:800;color:var(--primary);letter-spacing:-0.5px;">What This Means for ${clientName}</h2>
        <div style="font-size:13px;color:var(--dark);margin-top:3px;">Strategic analysis of eInvoicing implications and operational impact</div>
      </div>
      <div class="tag" style="font-size:10px;padding:5px 12px;border-radius:6px;align-self:flex-start;background:var(--primary-light);color:var(--primary);border:1.5px solid var(--primary);">Priority: HIGH</div>
    </div>
    <div class="content">
      <div class="grid-2" style="flex:1;gap:16px;">
        <div class="flex-col gap-2">
          <div class="card flex-1">
            <h3 style="font-size:17px;font-weight:700;color:var(--primary);margin:0 0 5px;">Business Context</h3>
            <div style="font-size:11px;color:var(--gray);margin-bottom:8px;">Current operational setup — ${entityGroupName || clientName}</div>
            ${bullet([
              `<strong>Industry:</strong> ${industry || 'N/A'}`,
              `<strong>Revenue Model:</strong> ${revenueModel || 'N/A'}`,
              `<strong>Customer Base:</strong> ${customerBase || 'N/A'}`,
              `<strong>ERP System:</strong> ${erpSystem || 'N/A'}`,
              `<strong>Transaction:</strong> ${transaction || 'N/A'}`
            ])}
          </div>
          <div class="card" style="color:#fff;border-top-color:var(--primary);">
            <div style="font-size:14px;color:#000;line-height:1.6;">For <strong style="color:var(--primary);">${industry || clientName}</strong>, invoice accuracy and compliance directly impact cash flow, operational efficiency, and regulatory alignment.</div>
          </div>
        </div>
        <div class="flex-col gap-2">
          <div class="card">
            <h3 style="font-size:17px;font-weight:700;color:var(--primary);margin:0 0 5px;">Current Operational Realities</h3>
            <div style="font-size:11px;color:var(--gray);margin-bottom:8px;">Existing pain points</div>
            ${bullet(['Invoices generated in non-structured formats','Limited real-time compliance validation','Manual review and corrections','Disconnect between ERP data and regulatory requirements'])}
          </div>
          <div class="card">
            <h3 style="font-size:17px;font-weight:700;color:var(--primary);margin:0 0 5px;">Key Challenges &amp; Business Impact</h3>
            <div style="font-size:11px;color:var(--gray);margin-bottom:8px;">Critical compliance requirements &amp; financial implications</div>
            ${bullet(['Conversion to PINT AE XML required','Mandatory validation before FTA submission','Risk of invoice rejection and impact on cash flow','Operational inefficiencies due to manual processes','Increased compliance costs and resource allocation'])}
          </div>
        </div>
      </div>
    </div>
    ${foot(4)}
  </section>`;

  /* ══════════════════════════════════════════════
     SLIDE 5 — HOW eINVOICING WORKS
  ══════════════════════════════════════════════ */
  const slide5 = `
  <section class="slide">
    <div class="header">
      <div>
        <h2 style="margin:0;font-size:28px;font-weight:800;color:var(--primary);letter-spacing:-0.5px;">How eInvoicing Works — End-to-End Flow</h2>
        <div style="font-size:13px;color:var(--dark);margin-top:3px;">Seamless integration from ERP to FTA with KGRN's ASP platform</div>
      </div>
      ${logoImg()}
    </div>
    <div class="content">
      <div class="flow-container mb-2">
        ${[
          {t:'ERP System',      s:'Odoo / NetSuite / SAP / Others',      accent:false},
          {t:'KGRN Integration',s:'API / File Upload · Real-time sync',   accent:false},
          {t:'KGRN ASP Platform',s:'XML Conversion + Validation',          accent:true},
          {t:'Peppol Network',  s:'Secure Exchange · Global standard',    accent:false},
          {t:'FTA &amp; Buyer', s:'Final Validation &amp; Delivery',       accent:false}
        ].map((b,i,arr) => `
          <div class="flow-step">
            <div class="flow-box" style="${b.accent ? 'border:2px solid var(--primary);background:var(--primary-light);' : ''}">
              <div style="font-size:13px;font-weight:700;color:${b.accent ? 'var(--primary)' : 'var(--dark)'};">${b.t}</div>
              <div style="font-size:11px;color:var(--gray);margin-top:4px;">${b.s}</div>
            </div>
          </div>${i < arr.length-1 ? '<div class="flow-arrow">&rarr;</div>' : ''}`).join('')}
      </div>
      <div class="grid-3 mb-2">
        ${[
          {n:'1',t:'ERP Layer',      items:['Invoice created in ERP','No workflow change','Compatible with existing systems','Automated data extraction']},
          {n:'2',t:'KGRN Layer',     items:['XML conversion (PINT AE)','Real-time validation','Error detection','Data enrichment']},
          {n:'3',t:'Submission &amp; Exchange',items:['FTA validation','Peppol transmission','Status tracking','Delivery confirmation']}
        ].map(({n,t,items}) => `
          <div class="card">
            <div style="font-size:24px;font-weight:900;color:var(--primary);margin-bottom:5px;">${n}</div>
            <div style="font-size:15px;font-weight:700;color:var(--dark);margin-bottom:7px;">${t}</div>
            ${bullet(items,'font-size:12px;')}
          </div>`).join('')}
      </div>
      <div class="highlight flex justify-between align-center" style="border-radius:0 10px 10px 0;">
        <div>
          <div style="font-size:15px;font-weight:700;color:var(--primary);margin-bottom:3px;">No change to your existing invoicing process</div>
          <div style="font-size:13px;color:var(--dark);">KGRN manages the entire compliance lifecycle in the background</div>
        </div>
        <div style="font-size:12px;color:var(--gray);text-align:right;line-height:2;">
          <div>No direct FTA integration required</div>
          <div>No manual XML handling</div>
          <div>No disruption to operations</div>
        </div>
      </div>
    </div>
    ${foot(5)}
  </section>`;

  /* ══════════════════════════════════════════════
     SLIDE 6 — IMPLEMENTATION APPROACH
  ══════════════════════════════════════════════ */
  const slide6 = `
  <section class="slide">
    <div class="header">
      <div>
        <h2 style="margin:0;font-size:26px;font-weight:800;color:var(--primary);letter-spacing:-0.5px;">Structured Implementation Approach — Clear, Phased, and Low Disruption</h2>
        <div style="font-size:13px;color:var(--dark);margin-top:3px;">A systematic 4-phase methodology for seamless integration</div>
      </div>
      ${logoImg()}
    </div>
    <div class="content">
      <div class="highlight mb-2 flex justify-between align-center" style="border-radius:0 10px 10px 0;padding:10px 16px;">
        <div style="font-size:17px;font-weight:700;color:var(--primary);">Implementation Timeline</div>
        <div style="font-size:15px;font-weight:600;color:var(--dark);">Total Duration: 4–6 Weeks</div>
      </div>
      <div class="grid-4" style="flex:1;align-items:stretch;">
        ${[
          {ph:'Phase 1',wk:'Week 1–2', t:'Gap Assessment',       items:['Review invoicing processes','Master data validation','Compliance gap identification','Implementation roadmap']},
          {ph:'Phase 2',wk:'Week 2–4', t:'Setup &amp; Integration',items:['Platform configuration','ERP integration (API/File)','Data mapping to XML','Structure validation']},
          {ph:'Phase 3',wk:'Week 4–6', t:'Testing &amp; Validation',items:['End-to-end testing','FTA validation','Error workflows','User acceptance testing']},
          {ph:'Phase 4',wk:'Ongoing',  t:'Go-Live &amp; Support', items:['Live processing','Real-time monitoring','Compliance updates','SLA-based support']}
        ].map(({ph,wk,t,items}) => `
          <div class="card">
            <div class="phase-label">${ph}</div>
            <div style="font-size:10px;font-weight:600;color:var(--gray);margin-bottom:5px;">${wk}</div>
            <div style="font-size:14px;font-weight:700;color:var(--dark);margin-bottom:8px;">${t}</div>
            ${bullet(items,'font-size:11px;')}
          </div>`).join('')}
      </div>
      <div class="card mt-2" style="padding:14px;">
        <div style="font-size:15px;font-weight:700;color:var(--primary);margin-bottom:8px;">What This Means for Your Team</div>
        <div class="grid-3" style="font-size:12px;color:#000;">
          <div>No operational disruption</div><div>Minimal IT dependency</div>
          <div>KGRN manages all phases</div><div>Structured onboarding</div>
          <div>Fast implementation</div><div>24/7 support</div>
        </div>
      </div>
      <div style="background:linear-gradient(135deg,var(--primary) 0%,var(--primary-dark) 100%);color:#fff;font-size:14px;font-weight:600;text-align:center;padding:11px;border-radius:8px;margin-top:10px;">
        "The implementation is predictable, structured, and minimally disruptive"
      </div>
    </div>
    ${foot(6)}
  </section>`;

  /* ══════════════════════════════════════════════
     SLIDE 7 — ROLES & RESPONSIBILITIES
  ══════════════════════════════════════════════ */
  const slide7 = `
  <section class="slide">
    <div class="header">
      <div>
        <h2 style="margin:0;font-size:26px;font-weight:800;color:var(--primary);letter-spacing:-0.5px;">Roles &amp; Responsibilities — Clear Ownership Across the eInvoicing Lifecycle</h2>
        <div style="font-size:13px;color:var(--dark);margin-top:3px;">Implementation Status: Ready</div>
      </div>
    </div>
    <div class="content">
      <div class="grid-3" style="flex:1;gap:16px;">
        <div class="card" style="border-top-color:var(--primary);">
          <div style="font-size:17px;font-weight:700;color:var(--primary);margin-bottom:5px;">Client (Business / Finance Team)</div>
          <div style="font-size:14px;font-weight:600;color:var(--dark);margin-bottom:6px;">Invoice Creation &amp; Data Ownership</div>
          <div class="tag mb-2" style="margin-bottom:10px;">Active Role</div>
          ${bullet(['Raise invoices in ERP system with accurate data','Maintain data accuracy for all invoice fields','Review exceptions flagged by the system','Approve corrections when required'],'font-size:12px;')}
          <div class="highlight mt-auto" style="padding:8px 12px;font-size:11px;margin-top:12px;">Core business function</div>
        </div>
        <div class="card" style="border-top-color:var(--navy);">
          <div style="font-size:17px;font-weight:700;color:var(--navy);margin-bottom:5px;">KGRN</div>
          <div style="font-size:14px;font-weight:600;color:var(--dark);margin-bottom:6px;">End-to-End Compliance Management</div>
          <div class="tag mb-2" style="background:var(--navy);margin-bottom:10px;">Managed Service</div>
          ${bullet(['XML conversion (PINT AE format)','Real-time validation and FTA submission','Peppol transmission and lifecycle monitoring','Error handling and resubmission','Dashboards and reporting for visibility','Continuous compliance updates'],'font-size:12px;')}
        </div>
        <div class="card" style="border-top-color:var(--gray);">
          <div style="font-size:17px;font-weight:700;color:var(--gray);margin-bottom:5px;">Technology Platform</div>
          <div style="font-size:14px;font-weight:600;color:var(--dark);margin-bottom:6px;">Infrastructure Layer</div>
          <div class="tag mb-2" style="background:var(--gray);margin-bottom:10px;">Platform</div>
          ${bullet(['Infrastructure support for 24/7 uptime','API enablement for system integration','Scalability and performance optimization','Secure transmission and data protection'],'font-size:12px;')}
        </div>
      </div>
      <div class="highlight mt-2" style="border-radius:0 10px 10px 0;">
        <h3 style="font-size:15px;font-weight:700;color:var(--primary);margin:0 0 7px;">Practical Interpretation</h3>
        <div class="grid-3" style="font-size:12px;color:var(--dark);">
          <div>No XML handling required</div>
          <div>No FTA interaction required</div>
          <div>Client role remains unchanged</div>
        </div>
      </div>
      <div class="card mt-2" style="padding:14px;">
        <h3 style="font-size:15px;font-weight:700;color:var(--primary);margin:0 0 10px;">Error Handling Flow</h3>
        <div style="display:flex;justify-content:space-between;align-items:center;text-align:center;font-size:12px;font-weight:600;color:var(--dark);">
          <div>1. KGRN identifies issue</div>
          <div style="font-size:22px;color:var(--primary);font-weight:700;">&rarr;</div>
          <div>2. Client updates data</div>
          <div style="font-size:22px;color:var(--primary);font-weight:700;">&rarr;</div>
          <div>3. KGRN resubmits</div>
        </div>
      </div>
    </div>
    ${foot(7)}
  </section>`;

  /* ══════════════════════════════════════════════
     SLIDE 8 — COMMERCIAL MODEL
  ══════════════════════════════════════════════ */
  const slide8 = `
  <section class="slide">
    <div class="header">
      <div>
        <h2 style="margin:0;font-size:28px;font-weight:800;color:var(--primary);letter-spacing:-0.5px;">Commercial Model — Transparent, Predictable, and Scalable</h2>
        <div style="font-size:13px;color:var(--dark);margin-top:3px;">Enterprise compliance solution with clear pricing structure for ${clientName}</div>
      </div>
      ${logoImg()}
    </div>
    <div class="content">
      <div class="grid-3 mb-2" style="flex:1;gap:20px;align-items:stretch;">
        <div class="card text-center" style="align-items:center;border-top-color:var(--primary);">
          <h3 style="font-size:18px;font-weight:700;color:var(--primary);margin:0 0 3px;">One-Time Fees</h3>
          <div style="font-size:11px;color:var(--gray);margin-bottom:8px;">Implementation &amp; Setup</div>
          <div style="font-size:34px;font-weight:900;color:var(--dark);margin:8px 0;letter-spacing:-1.5px;">${totalOneTime > 0 ? fc(totalOneTime) : fc(null)}</div>
          <div style="font-size:11px;color:var(--gray);margin-bottom:12px;">Gap Assessment + Implementation</div>
          <div class="highlight text-left" style="width:100%;font-size:11px;border-radius:0 8px 8px 0;">
            <div style="font-weight:600;margin-bottom:3px;">Gap Assessment — ${fc(gapPrice)}</div>
            <div style="font-size:10px;color:var(--gray);margin-bottom:8px;">Readiness assessment, compliance gap analysis, implementation roadmap</div>
            <div style="font-weight:600;margin-bottom:3px;">Implementation — ${fc(implPrice)}</div>
            <div style="font-size:10px;color:var(--gray);">Platform setup, ERP integration, data mapping, testing and onboarding</div>
          </div>
        </div>
        <div class="card card-featured text-center" style="align-items:center;">
          <div class="tag mb-2" style="align-self:center;margin-bottom:6px;">Most Popular</div>
          <h3 style="font-size:18px;font-weight:700;color:var(--dark);margin:0 0 3px;">Annual Subscription</h3>
          <div style="font-size:11px;color:var(--gray);margin-bottom:8px;">Managed Services Model</div>
          <div style="font-size:34px;font-weight:900;color:var(--primary);margin:8px 0;letter-spacing:-1.5px;">${fc(subPrice)} <span style="font-size:13px;font-weight:400;color:var(--gray);">/ year</span></div>
          <div style="font-size:11px;color:var(--dark);margin-bottom:10px;">Fully managed compliance service</div>
          ${bullet(['Platform access','XML generation and validation','FTA submission and reporting','Compliance monitoring','Error handling and resubmission','Dashboard and reporting','SLA-based support'],'text-align:left;width:100%;font-size:11px;')}
          <div style="font-size:10px;font-weight:700;color:var(--primary);margin-top:8px;">Fully managed — not just a software subscription</div>
        </div>
        <div class="card text-center" style="align-items:center;border-top-color:var(--gray);">
          <h3 style="font-size:18px;font-weight:700;color:var(--gray);margin:0 0 3px;">Overage</h3>
          <div style="font-size:11px;color:var(--gray);margin-bottom:8px;">Pay-as-you-grow</div>
          <div style="font-size:34px;font-weight:900;color:var(--dark);margin:8px 0;letter-spacing:-1.5px;">${fc(overagePrice)}</div>
          <div style="font-size:11px;color:var(--gray);margin-bottom:12px;">Per 1,000 invoices</div>
          ${bullet(['Scalable model','Pay only for what you use','No minimum commitment','Flexible pricing structure'],'text-align:left;width:100%;font-size:11px;')}
        </div>
      </div>
      <div class="card" style="padding:14px;">
        <h3 style="font-size:15px;font-weight:700;color:var(--primary);margin:0 0 8px;">Key Commercial Principles</h3>
        <div class="grid-4" style="font-size:12px;color:#000;">
          <div>No hidden costs</div><div>Enterprise-wide coverage</div>
          <div>Predictable pricing</div><div>Scalable structure</div>
        </div>
      </div>
    </div>
    ${foot(8)}
  </section>`;

  /* ══════════════════════════════════════════════
     SLIDE 9 — DAY-TO-DAY PROCESSING
  ══════════════════════════════════════════════ */
  const slide9 = `
  <section class="slide">
    <div class="header">
      <div>
        <h2 style="margin:0;font-size:26px;font-weight:800;color:var(--primary);letter-spacing:-0.5px;">Day-to-Day Invoice Processing — Simple, Structured, and Automated</h2>
        <div style="font-size:13px;color:var(--dark);margin-top:3px;">No change to your existing day-to-day invoicing process</div>
      </div>
    </div>
    <div class="content">
      <div style="font-size:17px;font-weight:700;color:var(--primary);margin-bottom:12px;">5-Step Automated Workflow</div>
      <div style="display:flex;align-items:stretch;margin-bottom:16px;gap:0;">
        ${[
          {n:'Step 1',t:'Invoice Creation',    d:'Created in ERP',        s:'No process change'},
          {n:'Step 2',t:'Submission to KGRN',  d:'API (real-time)',        s:'File upload (Excel/CSV)'},
          {n:'Step 3',t:'Processing by KGRN',  d:'XML conversion (PINT AE)',s:'FTA validation',highlight:true},
          {n:'Step 4',t:'Submission',           d:'FTA validation',         s:'Peppol transmission'},
          {n:'Step 5',t:'Status &amp; Reporting',d:'Dashboard updates',    s:'Tracking and reporting'}
        ].map(({n,t,d,s,highlight},i,arr) => `
          <div class="card" style="flex:1;text-align:center;border-radius:${i===0?'8px 0 0 8px':i===arr.length-1?'0 8px 8px 0':'0'};${i>0?'border-left:none;':''}${i<arr.length-1?'border-right:none;':''}${highlight?'border-color:var(--primary);border-top-color:var(--primary);':''};margin:0;padding:14px;">
            <div style="font-size:18px;font-weight:700;color:var(--primary);margin-bottom:4px;">${n}</div>
            <div style="font-size:13px;font-weight:700;color:var(--dark);margin-bottom:5px;">${t}</div>
            <div style="font-size:11px;color:var(--gray);">${d}<br>${s}</div>
          </div>
          ${i < arr.length-1 ? '<div style="align-self:center;background:var(--light-gray);padding:8px 2px;font-size:16px;font-weight:700;color:var(--primary);border-top:1px solid var(--border);border-bottom:1px solid var(--border);">&rarr;</div>' : ''}`).join('')}
      </div>
      <div class="grid-2 gap-3">
        <div class="highlight" style="border-radius:0 10px 10px 0;">
          <h3 style="font-size:15px;font-weight:700;color:var(--primary);margin:0 0 10px;">Exception Handling</h3>
          <div class="flex-col gap-2">
            <div class="flex align-center gap-2"><div class="step-num">1</div><div style="font-size:13px;font-weight:600;color:var(--dark);">KGRN identifies issue</div></div>
            <div class="flex align-center gap-2"><div class="step-num">2</div><div style="font-size:13px;font-weight:600;color:var(--dark);">Client updates data (if required)</div></div>
            <div class="flex align-center gap-2"><div class="step-num">3</div><div style="font-size:13px;font-weight:600;color:var(--dark);">KGRN resubmits</div></div>
          </div>
        </div>
        <div class="card">
          <h3 style="font-size:15px;font-weight:700;color:var(--dark);margin:0 0 10px;">Key Operational Benefits</h3>
          ${bullet(['No XML handling','No FTA interaction','Reduced rejection risk','Full visibility'],'font-size:13px;')}
        </div>
      </div>
      <div style="text-align:center;margin-top:14px;">
        <div style="font-size:15px;font-weight:700;color:var(--primary);">KGRN manages compliance, validation, and reporting seamlessly in the background</div>
        <div style="font-size:12px;color:var(--dark);margin-top:3px;">Your team focuses on core business activities while we handle the technical complexities</div>
        <div style="display:flex;justify-content:center;gap:28px;margin-top:8px;font-size:12px;font-weight:600;color:var(--gray);">
          <div>99.9% Uptime</div><div>|</div><div>24/7 Support</div>
        </div>
      </div>
    </div>
    ${foot(9)}
  </section>`;

  /* ══════════════════════════════════════════════
     SLIDE 10 — CROSS-BORDER TRANSACTIONS
  ══════════════════════════════════════════════ */
  const slide10 = `
  <section class="slide">
    <div class="header">
      <div>
        <h2 style="margin:0;font-size:30px;font-weight:800;color:var(--primary);letter-spacing:-0.5px;">Cross-Border Transactions — How eInvoicing Applies</h2>
        <div style="font-size:13px;color:var(--dark);margin-top:3px;">Understanding compliance requirements for international invoicing</div>
      </div>
    </div>
    <div class="content">
      <div class="grid-2 gap-3" style="flex:1;">
        ${[
          {n:'1',t:'Business Scenario',   tc:'var(--primary)', bc:'var(--primary)', items:['Cross-border customers/suppliers','International transactions','Multi-currency invoicing'], note:'Buyers may not always be part of the Peppol network'},
          {n:'2',t:'What Remains Mandatory',tc:'var(--navy)',  bc:'var(--navy)',    items:['XML format (PINT AE)','FTA validation required','Compliance checks mandatory','Proper classification (B2B/B2C, Domestic/Export)'], note:null},
          {n:'3',t:'How KGRN Handles This',tc:'var(--primary)',bc:'var(--primary)',items:['XML generation and validation','FTA submission','Classification and reporting','Audit trail'], note:'Where Peppol is not applicable, invoices can be delivered via standard channels'},
          {n:'4',t:'Flexibility',         tc:'var(--gray)',    bc:'var(--gray)',    items:['Receiving module optional','Configurable solution','Scalable for future','No full reimplementation required'], note:null}
        ].map(({n,t,tc,bc,items,note}) => `
          <div class="card" style="border-top-color:${bc};">
            <div class="flex align-center justify-between mb-2" style="margin-bottom:8px;">
              <h3 style="font-size:17px;font-weight:700;color:${tc};margin:0;">${t}</h3>
              <div style="font-size:34px;font-weight:900;color:#e8ecf0;line-height:1;">${n}</div>
            </div>
            ${bullet(items,'font-size:13px;margin-bottom:10px;')}
            ${note ? `<div class="highlight mt-auto" style="padding:8px 12px;font-size:11px;margin-top:auto;border-left-color:${bc};">${note}</div>` : ''}
          </div>`).join('')}
      </div>
      <div style="background:linear-gradient(135deg,var(--primary) 0%,var(--primary-dark) 100%);color:#fff;text-align:center;margin-top:18px;padding:16px;border-radius:10px;">
        <div style="font-size:18px;font-weight:800;margin-bottom:4px;">Compliance remains mandatory</div>
        <div style="font-size:13px;opacity:0.9;">KGRN ensures seamless handling without operational complexity</div>
      </div>
    </div>
    ${foot(10)}
  </section>`;

  /* ══════════════════════════════════════════════
     SLIDE 11 — ERP FLEXIBILITY
  ══════════════════════════════════════════════ */
  const displayErp = erpNames && erpNames.length > 0 ? erpNames : ['Odoo','Oracle NetSuite','SAP S/4HANA','Microsoft Dynamics 365','Sage','QuickBooks','Xero','Zoho Books','Epicor','Infor','JD Edwards','Workday','Acumatica','SYSPRO','Priority ERP'];
  const slide11 = `
  <section class="slide">
    <div class="header">
      <div>
        <h2 style="margin:0;font-size:26px;font-weight:800;color:var(--primary);letter-spacing:-0.5px;">ERP Flexibility — Designed to Integrate with Your Current and Future Systems</h2>
        <div style="font-size:13px;color:var(--dark);margin-top:3px;">Technology-agnostic integration approach for seamless business operations</div>
      </div>
    </div>
    <div class="content">
      <div class="grid-2 gap-3" style="flex:1;">
        <div class="flex-col gap-2">
          <div class="card flex-1">
            <h3 style="font-size:17px;font-weight:700;color:var(--primary);margin:0 0 4px;">Supported ERP Ecosystem</h3>
            <div style="font-size:12px;color:var(--dark);margin-bottom:12px;">Technology-agnostic integration approach</div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;">
              ${displayErp.map(name => `
                <div style="padding:7px 6px;background:var(--light-gray);border-radius:6px;border:1px solid var(--border);text-align:center;font-size:11px;font-weight:600;color:var(--dark);">
                  ${name}
                </div>`).join('')}
            </div>
          </div>
          <div class="card">
            <h3 style="font-size:17px;font-weight:700;color:var(--primary);margin:0 0 4px;">Handling ERP Changes</h3>
            <div style="font-size:12px;color:var(--dark);margin-bottom:8px;">Seamless transition support</div>
            ${bullet(['No full reimplementation required','Minor adjustments (data mapping)','KGRN supports transition'],'font-size:12px;')}
          </div>
        </div>
        <div class="flex-col gap-2">
          <div class="card">
            <h3 style="font-size:17px;font-weight:700;color:var(--primary);margin:0 0 4px;">Integration Methods</h3>
            <div style="font-size:12px;color:var(--dark);margin-bottom:12px;">Flexible deployment options</div>
            <div class="highlight mb-2" style="border-radius:0 8px 8px 0;margin-bottom:8px;">
              <div style="font-size:15px;font-weight:700;color:var(--primary);margin-bottom:4px;">API-Based</div>
              ${bullet(['Real-time processing','Automated workflows','Minimal manual effort'],'font-size:12px;')}
            </div>
            <div class="highlight" style="background:#f4f4f4;border-left-color:var(--navy);border-radius:0 8px 8px 0;">
              <div style="font-size:15px;font-weight:700;color:var(--navy);margin-bottom:4px;">File-Based</div>
              ${bullet(['Excel / CSV upload','Quick deployment','Simple onboarding'],'font-size:12px;')}
            </div>
          </div>
          <div class="card">
            <h3 style="font-size:15px;font-weight:700;color:var(--primary);margin:0 0 5px;">Key Takeaways</h3>
            <div class="grid-2" style="font-size:12px;color:#000;">
              <div>No ERP dependency</div><div>Scalable architecture</div>
              <div>Future-proof design</div><div>Continuous compliance</div>
            </div>
          </div>
          <div class="grid-2 text-center" style="gap:10px;">
            ${[{v:'98%',l:'Success Rate'},{v:'99.9%',l:'Uptime'},{v:'15+',l:'ERP Systems'},{v:'24/7',l:'Support'}].map(({v,l}) => `
              <div style="padding:12px;background:var(--primary-light);border-radius:8px;">
                <div style="font-size:22px;font-weight:900;color:var(--primary);letter-spacing:-1px;">${v}</div>
                <div style="font-size:11px;font-weight:600;color:var(--dark);">${l}</div>
              </div>`).join('')}
          </div>
        </div>
      </div>
    </div>
    ${foot(11)}
  </section>`;

  /* ══════════════════════════════════════════════
     SLIDE 12 — COMPLIANCE ASSURANCE
  ══════════════════════════════════════════════ */
  const slide12 = `
  <section class="slide">
    <div class="header">
      <div>
        <h2 style="margin:0;font-size:26px;font-weight:800;color:var(--primary);letter-spacing:-0.5px;">Compliance Assurance — Governance, Control, and Continuous Monitoring</h2>
        <div style="font-size:13px;color:var(--dark);margin-top:3px;">Comprehensive compliance framework for regulatory adherence and risk mitigation</div>
      </div>
    </div>
    <div class="content">
      <div class="grid-2 gap-3" style="flex:1;">
        <div class="flex-col gap-2">
          <div class="card">
            <h3 style="font-size:17px;font-weight:700;color:var(--primary);margin:0 0 8px;">Regulatory Assurance</h3>
            ${bullet(['Accredited Service Provider (FTA)','Certified Peppol Access Point','Fully compliant invoices','Pre-submission validation'],'font-size:13px;')}
          </div>
          <div class="card">
            <h3 style="font-size:17px;font-weight:700;color:var(--primary);margin:0 0 8px;">Ongoing Compliance Management</h3>
            ${bullet(['Monitoring FTA updates','Schema and rule changes','Automatic platform updates'],'font-size:13px;margin-bottom:10px;')}
            <div class="highlight" style="padding:8px 12px;font-size:11px;margin-top:auto;font-style:italic;">"Compliance requires continuous monitoring and adaptation"</div>
          </div>
        </div>
        <div class="flex-col gap-2">
          <div class="card">
            <h3 style="font-size:17px;font-weight:700;color:var(--primary);margin:0 0 8px;">Risk Mitigation Framework</h3>
            ${bullet(['Pre-validation reduces rejection','Error handling workflows','Full audit trail','SLA-based monitoring'],'font-size:13px;')}
          </div>
          <div class="card">
            <h3 style="font-size:15px;font-weight:700;color:var(--primary);margin:0 0 8px;">Governance Model</h3>
            ${bullet(['Client: Data ownership','KGRN: Compliance and operations','Platform: Infrastructure','Dashboard: Reporting'],'color:#000;font-size:13px;')}
          </div>
        </div>
      </div>
      <div style="text-align:center;margin-top:18px;border-top:1px solid var(--border);padding-top:14px;">
        <div style="font-size:18px;font-weight:700;color:var(--primary);">KGRN ensures continuous compliance, risk reduction, and regulatory alignment</div>
        <div style="font-size:13px;color:var(--dark);margin-top:3px;">Comprehensive governance framework for enterprise compliance</div>
        <div style="display:flex;justify-content:center;gap:28px;margin-top:8px;font-size:12px;font-weight:600;color:var(--gray);">
          <div>24/7 Monitoring</div><div>|</div><div>Global Coverage</div>
        </div>
      </div>
    </div>
    ${foot(12)}
  </section>`;

  /* ══════════════════════════════════════════════
     SLIDE 13 — MANAGED SERVICES MODEL
  ══════════════════════════════════════════════ */
  const slide13 = `
  <section class="slide">
    <div class="header">
      <div>
        <div style="font-size:10px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--gray);margin-bottom:3px;">KGRN Managed Services</div>
        <h2 style="margin:0;font-size:28px;font-weight:800;color:var(--primary);letter-spacing:-0.5px;">Managed Services Model — Flexible Engagement Based on Your Needs</h2>
        <div style="font-size:13px;color:var(--dark);margin-top:3px;">Choose the right level of support for your eInvoicing compliance requirements</div>
      </div>
    </div>
    <div class="content">
      <div class="grid-3 gap-3" style="flex:1;align-items:stretch;">
        <div class="card text-center" style="align-items:center;border-top-color:var(--gray);">
          <h3 style="font-size:26px;font-weight:800;color:var(--navy);margin:0 0 3px;">Monitor</h3>
          <div style="font-size:13px;color:var(--gray);margin-bottom:16px;">Compliance Oversight</div>
          ${bullet(['Platform access','XML validation','FTA submission','Dashboard reporting','SLA support'],'flex:1;width:100%;font-size:13px;')}
          <div class="highlight mt-auto" style="font-size:11px;border-left-color:var(--gray);width:100%;margin-top:12px;">Client manages day-to-day operations</div>
        </div>
        <div class="card card-featured text-center" style="align-items:center;">
          <div class="tag mb-2" style="align-self:center;margin-bottom:8px;">Recommended</div>
          <h3 style="font-size:26px;font-weight:800;color:var(--primary);margin:0 0 3px;">Assure</h3>
          <div style="font-size:13px;color:var(--dark);margin-bottom:16px;">Active Compliance Management</div>
          ${bullet(['Includes Monitor features','Proactive validation','Error identification','Compliance oversight','Periodic reporting'],'flex:1;width:100%;font-size:13px;')}
          <div class="highlight mt-auto" style="font-size:11px;width:100%;margin-top:12px;">KGRN actively supports compliance and reduces risk</div>
        </div>
        <div class="card text-center" style="align-items:center;border-top-color:var(--navy);">
          <h3 style="font-size:26px;font-weight:800;color:var(--navy);margin:0 0 3px;">Operate</h3>
          <div style="font-size:13px;color:var(--gray);margin-bottom:16px;">End-to-End Managed Service</div>
          ${bullet(['Includes Assure features','Full lifecycle management','Error resolution','Resubmission handling','Continuous monitoring','Priority support'],'flex:1;width:100%;font-size:13px;')}
          <div class="highlight mt-auto" style="font-size:11px;border-left-color:var(--navy);width:100%;margin-top:12px;">KGRN operates eInvoicing as an extended function</div>
        </div>
      </div>
      <div class="card mt-2" style="background:var(--light-gray);border:none;padding:14px;">
        <div style="font-size:15px;font-weight:700;color:var(--primary);margin-bottom:6px;">How to Choose</div>
        <div class="grid-3 text-center" style="font-size:12px;font-weight:600;color:var(--dark);">
          <div>Monitor &rarr; Internal control</div>
          <div>Assure &rarr; Balanced support</div>
          <div>Operate &rarr; Full outsourcing</div>
        </div>
      </div>
    </div>
    ${foot(13)}
  </section>`;

  /* ══════════════════════════════════════════════
     SLIDE 14 — MANAGED SERVICES COMMERCIAL OPTIONS
  ══════════════════════════════════════════════ */
  const slide14 = `
  <section class="slide">
    <div class="header">
      <div>
        <h2 style="margin:0;font-size:26px;font-weight:800;color:var(--primary);letter-spacing:-0.5px;">Managed Services Commercial Options — Flexible Engagement Models</h2>
        <div style="font-size:13px;color:var(--dark);margin-top:3px;">Engagement model can be aligned based on operational preference and level of internal involvement</div>
      </div>
    </div>
    <div class="content">
      <div class="grid-3 gap-3" style="flex:1;align-items:stretch;">
        <div class="card text-center" style="align-items:center;border-top-color:var(--gray);">
          <h3 style="font-size:26px;font-weight:800;color:var(--navy);margin:0 0 3px;">Monitor</h3>
          <div style="font-size:12px;color:var(--gray);margin-bottom:5px;">Compliance Enablement</div>
          <div style="font-size:32px;font-weight:900;color:var(--navy);letter-spacing:-1.5px;margin-bottom:16px;">${fc(monitorPrice)} <span style="font-size:13px;font-weight:400;color:var(--gray);">/year</span></div>
          ${bullet(['Platform access','XML validation','FTA submission','Dashboard reporting','SLA support'],'flex:1;width:100%;font-size:13px;')}
          <div class="highlight mt-auto" style="font-size:11px;border-left-color:var(--gray);width:100%;margin-top:12px;">Client manages day-to-day operations</div>
        </div>
        <div class="card card-featured text-center" style="align-items:center;">
          <div class="tag mb-2" style="align-self:center;margin-bottom:6px;text-transform:uppercase;">RECOMMENDED</div>
          <h3 style="font-size:26px;font-weight:800;color:var(--primary);margin:0 0 3px;">Assure</h3>
          <div style="font-size:12px;color:var(--dark);margin-bottom:5px;">Active Compliance Management</div>
          <div style="font-size:32px;font-weight:900;color:var(--primary);letter-spacing:-1.5px;margin-bottom:16px;">${fc(assurePrice)} <span style="font-size:13px;font-weight:400;color:var(--gray);">/year</span></div>
          ${bullet(['Everything in Monitor','Proactive validation','Error identification','Compliance oversight','Periodic reporting'],'flex:1;width:100%;font-size:13px;')}
          <div class="highlight mt-auto" style="font-size:11px;width:100%;margin-top:12px;">KGRN actively supports compliance and reduces risk</div>
        </div>
        <div class="card text-center" style="align-items:center;border-top-color:var(--navy);">
          <h3 style="font-size:26px;font-weight:800;color:var(--navy);margin:0 0 3px;">Operate</h3>
          <div style="font-size:12px;color:var(--gray);margin-bottom:5px;">End-to-End Managed Service</div>
          <div style="font-size:32px;font-weight:900;color:var(--navy);letter-spacing:-1.5px;margin-bottom:16px;">${fc(operatePrice)} <span style="font-size:13px;font-weight:400;color:var(--gray);">/year</span></div>
          ${bullet(['Everything in Assure','Full lifecycle management','Error handling','Resubmission','Continuous monitoring'],'flex:1;width:100%;font-size:13px;')}
          <div class="highlight mt-auto" style="font-size:11px;border-left-color:var(--navy);width:100%;margin-top:12px;">KGRN operates as an extended function</div>
        </div>
      </div>
      <div class="card mt-2" style="background:var(--light-gray);border:none;padding:14px;">
        <div style="font-size:15px;font-weight:700;color:var(--primary);margin-bottom:6px;">How to Select the Right Model</div>
        <div class="grid-3 text-center" style="font-size:12px;font-weight:600;color:var(--dark);">
          <div>Monitor &rarr; Internal control</div>
          <div>Assure &rarr; Balanced approach</div>
          <div>Operate &rarr; Full outsourcing</div>
        </div>
      </div>
    </div>
    ${foot(14)}
  </section>`;

  /* ══════════════════════════════════════════════
     SLIDE 15 — IMMEDIATE NEXT STEPS
  ══════════════════════════════════════════════ */
  const slide15 = `
  <section class="slide">
    <div class="header">
      <div>
        <h2 style="margin:0;font-size:34px;font-weight:800;color:var(--primary);letter-spacing:-1px;">Immediate Next Steps</h2>
      </div>
      ${logoImg()}
    </div>
    <div class="content">
      <div class="grid-2 gap-3" style="flex:1;">
        <div class="flex-col gap-2">
          ${[
            'Confirm scope and commercial alignment',
            'Initiate Gap Assessment phase',
            'Align on timeline (4–6 weeks)',
            'Begin onboarding and integration setup'
          ].map((t,i) => `
            <div class="flex align-center gap-3" style="padding:16px;background:var(--light-gray);border-radius:10px;border-left:4px solid var(--primary);">
              <div class="step-num">${i+1}</div>
              <div style="font-size:16px;color:var(--dark);">${t}</div>
            </div>`).join('')}
        </div>
        <div class="flex-col gap-2">
          <div class="card">
            <h3 style="font-size:17px;font-weight:700;color:var(--primary);margin:0 0 10px;">What This Enables</h3>
            ${bullet(['Early compliance readiness','Avoid last-minute risks','Structured onboarding','Readiness before January 2027'],'font-size:13px;')}
          </div>
          <div class="card">
            <h3 style="font-size:17px;font-weight:700;color:var(--primary);margin:0 0 10px;">Engagement Positioning</h3>
            ${bullet(['Compliance','Implementation','Managed operations'],'color:#000;font-size:13px;')}
          </div>
        </div>
      </div>
      <div style="text-align:center;margin-top:16px;">
        <div style="font-size:15px;font-weight:700;color:var(--primary);">KGRN acts as a single accountable partner for end-to-end delivery</div>
        <div style="font-size:12px;color:var(--dark);margin-top:3px;">Providing comprehensive support across all compliance and implementation phases</div>
        <div style="font-size:15px;font-weight:700;color:var(--primary);margin-top:10px;">Initiate within 2–3 weeks to ensure smooth and structured transition</div>
        <div style="font-size:11px;color:var(--gray);margin-top:3px;">Early initiation allows for proper planning, resource allocation, and risk mitigation</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;border-top:2px solid var(--primary);padding-top:12px;margin-top:12px;">
        <div style="font-size:16px;font-weight:700;color:var(--primary);">RaviRaj@kgrnaudit.com &nbsp;|&nbsp; +971 4 123 4567</div>
        <div style="font-size:11px;color:var(--gray);">KGRN Chartered Accountants LLC &nbsp;|&nbsp; www.kgrnaudit.com</div>
      </div>
    </div>
  </section>`;

  /* ══════════════════════════════════════════════
     SLIDE 16 — RECOMMENDED WAY FORWARD (closing)
  ══════════════════════════════════════════════ */
  const slide16 = `
  <section class="slide" style="background:linear-gradient(160deg,#ffffff 0%,#fff8f5 60%,#fff3ef 100%);">
    <div style="position:absolute;top:-200px;right:-200px;width:600px;height:600px;background:radial-gradient(circle,rgba(240,90,40,0.05) 0%,transparent 70%);pointer-events:none;"></div>
    <div class="header">
      <div>
        <h2 style="margin:0;font-size:30px;font-weight:800;color:var(--primary);letter-spacing:-0.5px;">Next Steps — Moving Towards Compliance Readiness</h2>
        <div style="font-size:13px;color:var(--dark);margin-top:3px;">KGRN Chartered Accountants LLC &nbsp;|&nbsp; ${formatDate(proposalDate)}</div>
      </div>
      ${logoImg()}
    </div>
    <div class="content">
      <div style="text-align:center;margin-bottom:16px;">
        <h3 style="font-size:28px;font-weight:800;color:var(--primary);margin:0 0 5px;letter-spacing:-0.5px;">Recommended Way Forward</h3>
        <div style="font-size:14px;color:var(--gray);">Structured approach to initiate compliance readiness and ensure a smooth transition</div>
      </div>
      <div class="grid-2 gap-3" style="flex:1;">
        <div class="card">
          <h3 style="font-size:17px;font-weight:700;color:var(--primary);margin:0 0 14px;">Immediate Next Steps</h3>
          ${[
            'Confirm scope and commercial alignment',
            'Initiate Gap Assessment phase',
            'Align on implementation timeline (4–6 weeks)',
            'Begin onboarding and integration setup'
          ].map((t,i) => `
            <div class="flex align-center gap-3 mb-2">
              <div class="step-num">${i+1}</div>
              <div style="font-size:14px;color:var(--dark);">${t}</div>
            </div>`).join('')}
        </div>
        <div class="flex-col gap-2">
          <div class="card">
            <h3 style="font-size:17px;font-weight:700;color:var(--primary);margin:0 0 8px;">What This Enables</h3>
            ${bullet(['Early compliance readiness','Avoidance of last-minute implementation risks','Structured onboarding approach','Readiness ahead of January 2027 deadline'],'font-size:13px;')}
          </div>
          <div class="card">
            <h3 style="font-size:17px;font-weight:700;color:var(--primary);margin:0 0 8px;">Engagement Positioning</h3>
            ${bullet([
              '<strong style="color:var(--primary);">Compliance:</strong> Full regulatory compliance support',
              '<strong style="color:var(--primary);">Implementation:</strong> Seamless system integration',
              '<strong style="color:var(--primary);">Managed operations:</strong> Ongoing operational support'
            ],'color:#000;font-size:13px;')}
          </div>
        </div>
      </div>
      <div style="text-align:center;margin-top:14px;">
        <div style="font-size:16px;font-weight:600;color:var(--dark);font-style:italic;margin-bottom:6px;">"We will be happy to initiate the assessment phase at your convenience"</div>
        <div style="font-size:16px;font-weight:700;color:var(--primary);">Initiate within 2–3 weeks to ensure a smooth and structured transition</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;border-top:2px solid var(--primary);padding-top:12px;margin-top:12px;">
        <div style="font-size:18px;font-weight:700;color:var(--primary);">RaviRaj@kgrnaudit.com &nbsp;|&nbsp; +971 4 123 4567</div>
        <div style="font-size:14px;font-weight:600;color:var(--dark);margin-top:2px;">KGRN Chartered Accountants LLC</div>
        <div style="font-size:12px;color:var(--primary);">Your Trusted Partner</div>
      </div>
    </div>
  </section>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>UAE eInvoicing Proposal \u2014 ${clientName}</title>
<style>${css}</style>
</head>
<body>
${slide1}
${slide2}
${slide3}
${slide4}
${slide5}
${slide6}
${slide7}
${slide8}
${slide9}
${slide10}
${slide11}
${slide12}
${slide13}
${slide14}
${slide15}
${slide16}
</body>
</html>`;
}

function resolveLogoPath() {
  // Check env override first (set LOGO_PATH in production .env)
  if (process.env.LOGO_PATH) return process.env.LOGO_PATH;
  // Try common locations in order
  const candidates = [
    path.join(__dirname, '../../frontend/public/logo-kgrn.png'),   // dev monorepo
    path.join(process.cwd(), 'public/logo-kgrn.png'),               // backend serves public/
    path.join(process.cwd(), '../frontend/public/logo-kgrn.png'),   // sibling dirs
    path.join(process.cwd(), '../public/logo-kgrn.png'),
  ];
  return candidates.find(p => { try { fs.accessSync(p); return true; } catch { return false; } }) || null;
}

async function generatePDF(proposal) {
  // Load logo as base64 data URI
  let logoDataURI = '';
  try {
    const logoPath = resolveLogoPath();
    if (logoPath) {
      logoDataURI = `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`;
    }
  } catch (e) {
    // fall through to text fallback
  }

  const html = generateHTML(proposal, logoDataURI);

  const launchOptions = {
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-zygote',
      '--disable-extensions',
      '--disable-background-networking',
      '--disable-default-apps',
    ],
  };

  // Allow overriding the Chrome/Chromium binary path via env (required on many Linux servers)
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  const browser = await puppeteer.launch(launchOptions);
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 810 });
    // Use 'load' instead of 'networkidle0' — no external resources to wait for
    await page.setContent(html, { waitUntil: 'load', timeout: 30000 });
    const pdfBuffer = await page.pdf({
      width: '1440px',
      height: '810px',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

module.exports = { generatePDF };

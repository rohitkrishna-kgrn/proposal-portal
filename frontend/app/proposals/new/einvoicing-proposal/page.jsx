'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/Layout';
import api from '@/lib/api';
import { Plus, X, ChevronLeft } from 'lucide-react';

const DEFAULT_ERP_NAMES = [
  'Odoo', 'Oracle NetSuite', 'SAP S/4HANA', 'Microsoft Dynamics 365',
  'Sage', 'QuickBooks', 'Xero', 'Zoho Books', 'Epicor', 'Infor',
  'JD Edwards', 'Workday', 'Acumatica', 'SYSPRO', 'Priority ERP',
];

const SERVICE_DEFINITIONS = [
  { name: 'Gap Analysis', defaultPrice: '' },
  { name: 'Implementation', defaultPrice: '' },
  { name: 'Annual Subscription', defaultPrice: '' },
];

function SectionHeader({ number, title, subtitle }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 mt-0.5" style={{ background: '#F15C22' }}>
        {number}
      </div>
      <div>
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function FormField({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span style={{ color: '#F15C22' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-colors";

export default function NewEInvoicingProposalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    clientName: '',
    entityGroupName: '',
    proposalDate: new Date().toISOString().split('T')[0],
    currency: 'USD',
    selectedServices: [],
    industry: '',
    revenueModel: '',
    customerBase: '',
    erpSystem: '',
    transaction: '',
    annualSubscriptionPrice: '',
    overagePrice: '',
    monitorPrice: 4000,
    assurePrice: 6000,
    operatePrice: 9500,
    erpNames: [...DEFAULT_ERP_NAMES],
    includeManagedServices: false,
  });

  const [serviceSelections, setServiceSelections] = useState({
    'Gap Analysis': { checked: false, price: '' },
    'Implementation': { checked: false, price: '' },
    'Annual Subscription': { checked: false, price: '' },
  });

  const [newErpName, setNewErpName] = useState('');

  function toggleService(name) {
    setServiceSelections(prev => ({
      ...prev,
      [name]: { ...prev[name], checked: !prev[name].checked },
    }));
  }

  function setServicePrice(name, price) {
    setServiceSelections(prev => ({
      ...prev,
      [name]: { ...prev[name], price },
    }));
  }

  function addErpName() {
    if (!newErpName.trim() || form.erpNames.includes(newErpName.trim())) return;
    setForm(prev => ({ ...prev, erpNames: [...prev.erpNames, newErpName.trim()] }));
    setNewErpName('');
  }

  function removeErpName(name) {
    setForm(prev => ({ ...prev, erpNames: prev.erpNames.filter(e => e !== name) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Build selectedServices array from checkboxes
      const selectedServices = Object.entries(serviceSelections)
        .filter(([, v]) => v.checked)
        .map(([name, v]) => ({ name, price: parseFloat(v.price) || 0 }));

      // Derive prices from services
      const gapSvc = serviceSelections['Gap Analysis'];
      const implSvc = serviceSelections['Implementation'];
      const subSvc = serviceSelections['Annual Subscription'];

      const payload = {
        templateId: 'einvoicing-proposal',
        templateName: 'eInvoicing Proposal',
        clientName: form.clientName,
        entityGroupName: form.entityGroupName,
        proposalDate: form.proposalDate,
        selectedServices,
        industry: form.industry,
        revenueModel: form.revenueModel,
        customerBase: form.customerBase,
        erpSystem: form.erpSystem,
        transaction: form.transaction,
        gapAnalysisPrice: gapSvc.checked ? parseFloat(gapSvc.price) || undefined : undefined,
        implementationPrice: implSvc.checked ? parseFloat(implSvc.price) || undefined : undefined,
        annualSubscriptionPrice: subSvc.checked
          ? parseFloat(subSvc.price) || undefined
          : form.annualSubscriptionPrice ? parseFloat(form.annualSubscriptionPrice) : undefined,
        overagePrice: form.overagePrice ? parseFloat(form.overagePrice) : undefined,
        erpNames: form.erpNames,
        monitorPrice: parseFloat(form.monitorPrice) || 4000,
        assurePrice: parseFloat(form.assurePrice) || 6000,
        operatePrice: parseFloat(form.operatePrice) || 9500,
        currency: form.currency,
        includeManagedServices: form.includeManagedServices,
        status: 'active',
      };

      const { data } = await api.post('/proposals', payload);
      router.push(`/proposals/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create proposal');
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">New eInvoicing Proposal</h1>
            <p className="text-gray-500 text-sm mt-0.5">UAE eInvoicing Compliance & Implementation</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Client Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <SectionHeader number="1" title="Client Details" subtitle="Basic information about the proposal" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Client Name" required>
                <input
                  type="text"
                  required
                  value={form.clientName}
                  onChange={e => setForm({ ...form, clientName: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. Acme Corporation"
                />
              </FormField>
              <FormField label="Entity / Group Name">
                <input
                  type="text"
                  value={form.entityGroupName}
                  onChange={e => setForm({ ...form, entityGroupName: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. Acme Group of Companies"
                />
              </FormField>
              <FormField label="Proposal Date" required>
                <input
                  type="date"
                  required
                  value={form.proposalDate}
                  onChange={e => setForm({ ...form, proposalDate: e.target.value })}
                  className={inputClass}
                />
              </FormField>
              <FormField label="Currency" required>
                <select
                  value={form.currency}
                  onChange={e => setForm({ ...form, currency: e.target.value })}
                  className={inputClass}
                >
                  <option value="USD">USD — US Dollar</option>
                  <option value="AED">AED — UAE Dirham</option>
                  <option value="EUR">EUR — Euro</option>
                </select>
              </FormField>
            </div>
          </div>

          {/* Section 2: Services */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <SectionHeader number="2" title="Services" subtitle="Select services to include in this proposal" />
            <div className="space-y-3">
              {SERVICE_DEFINITIONS.map(({ name }) => (
                <div key={name} className={`border rounded-lg p-4 transition-colors ${serviceSelections[name].checked ? 'border-orange-300 bg-orange-50' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={`svc-${name}`}
                      checked={serviceSelections[name].checked}
                      onChange={() => toggleService(name)}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: '#F15C22' }}
                    />
                    <label htmlFor={`svc-${name}`} className="font-medium text-gray-900 text-sm cursor-pointer flex-1">
                      {name}
                    </label>
                    {serviceSelections[name].checked && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">{form.currency}</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={serviceSelections[name].price}
                          onChange={e => setServicePrice(name, e.target.value)}
                          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-36 focus:outline-none focus:ring-2"
                          placeholder="Price"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Business Context */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <SectionHeader number="3" title="Business Context" subtitle="Information about the client's business (displayed on slide 3)" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Industry">
                <input
                  type="text"
                  value={form.industry}
                  onChange={e => setForm({ ...form, industry: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. B2B, B2G or B2C"
                />
              </FormField>
              <FormField label="Revenue Model">
                <input
                  type="text"
                  value={form.revenueModel}
                  onChange={e => setForm({ ...form, revenueModel: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. 50M, 60M, 70M..."
                />
              </FormField>
              <FormField label="Customer Base">
                <input
                  type="text"
                  value={form.customerBase}
                  onChange={e => setForm({ ...form, customerBase: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. Single or Multi Entity"
                />
              </FormField>
              <FormField label="ERP System">
                <input
                  type="text"
                  value={form.erpSystem}
                  onChange={e => setForm({ ...form, erpSystem: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. SAP S/4HANA, Oracle NetSuite"
                />
              </FormField>
              <FormField label="Yearly Invoice Count">
                <input
                  type="text"
                  value={form.transaction}
                  onChange={e => setForm({ ...form, transaction: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. 50M, 60M, 70M+"
                />
              </FormField>
            </div>
          </div>

          {/* Section 4: Pricing Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <SectionHeader number="4" title="Pricing Details" subtitle="Additional pricing fields for slide 7 (if not set via services)" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label={`Annual Subscription Price (${form.currency})`}>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.annualSubscriptionPrice}
                  onChange={e => setForm({ ...form, annualSubscriptionPrice: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. 12000"
                />
              </FormField>
              <FormField label={`Overage Price per 1,000 invoices (${form.currency})`}>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.overagePrice}
                  onChange={e => setForm({ ...form, overagePrice: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. 500"
                />
              </FormField>
            </div>
          </div>

          {/* Section 5: Managed Services Pricing */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 mt-0.5" style={{ background: '#F15C22' }}>5</div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Managed Services Pricing</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Include Monitor, Assure &amp; Operate pricing slide in PDF</p>
                </div>
              </div>
              {/* Toggle */}
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, includeManagedServices: !prev.includeManagedServices }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none shrink-0 mt-0.5 ${form.includeManagedServices ? '' : 'bg-gray-200'}`}
                style={form.includeManagedServices ? { background: '#F15C22' } : {}}
                aria-label="Toggle managed services pricing"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${form.includeManagedServices ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>

            {form.includeManagedServices && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label={`Monitor — Annual Price (${form.currency})`}>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.monitorPrice}
                    onChange={e => setForm({ ...form, monitorPrice: e.target.value })}
                    className={inputClass}
                  />
                </FormField>
                <FormField label={`Assure — Annual Price (${form.currency})`}>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.assurePrice}
                    onChange={e => setForm({ ...form, assurePrice: e.target.value })}
                    className={inputClass}
                  />
                </FormField>
                <FormField label={`Operate — Annual Price (${form.currency})`}>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.operatePrice}
                    onChange={e => setForm({ ...form, operatePrice: e.target.value })}
                    className={inputClass}
                  />
                </FormField>
              </div>
            )}

            {!form.includeManagedServices && (
              <div className="flex items-center gap-2 py-3 px-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <span className="text-sm text-gray-400">Managed services pricing slide (slide 14) will be excluded from the PDF.</span>
              </div>
            )}
          </div>

          {/* Section 6: ERP Ecosystem */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <SectionHeader number="6" title="ERP Ecosystem" subtitle="List of supported ERP systems displayed on slide 10" />

            <div className="flex flex-wrap gap-2 mb-4">
              {form.erpNames.map(name => (
                <span
                  key={name}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 bg-gray-50"
                >
                  {name}
                  <button
                    type="button"
                    onClick={() => removeErpName(name)}
                    className="text-gray-400 hover:text-red-500 transition-colors ml-0.5"
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newErpName}
                onChange={e => setNewErpName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addErpName())}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                placeholder="Add ERP name and press Enter or click Add"
              />
              <button
                type="button"
                onClick={addErpName}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
                style={{ background: '#F15C22' }}
              >
                <Plus size={15} />
                Add
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pb-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 md:flex-none md:px-8 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-60 hover:opacity-90 transition-opacity"
              style={{ background: '#F15C22' }}
            >
              {loading ? 'Creating Proposal...' : 'Create Proposal'}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

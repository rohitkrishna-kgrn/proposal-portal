'use client';
import AppLayout from '@/components/Layout';
import Link from 'next/link';
import { FileText, ArrowRight } from 'lucide-react';

const TEMPLATES = [
  {
    id: 'einvoicing-proposal',
    name: 'eInvoicing Proposal',
    description: 'UAE eInvoicing Compliance & Implementation Advisory and Managed Services Proposal',
    services: ['Gap Analysis', 'Implementation', 'Annual Subscription'],
    badge: 'Active',
    pages: 15,
  },
];

export default function NewProposalPage() {
  return (
    <AppLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">New Proposal</h1>
          <p className="text-gray-500 text-sm mt-1">Select a template to get started</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {TEMPLATES.map(template => (
            <div
              key={template.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-orange-300 hover:shadow-md transition-all"
            >
              {/* Card header */}
              <div className="p-5 border-b border-gray-100" style={{ background: 'linear-gradient(135deg, #FEF3EC 0%, #FFF7F3 100%)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#F15C22' }}>
                    <FileText size={20} className="text-white" />
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#F15C22', color: 'white' }}>
                    {template.badge}
                  </span>
                </div>
                <h2 className="text-base font-bold text-gray-900 mt-3">{template.name}</h2>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{template.description}</p>
              </div>

              {/* Services */}
              <div className="p-5">
                <div className="mb-3">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Included Services</div>
                  <div className="flex flex-wrap gap-1.5">
                    {template.services.map(s => (
                      <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-100 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-xs text-gray-400 mb-4">{template.pages} slides · A4 Landscape PDF</div>
                <Link
                  href={`/proposals/new/${template.id}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                  style={{ background: '#F15C22' }}
                >
                  Select Template
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

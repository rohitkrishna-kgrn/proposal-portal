'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import AppLayout from '@/components/Layout';
import api from '@/lib/api';
import { getUser } from '@/lib/auth';
import { FileText, Users, Send, Activity, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const MonthlyBarChart = dynamic(
  () => import('@/components/AdminCharts').then(m => m.MonthlyBarChart),
  { ssr: false, loading: () => <div className="h-55 bg-gray-50 rounded-lg animate-pulse" /> }
);
const StatusPieChart = dynamic(
  () => import('@/components/AdminCharts').then(m => m.StatusPieChart),
  { ssr: false, loading: () => <div className="h-55 bg-gray-50 rounded-lg animate-pulse" /> }
);
const ServicesBarChart = dynamic(
  () => import('@/components/AdminCharts').then(m => m.ServicesBarChart),
  { ssr: false, loading: () => <div className="h-45 bg-gray-50 rounded-lg animate-pulse" /> }
);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon size={20} style={{ color }} />
        </div>
        {sub && <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">{sub}</span>}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    draft: 'bg-gray-100 text-gray-600',
    active: 'bg-blue-100 text-blue-700',
    sent: 'bg-orange-100 text-orange-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold capitalize ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

export default function DashboardPage() {
  const [user] = useState(() => getUser());
  const [stats, setStats] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        if (user?.role === 'admin') {
          const { data } = await api.get('/dashboard/stats');
          setStats(data);
        } else {
          const { data } = await api.get('/proposals');
          setProposals(data.slice(0, 10));
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchData();
  }, [user]);

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6 space-y-6">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="h-72 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-72 bg-gray-100 rounded-xl animate-pulse" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="p-6 flex items-center justify-center h-64">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-sm">{error}</div>
        </div>
      </AppLayout>
    );
  }

  // Non-admin dashboard
  if (user?.role !== 'admin') {
    return (
      <AppLayout>
        <div className="p-6 max-w-4xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
            <p className="text-gray-500 text-sm mt-1">Here are your recent proposals</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatCard icon={FileText} label="My Proposals" value={proposals.length} color="#F15C22" />
            <StatCard icon={Send} label="Sent" value={proposals.filter(p => p.status === 'sent').length} color="#16A34A" />
            <StatCard icon={Activity} label="Active" value={proposals.filter(p => p.status === 'active').length} color="#0070C0" />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Recent Proposals</h2>
              <Link href="/proposals" className="text-sm font-medium hover:opacity-80" style={{ color: '#F15C22' }}>View all →</Link>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Reference</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Client</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody>
                {proposals.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-gray-400">
                      <div className="mb-3">
                        <FileText size={32} className="mx-auto text-gray-300" />
                      </div>
                      No proposals yet.{' '}
                      <Link href="/proposals/new" className="font-medium hover:underline" style={{ color: '#F15C22' }}>Create your first one →</Link>
                    </td>
                  </tr>
                ) : (
                  proposals.map(p => (
                    <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-gray-500">{p.referenceNo}</td>
                      <td className="px-5 py-3 font-medium text-gray-900">{p.clientName}</td>
                      <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                      <td className="px-5 py-3 text-gray-500">{new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Admin dashboard
  const monthlyData = (stats?.monthly || []).map(m => ({
    name: MONTHS[(m._id.month - 1)],
    proposals: m.count,
  }));

  const statusData = (stats?.statusDist || []).map(s => ({
    name: s._id,
    value: s.count,
  }));

  const servicesData = (stats?.servicesDist || []).map(s => ({
    name: s._id,
    count: s.count,
    revenue: s.totalRevenue,
  }));

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Overview of proposal activity</p>
          </div>
          <Link
            href="/proposals/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            style={{ background: '#F15C22' }}
          >
            + New Proposal
          </Link>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard icon={FileText} label="Total Proposals" value={stats?.totalProposals ?? 0} color="#F15C22" sub="all time" />
          <StatCard icon={Users} label="Total Users" value={stats?.totalUsers ?? 0} color="#0070C0" sub="registered" />
          <StatCard icon={Send} label="Sent Proposals" value={stats?.sentProposals ?? 0} color="#16A34A" sub="emailed" />
          <StatCard icon={Activity} label="Active Proposals" value={stats?.activeProposals ?? 0} color="#9CA3AF" sub="in progress" />
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} style={{ color: '#F15C22' }} />
              <h2 className="text-base font-semibold text-gray-900">Monthly Proposals</h2>
              <span className="text-xs text-gray-400 ml-auto">Last 6 months</span>
            </div>
            <MonthlyBarChart data={monthlyData} />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={16} style={{ color: '#0070C0' }} />
              <h2 className="text-base font-semibold text-gray-900">Status Distribution</h2>
            </div>
            <StatusPieChart data={statusData} />
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={16} style={{ color: '#0070C0' }} />
              <h2 className="text-base font-semibold text-gray-900">Services Popularity</h2>
            </div>
            <ServicesBarChart data={servicesData} />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users size={16} style={{ color: '#F15C22' }} />
              <h2 className="text-base font-semibold text-gray-900">Top Proposers</h2>
            </div>
            {(stats?.topUsers || []).length === 0 ? (
              <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No data yet</div>
            ) : (
              <div className="space-y-3">
                {stats.topUsers.map((u, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ background: i === 0 ? '#F15C22' : i === 1 ? '#0070C0' : '#9CA3AF' }}
                    >
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{u.name}</div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (u.count / (stats.topUsers[0]?.count || 1)) * 100)}%`,
                            background: i === 0 ? '#F15C22' : '#0070C0'
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-sm font-bold" style={{ color: '#F15C22' }}>{u.count}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

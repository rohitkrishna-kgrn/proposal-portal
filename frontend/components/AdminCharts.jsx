'use client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const STATUS_COLORS = {
  draft: '#9CA3AF',
  active: '#0070C0',
  sent: '#F15C22',
  accepted: '#16A34A',
  rejected: '#DC2626',
};
const PIE_COLORS = ['#F15C22', '#0070C0', '#16A34A', '#9CA3AF', '#DC2626'];

export function MonthlyBarChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No data yet</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} />
        <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} allowDecimals={false} />
        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }} />
        <Bar dataKey="proposals" fill="#F15C22" radius={[4, 4, 0, 0]} name="Proposals" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StatusPieChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No data yet</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="45%"
          outerRadius={75}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={STATUS_COLORS[entry.name] || PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ServicesBarChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No data yet</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#6B7280' }} allowDecimals={false} />
        <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#6B7280' }} width={130} />
        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }} />
        <Bar dataKey="count" fill="#0070C0" radius={[0, 4, 4, 0]} name="Usage" />
      </BarChart>
    </ResponsiveContainer>
  );
}

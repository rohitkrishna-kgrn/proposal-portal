'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getUser, logout } from '@/lib/auth';
import { LayoutDashboard, FileText, Users, Settings, LogOut, BookOpen } from 'lucide-react';

export default function AppLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.replace('/login'); return; }
    setUser(u);
  }, [router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#F15C22' }}></div>
      </div>
    );
  }

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/proposals', icon: FileText, label: 'Proposals' },
    { href: '/docs', icon: BookOpen, label: 'Documentation' },
  ];

  const adminItems = [
    { href: '/admin/users', icon: Users, label: 'Manage Users' },
    { href: '/admin/config', icon: Settings, label: 'Configuration' },
  ];

  const isActive = (href) => pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-200">
          <div className="text-xl font-bold">
            <span style={{ color: '#F15C22' }}>KGRN</span>
            {/* <span className="font-normal text-lg ml-1" style={{ color: '#0070C0' }}>Amplified</span> */}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Proposal Portal</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(href) ? 'text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              style={isActive(href) ? { background: '#F15C22' } : {}}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}

          {user.role === 'admin' && (
            <>
              <div className="pt-4 pb-1 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Admin
              </div>
              {adminItems.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(href) ? 'text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  style={isActive(href) ? { background: '#F15C22' } : {}}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              ))}
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
              style={{ background: '#F15C22' }}
            >
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
              <div className="text-xs text-gray-500 capitalize">{user.role}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors w-full"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}

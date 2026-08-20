import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TransbillLogo from '@/components/TransbillLogo';
import { BarChart3, Users, CalendarDays, ClipboardCheck, ShieldCheck, LogOut, Menu, X, ExternalLink } from 'lucide-react';

const ALL_NAV_ITEMS = [
  { key: 'funnel',      label: 'Funnel metrics',      icon: BarChart3,      path: '/AdminDashboard' },
  { key: 'applicants', label: 'Applicant Management', icon: Users,          path: '/admin' },
  { key: 'schedule',   label: 'Interview Schedule',   icon: CalendarDays,   path: '/schedule' },
  { key: 'outcomes',   label: 'Interview Outcomes',   icon: ClipboardCheck, path: '/admin' },
  { key: 'access',     label: 'Admin Access',         icon: ShieldCheck,    path: '/admin-access' },
];

// digital_marketer sees only Funnel Metrics + View Landing Page
const DM_NAV_ITEMS = [
  { key: 'funnel', label: 'Funnel metrics', icon: BarChart3, path: '/AdminDashboard' },
];

export default function FunnelSidebar({ adminInfo, onLogout, activePage = 'funnel' }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isDigitalMarketer = adminInfo?.role === 'digital_marketer';
  const navItems = isDigitalMarketer ? DM_NAV_ITEMS : ALL_NAV_ITEMS;

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const go = (path) => { navigate(path); };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0A2540]">
      {/* Branding */}
      <div className="px-5 pt-5 pb-4 border-b border-[#1A3A5C]">
        <div className="bg-white rounded-lg px-3 py-2 inline-flex">
          <TransbillLogo />
        </div>
        <p className="text-[10px] text-[#64748B] uppercase tracking-wider mt-3 font-semibold">Digital Sales Programme</p>
        <p className="text-sm text-white font-bold mt-0.5">Admin Portal</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = item.key === activePage;
          return (
            <button
              key={item.key}
              onClick={() => go(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative ${
                active ? 'text-white bg-[#0F2D4F]' : 'text-[#94A3B8] hover:text-white hover:bg-[#0F2D4F]/50'
              }`}
            >
              {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#C9A227]" />}
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-[#C9A227]' : ''}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
        {/* View Landing Page — visible to all roles */}
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#94A3B8] hover:text-white hover:bg-[#0F2D4F]/50 transition-all"
        >
          <ExternalLink className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">View Landing Page</span>
        </button>
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-[#1A3A5C]">
        {adminInfo && (
          <div className="mb-3">
            <p className="text-xs text-white font-medium truncate">{adminInfo.email}</p>
            <span className="inline-block text-[10px] text-[#C9A227] bg-[#C9A227]/10 border border-[#C9A227]/30 px-2 py-0.5 rounded-full font-bold uppercase mt-1">
              {adminInfo.role.replace('_', ' ')}
            </span>
          </div>
        )}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 text-xs text-[#94A3B8] hover:text-white px-2 py-2 rounded-lg hover:bg-[#0F2D4F] transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 bg-[#0A2540] border-b border-[#1A3A5C] px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setMobileOpen(true)}
          className="text-[#94A3B8] hover:text-white p-1"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="bg-white rounded-md px-2 py-1">
          <TransbillLogo />
        </div>
        <div className="w-7" />
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — fixed on desktop, drawer on mobile */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-[230px] z-50 transform transition-transform duration-200 lg:translate-x-0 lg:z-30 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden absolute top-4 right-3 text-[#94A3B8] hover:text-white"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </aside>
    </>
  );
}
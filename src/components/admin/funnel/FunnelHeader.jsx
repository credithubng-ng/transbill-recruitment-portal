import React from 'react';
import { useNavigate } from 'react-router-dom';
import TransbillLogo from '@/components/TransbillLogo';
import { ArrowLeft, RefreshCw, LogOut } from 'lucide-react';

export default function FunnelHeader({ lastRefreshed, onRefresh, adminInfo, onLogout }) {
  const navigate = useNavigate();
  const refreshedLabel = lastRefreshed
    ? new Date(lastRefreshed).toLocaleString('en-GB', { timeZone: 'Africa/Lagos', dateStyle: 'short', timeStyle: 'short' })
    : '—';

  return (
    <div className="sticky top-0 z-40 bg-[#0B1120] border-b border-[#1E3A5F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-1.5 text-sm text-[#94A3B8] hover:text-white transition-colors flex-shrink-0"
            aria-label="Back to Applicant Management"
          >
            <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Applicant Management</span>
          </button>
          <div className="h-5 w-px bg-[#1E3A5F] hidden sm:block" />
          <TransbillLogo />
          <span className="text-xs font-bold text-[#06B6D4] bg-[#0B1120] border border-[#1E3A5F] px-2 py-0.5 rounded-full hidden sm:inline">FUNNEL</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end text-right">
            <span className="text-[10px] text-[#64748B] uppercase tracking-wide">Africa/Lagos · Refreshed {refreshedLabel}</span>
          </div>
          <button
            onClick={onRefresh}
            className="text-[#94A3B8] hover:text-white p-2 rounded-lg hover:bg-[#13203B] transition-colors"
            aria-label="Refresh dashboard"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {adminInfo && (
            <div className="hidden lg:flex items-center gap-2 text-xs">
              <span className="text-[#64748B]">{adminInfo.email}</span>
              <span className="bg-[#13203B] text-[#06B6D4] px-2 py-0.5 rounded-full font-bold uppercase">{adminInfo.role.replace('_', ' ')}</span>
            </div>
          )}
          <button onClick={onLogout} className="text-[#94A3B8] hover:text-white flex items-center gap-1.5 text-sm" aria-label="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
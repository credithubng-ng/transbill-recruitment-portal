import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import AdminLogin from './AdminLogin';
import ApplicantPanel from '@/components/admin/ApplicantPanel';
import FunnelSidebar from '@/components/admin/funnel/FunnelSidebar';
import FunnelFilters from '@/components/admin/funnel/FunnelFilters';
import FunnelKPICards from '@/components/admin/funnel/FunnelKPICards';
import FunnelChart from '@/components/admin/funnel/FunnelChart';
import FunnelTrendChart from '@/components/admin/funnel/FunnelTrendChart';
import FunnelConversionTable from '@/components/admin/funnel/FunnelConversionTable';
import FunnelDataQuality from '@/components/admin/funnel/FunnelDataQuality';
import FunnelDefinitions from '@/components/admin/funnel/FunnelDefinitions';
import FunnelDrilldown from '@/components/admin/funnel/FunnelDrilldown';
import BackfillControl from '@/components/admin/funnel/BackfillControl';
import { RefreshCw, ExternalLink } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [adminInfo, setAdminInfo] = useState(null);

  const [preset, setPreset] = useState('30days');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [mode, setMode] = useState('cohort');
  const [dateError, setDateError] = useState('');

  const [drilldownStage, setDrilldownStage] = useState(null);
  const [drilldownPage, setDrilldownPage] = useState(0);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  const queryClient = useQueryClient();

  // ── Auth verification ──
  useEffect(() => {
    const token = sessionStorage.getItem('transbill_admin_token');
    if (!token) { setVerifying(false); return; }
    base44.functions.invoke('adminAuth', { action: 'verify', token })
      .then(res => {
        if (res.data?.valid) {
          setAuthenticated(true);
          setAdminInfo(res.data.admin || JSON.parse(sessionStorage.getItem('transbill_admin_info') || 'null'));
        } else {
          sessionStorage.removeItem('transbill_admin_token');
          sessionStorage.removeItem('transbill_admin_info');
        }
      })
      .catch(() => {
        sessionStorage.removeItem('transbill_admin_token');
        sessionStorage.removeItem('transbill_admin_info');
      })
      .finally(() => setVerifying(false));
  }, []);

  // ── Date validation ──
  const validatedParams = useMemo(() => {
    if (preset === 'custom') {
      if (!customFrom || !customTo) return { error: 'Both dates are required.' };
      if (new Date(customFrom) > new Date(customTo)) return { error: 'From date must be before To date.' };
      const today = new Date().toISOString().slice(0, 10);
      if (customTo > today) return { error: 'To date cannot be in the future.' };
    }
    return { error: null };
  }, [preset, customFrom, customTo]);

  useEffect(() => { setDateError(validatedParams.error || ''); }, [validatedParams.error]);

  // ── Dashboard data query ──
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['funnelDashboard', preset, customFrom, customTo, mode],
    queryFn: async () => {
      const token = sessionStorage.getItem('transbill_admin_token');
      const res = await base44.functions.invoke('adminFunnelDashboard', {
        token, preset, custom_from: customFrom, custom_to: customTo, mode,
      });
      if (res.data?.error) throw new Error(res.data.error);
      return res.data;
    },
    enabled: authenticated && !validatedParams.error,
    retry: false,
    staleTime: 60 * 1000,
  });

  // ── Stale session detection ──
  useEffect(() => {
    if (error?.message === 'Unauthorized') {
      sessionStorage.removeItem('transbill_admin_token');
      sessionStorage.removeItem('transbill_admin_info');
      setAuthenticated(false);
    }
  }, [error]);

  // ── Drill-down query ──
  const { data: drilldownData, isLoading: drilldownLoading } = useQuery({
    queryKey: ['funnelDrilldown', drilldownStage, preset, customFrom, customTo, mode, drilldownPage],
    queryFn: async () => {
      const token = sessionStorage.getItem('transbill_admin_token');
      const res = await base44.functions.invoke('adminFunnelDashboard', {
        token, preset, custom_from: customFrom, custom_to: customTo, mode,
        drilldown_stage: drilldownStage, drilldown_page: drilldownPage, drilldown_limit: 50,
      });
      if (res.data?.error) throw new Error(res.data.error);
      return res.data?.drilldown;
    },
    enabled: authenticated && !!drilldownStage && !validatedParams.error,
    retry: false,
  });

  const handleLogout = () => {
    if (!confirm('Are you sure you want to log out?')) return;
    sessionStorage.removeItem('transbill_admin_token');
    sessionStorage.removeItem('transbill_admin_info');
    setAuthenticated(false);
    setAdminInfo(null);
  };

  const openDrilldown = (stage) => {
    setDrilldownStage(stage);
    setDrilldownPage(0);
  };

  const closeDrilldown = () => {
    setDrilldownStage(null);
    setDrilldownPage(0);
  };

  const viewApplicant = async (applicantId) => {
    try {
      const applicant = await base44.entities.Applicant.get(applicantId);
      if (applicant) {
        closeDrilldown();
        setSelectedApplicant(applicant);
      }
    } catch (_e) { /* ignore */ }
  };

  const handleApplicantUpdate = (updated) => {
    setSelectedApplicant(updated);
    queryClient.invalidateQueries({ queryKey: ['funnelDashboard'] });
  };

  // ── Render states ──
  if (verifying) return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#F4F6F9]">
      <div className="w-8 h-8 border-4 border-[#E5E7EB] border-t-[#0A2540] rounded-full animate-spin" />
    </div>
  );

  if (!authenticated) return <AdminLogin onLogin={(info) => { setAuthenticated(true); setAdminInfo(info); }} />;

  const aggregates = data?.aggregates || [];
  const timeSeries = data?.timeSeries || [];
  const dataQuality = data?.dataQuality || null;
  const definitions = data?.definitions || null;

  return (
    <div className="min-h-screen bg-[#F4F6F9]">
      <FunnelSidebar
        adminInfo={adminInfo}
        onLogout={handleLogout}
        activePage="funnel"
      />

      {/* Main content area — offset by sidebar on desktop */}
      <div className="lg:pl-[230px]">
        <main className="px-4 sm:px-6 lg:px-10 py-6 max-w-[1200px] mx-auto">
          {/* Compact header */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-1">Transbill Solutions Limited</p>
              <h1 className="font-extrabold text-2xl sm:text-3xl text-[#0A2540] tracking-tight">Application funnel</h1>
              <p className="text-xs text-[#9CA3AF] mt-1">All times shown in Africa/Lagos (UTC+1)</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => navigate('/')}
                className="text-xs font-semibold text-[#0A2540] hover:text-[#0891B2] flex items-center gap-1.5 transition-colors"
              >
                View landing page <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={refetch}
                className="text-[#6B7280] hover:text-[#0A2540] p-2 rounded-lg hover:bg-[#E5E7EB]/50 transition-colors"
                aria-label="Refresh dashboard"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Compact filter bar */}
          <div className="mb-5">
            <FunnelFilters
              preset={preset}
              setPreset={setPreset}
              customFrom={customFrom}
              setCustomFrom={setCustomFrom}
              customTo={customTo}
              setCustomTo={setCustomTo}
              mode={mode}
              setMode={setMode}
              dateError={dateError}
            />
          </div>

          {dateError && (
            <div className="bg-[#FEF2F2] border border-[#DC2626]/30 text-[#DC2626] rounded-lg px-4 py-3 text-sm font-medium mb-4">
              {dateError}
            </div>
          )}

          {isError && error?.message !== 'Unauthorized' && (
            <div className="bg-[#FEF2F2] border border-[#DC2626]/30 text-[#DC2626] rounded-lg px-4 py-3 text-sm font-medium mb-4">
              Unable to load dashboard data. {error?.message || 'Please refresh or check your connection.'}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-[#E5E7EB] border-t-[#0A2540] rounded-full animate-spin" />
            </div>
          ) : !isError && data ? (
            <div className="space-y-5">
              {/* KPI Cards — 4+3 on desktop, 2 on tablet, 1 on mobile */}
              <FunnelKPICards aggregates={aggregates} onStageClick={openDrilldown} />

              {/* Conversion overview (horizontal progress bars) */}
              <FunnelChart aggregates={aggregates} onSegmentClick={openDrilldown} />

              {/* Trend chart */}
              <FunnelTrendChart timeSeries={timeSeries} />

              {/* Conversion table */}
              <FunnelConversionTable aggregates={aggregates} onRowClick={openDrilldown} />

              {/* Data Quality + Definitions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <FunnelDataQuality dataQuality={dataQuality} />
                <FunnelDefinitions definitions={definitions} />
              </div>

              {/* Backfill (owner only) */}
              {adminInfo?.role === 'owner' && (
                <BackfillControl onBackfillComplete={() => queryClient.invalidateQueries({ queryKey: ['funnelDashboard'] })} />
              )}

              {/* Empty state */}
              {aggregates.every(a => a.count === 0) && (
                <div className="bg-white rounded-lg border border-[#E5E7EB] p-8 text-center">
                  <p className="text-sm text-[#9CA3AF]">No funnel events in the selected period. Try a wider date range or run the historical backfill (owner only).</p>
                </div>
              )}
            </div>
          ) : null}
        </main>
      </div>

      {/* Drill-down drawer */}
      {drilldownStage && (
        <FunnelDrilldown
          stage={drilldownStage}
          data={drilldownData}
          isLoading={drilldownLoading}
          onPageChange={setDrilldownPage}
          onClose={closeDrilldown}
          onViewApplicant={viewApplicant}
        />
      )}

      {/* Applicant panel */}
      {selectedApplicant && (
        <ApplicantPanel
          applicant={selectedApplicant}
          onClose={() => setSelectedApplicant(null)}
          onUpdate={handleApplicantUpdate}
          readOnly={adminInfo?.role === 'read_only'}
        />
      )}
    </div>
  );
}
import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AdminLogin from './AdminLogin';
import ApplicantPanel from '@/components/admin/ApplicantPanel';
import FunnelHeader from '@/components/admin/funnel/FunnelHeader';
import FunnelFilters from '@/components/admin/funnel/FunnelFilters';
import FunnelKPICards from '@/components/admin/funnel/FunnelKPICards';
import FunnelChart from '@/components/admin/funnel/FunnelChart';
import FunnelTrendChart from '@/components/admin/funnel/FunnelTrendChart';
import FunnelConversionTable from '@/components/admin/funnel/FunnelConversionTable';
import FunnelDataQuality from '@/components/admin/funnel/FunnelDataQuality';
import FunnelDefinitions from '@/components/admin/funnel/FunnelDefinitions';
import FunnelDrilldown from '@/components/admin/funnel/FunnelDrilldown';
import BackfillControl from '@/components/admin/funnel/BackfillControl';

export default function AdminDashboard() {
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

  // ── Auth verification (same pattern as Admin.jsx) ──
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
    <div className="fixed inset-0 flex items-center justify-center bg-[#0B1120]">
      <div className="w-8 h-8 border-4 border-[#1E3A5F] border-t-[#06B6D4] rounded-full animate-spin" />
    </div>
  );

  if (!authenticated) return <AdminLogin onLogin={(info) => { setAuthenticated(true); setAdminInfo(info); }} />;

  const aggregates = data?.aggregates || [];
  const timeSeries = data?.timeSeries || [];
  const dataQuality = data?.dataQuality || null;
  const definitions = data?.definitions || null;

  return (
    <div className="min-h-screen bg-[#0B1120]">
      <FunnelHeader
        lastRefreshed={data?.lastRefreshed}
        onRefresh={refetch}
        adminInfo={adminInfo}
        onLogout={handleLogout}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-4">
        <div>
          <h1 className="font-extrabold text-xl sm:text-2xl text-white tracking-tight">Recruitment Funnel Dashboard</h1>
          <p className="text-xs text-[#64748B] mt-0.5">All times shown in Africa/Lagos (UTC+1)</p>
        </div>

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

        {dateError && (
          <div className="bg-[#F87171]/10 border border-[#F87171]/30 text-[#F87171] rounded-lg px-4 py-3 text-sm font-medium">
            {dateError}
          </div>
        )}

        {isError && error?.message !== 'Unauthorized' && (
          <div className="bg-[#F87171]/10 border border-[#F87171]/30 text-[#F87171] rounded-lg px-4 py-3 text-sm font-medium">
            Unable to load dashboard data. {error?.message || 'Please refresh or check your connection.'}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#1E3A5F] border-t-[#06B6D4] rounded-full animate-spin" />
          </div>
        ) : !isError && data ? (
          <>
            {/* KPI Cards */}
            <FunnelKPICards aggregates={aggregates} onStageClick={openDrilldown} />

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <FunnelChart aggregates={aggregates} onSegmentClick={openDrilldown} />
              <FunnelTrendChart timeSeries={timeSeries} />
            </div>

            {/* Conversion Table */}
            <FunnelConversionTable aggregates={aggregates} onRowClick={openDrilldown} />

            {/* Data Quality + Definitions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <FunnelDataQuality dataQuality={dataQuality} />
              <FunnelDefinitions definitions={definitions} />
            </div>

            {/* Backfill (owner only) */}
            {adminInfo?.role === 'owner' && (
              <BackfillControl onBackfillComplete={() => queryClient.invalidateQueries({ queryKey: ['funnelDashboard'] })} />
            )}

            {/* Empty state */}
            {aggregates.every(a => a.count === 0) && (
              <div className="bg-[#13203B] rounded-xl border border-[#1E3A5F] p-8 text-center">
                <p className="text-sm text-[#94A3B8]">No funnel events in the selected period. Try a wider date range or run the historical backfill (owner only).</p>
              </div>
            )}
          </>
        ) : null}
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
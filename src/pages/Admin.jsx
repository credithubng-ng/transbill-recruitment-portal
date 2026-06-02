import React, { useState, useMemo, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AdminLogin from './AdminLogin';
import TransbillLogo from '../components/TransbillLogo';
import StatsCards from '../components/admin/StatsCards';
import ApplicantFilters from '../components/admin/ApplicantFilters';
import ApplicantTable from '../components/admin/ApplicantTable';
import ApplicantPanel from '../components/admin/ApplicantPanel';
import { Download, LogOut } from 'lucide-react';

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [verifying, setVerifying] = useState(true);

  // Verify stored token server-side on every page load
  useEffect(() => {
    const token = sessionStorage.getItem('transbill_admin_token');
    if (!token) { setVerifying(false); return; }
    base44.functions.invoke('adminAuth', { action: 'verify', token })
      .then(res => {
        if (res.data?.valid) setAuthenticated(true);
        else sessionStorage.removeItem('transbill_admin_token');
      })
      .catch(() => sessionStorage.removeItem('transbill_admin_token'))
      .finally(() => setVerifying(false));
  }, []);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [filters, setFilters] = useState({
    search: '', status: 'all', lagos: 'all', threeMTT: 'all', sail: 'all', score: 'all', flags: 'all', stage: 'all'
  });
  const queryClient = useQueryClient();

  const { data: applicants = [], isLoading } = useQuery({
    queryKey: ['applicants'],
    queryFn: () => base44.entities.Applicant.list('-created_date', 500),
    enabled: authenticated,
  });

  const filtered = useMemo(() => {
    return applicants.filter(a => {
      const search = filters.search.toLowerCase();
      if (search && !a.full_name?.toLowerCase().includes(search) && !a.email?.toLowerCase().includes(search)) return false;
      if (filters.status !== 'all' && a.status !== filters.status) return false;
      if (filters.lagos !== 'all' && a.lagos_resident !== filters.lagos) return false;
      if (filters.threeMTT !== 'all' && a.is_3mtt !== filters.threeMTT) return false;
      if (filters.sail !== 'all' && a.is_sail !== filters.sail) return false;
      if (filters.score !== 'all') {
        const pct = a.assessment_completed ? Math.round((a.assessment_score / 25) * 100) : -1;
        if (filters.score === '84-100' && (pct < 84 || pct > 100)) return false;
        if (filters.score === '64-83' && (pct < 64 || pct > 83)) return false;
        if (filters.score === '0-63' && (pct < 0 || pct > 63)) return false;
      }
      if (filters.flags !== 'all') {
        if (filters.flags === 'review' && !a.review_required_flag) return false;
        if (filters.flags === 'inflation' && !a.experience_inflation_flag) return false;
        if (filters.flags === 'rapid' && !a.rapid_completion_flag) return false;
        if (filters.flags === 'duplicate' && !a.duplicate_signature_flag) return false;
      }
      if (filters.stage !== 'all' && a.candidate_stage !== filters.stage) return false;
      return true;
    });
  }, [applicants, filters]);

  const exportCSV = () => {
    const headers = ['Full Name', 'Phone', 'Email', 'Lagos Resident', '3MTT Graduate', 'SAIL Alumni', 'Score %', 'Status', 'Candidate Stage', 'Email Sent', 'Email Sent At', 'Registration Completed', 'Registration At', 'Gender', 'State', 'LGA', 'Education', 'Experience', 'Referral Source', 'Date Applied'];
    const rows = filtered.map(a => [
      a.full_name, a.phone, a.email, a.lagos_resident, a.is_3mtt, a.is_sail,
      a.assessment_completed ? Math.round((a.assessment_score / 25) * 100) : '',
      a.status, a.candidate_stage || '',
      a.assessment_email_sent ? 'Yes' : 'No', a.assessment_email_sent_at || '',
      a.registration_completed ? 'Yes' : 'No', a.registration_completed_at || '',
      a.gender, a.state_of_origin, a.current_lga, a.education,
      a.years_experience, a.referral_source, a.created_date || ''
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${(c ?? '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transbill-applicants-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('transbill_admin_token');
    setAuthenticated(false);
  };

  const handleApplicantUpdate = (updated) => {
    queryClient.setQueryData(['applicants'], (old) =>
      old?.map(a => a.id === updated.id ? updated : a) || []
    );
    setSelectedApplicant(updated);
  };

  if (verifying) return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#E2E8E2] border-t-[#2D6A2F] rounded-full animate-spin" />
    </div>
  );

  if (!authenticated) return <AdminLogin onLogin={() => setAuthenticated(true)} />;

  return (
    <div className="min-h-screen bg-[#F8FAF8]">
      <div className="sticky top-0 z-40 bg-white border-b border-[#E2E8E2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TransbillLogo />
            <span className="text-xs font-bold text-[#7A7A8A] bg-[#F8FAF8] px-2 py-0.5 rounded-full">ADMIN</span>
          </div>
          <button onClick={handleLogout} className="text-[#7A7A8A] hover:text-[#1A1A1A] flex items-center gap-1.5 text-sm">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-extrabold text-2xl tracking-[-0.5px] text-[#1A1A1A]">Recruitment Dashboard</h1>
          <button onClick={exportCSV} className="bg-[#3A7D3C] hover:bg-[#4A9A4D] text-white font-semibold text-sm px-5 py-2.5 rounded-full flex items-center gap-2 transition-all">
            <Download className="w-4 h-4" /> Export to CSV
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#E2E8E2] border-t-[#2D6A2F] rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <StatsCards applicants={applicants} />
            <ApplicantFilters filters={filters} setFilters={setFilters} />
            <ApplicantTable applicants={filtered} onSelectApplicant={setSelectedApplicant} />
          </>
        )}
      </div>

      {selectedApplicant && (
        <ApplicantPanel
          applicant={selectedApplicant}
          onClose={() => setSelectedApplicant(null)}
          onUpdate={handleApplicantUpdate}
        />
      )}
    </div>
  );
}
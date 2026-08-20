import React, { useState, useMemo, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AdminLogin from './AdminLogin';
import TransbillLogo from '../components/TransbillLogo';
import StatsCards from '../components/admin/StatsCards';
import ApplicantFilters from '../components/admin/ApplicantFilters';
import ApplicantTable from '../components/admin/ApplicantTable';
import ApplicantPanel from '../components/admin/ApplicantPanel';
import SettingsPanel from '../components/admin/SettingsPanel';
import ScheduleView from './ScheduleView';
import AiInterviewReview from '../components/admin/AiInterviewReview';
import AdminUsersPanel from '../components/admin/AdminUsersPanel';
import InterviewOutcomeDrilldown from '../components/admin/InterviewOutcomeDrilldown';
import { Download, LogOut, Settings, CalendarDays, Mail, Bot, Users, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [adminInfo, setAdminInfo] = useState(null);
  const [showAdminUsers, setShowAdminUsers] = useState(false);
  const [outcomeDrilldown, setOutcomeDrilldown] = useState(null);

  // Verify stored token server-side on every page load
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
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showAiReview, setShowAiReview] = useState(false);
  const [settingsRecord, setSettingsRecord] = useState(null);
  const [sendingReminders, setSendingReminders] = useState(false);
  const [reminderMessage, setReminderMessage] = useState('');
  const [filters, setFilters] = useState({
    search: '', status: 'all', displayStatus: 'all', lagos: 'all', available: 'all', affiliateRole: 'all', score: 'all', flags: 'all', stage: 'all', interviewMode: 'all'
  });
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['applicants'],
    queryFn: async () => {
      const token = sessionStorage.getItem('transbill_admin_token');
      const res = await base44.functions.invoke('adminGetApplicants', { token });
      if (res.data?.error) throw new Error(res.data.error);
      return { applicants: res.data?.applicants || [], interviewResults: res.data?.interviewResults || {} };
    },
    enabled: authenticated,
    retry: false,
  });
  const applicants = data?.applicants || [];
  const interviewResults = data?.interviewResults || {};

  // Load settings when authenticated
  useEffect(() => {
    if (!authenticated) return;
    base44.entities.AppSettings.list().then(records => {
      if (records?.length > 0) setSettingsRecord(records[0]);
    }).catch(() => {});
  }, [authenticated]);

  const filtered = useMemo(() => {
    return applicants.filter(a => {
      const search = filters.search.toLowerCase();
      if (search && !a.full_name?.toLowerCase().includes(search) && !a.email?.toLowerCase().includes(search)) return false;
      if (filters.status !== 'all' && a.status !== filters.status) return false;
      if (filters.lagos !== 'all' && a.lagos_resident !== filters.lagos) return false;
      if (filters.available !== 'all' && a.availability_2_weeks !== filters.available) return false;
      if (filters.affiliateRole !== 'all' && a.willing_affiliate_role !== filters.affiliateRole) return false;
      if (filters.score !== 'all' && !a.assessment_completed) return false;
      if (filters.score !== 'all') {
        const pct = a.assessment_completed ? Math.round((a.assessment_score / (a.assessment_question_count || 25)) * 100) : -1;
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
      if (filters.interviewMode !== 'all' && (a.interview_mode || 'legacy_unspecified') !== filters.interviewMode) return false;
      if (filters.displayStatus !== 'all') {
        const ds = filters.displayStatus;
        if (ds === 'outcome_pass' && a.interview_outcome !== 'Pass') return false;
        if (ds === 'outcome_fail' && a.interview_outcome !== 'Fail') return false;
        if (ds === 'outcome_hold' && a.interview_outcome !== 'Hold') return false;
        if (ds === 'stage_booked' && a.candidate_stage !== 'Interview Scheduled') return false;
        if (ds === 'stage_scheduling' && a.candidate_stage !== 'Interview Scheduling') return false;
        if (ds === 'stage_closed' && a.candidate_stage !== 'Closed – Not Progressed') return false;
        if (['Applied', 'Interview Ready', 'Reserve List', 'Not Progressed'].includes(ds) && a.status !== ds) return false;
      }
      return true;
    }).sort((a, b) => {
      const aTime = a.created_date ? new Date(a.created_date).getTime() : 0;
      const bTime = b.created_date ? new Date(b.created_date).getTime() : 0;
      return bTime - aTime;
    });
  }, [applicants, filters]);

  const drilldownApplicants = useMemo(() => {
    if (!outcomeDrilldown) return [];
    if (outcomeDrilldown === 'total') {
      return applicants.filter(a => ['Pass', 'Fail', 'Hold'].includes(a.interview_outcome));
    }
    return applicants.filter(a => a.interview_outcome === outcomeDrilldown);
  }, [outcomeDrilldown, applicants]);

  const exportCSV = () => {
    const headers = ['Full Name', 'Phone', 'Email', 'Lagos Resident', 'LASRRA ID', 'LASRRA Record Found', 'Employment Status', 'Two-Week Availability', 'Smartphone', 'Laptop', 'Internet', 'Willing Affiliate Role', 'Eligibility', 'Score %', 'Digital', 'Content & Leads', 'Trainability', 'Affiliate Recruitment', 'Performance', 'Recommendation', 'Status', 'Candidate Stage', 'Email Sent', 'Email Sent At', 'Gender', 'State', 'LGA', 'Education', 'Experience', 'Referral Source', 'Date Applied'];
    const rows = filtered.map(a => [
      a.full_name, a.phone, a.email, a.lagos_resident, a.lasrra_id, a.lasrra_verified ? 'Yes' : 'No', a.employment_status, a.availability_2_weeks,
      a.has_smartphone, a.has_laptop, a.internet_access, a.willing_affiliate_role, a.eligibility_status,
      a.assessment_completed ? Math.round((a.assessment_score / (a.assessment_question_count || 25)) * 100) : '',
      a.assessment_category_scores?.digital ?? '', a.assessment_category_scores?.content ?? '',
      a.assessment_category_scores?.learnability ?? '', a.assessment_category_scores?.affiliate ?? '',
      a.assessment_category_scores?.performance ?? '', a.screening_recommendation || '',
      a.status, a.candidate_stage || '',
      a.assessment_email_sent ? 'Yes' : 'No', a.assessment_email_sent_at || '',
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
    if (!confirm('Are you sure you want to log out?')) return;
    sessionStorage.removeItem('transbill_admin_token');
    sessionStorage.removeItem('transbill_admin_info');
    setAuthenticated(false);
    setAdminInfo(null);
  };

  const handleApplicantUpdate = (updated) => {
    queryClient.setQueryData(['applicants'], (old) =>
      old?.map(a => a.id === updated.id ? updated : a) || []
    );
    setSelectedApplicant(updated);
  };

  const sendIncompleteReminders = async () => {
    if (!confirm('Send a reminder email to all incomplete applicants who have not received one in the last 24 hours?')) return;
    setSendingReminders(true);
    setReminderMessage('');
    try {
      const response = await base44.functions.invoke('sendRegistrationReminder', {
        token: sessionStorage.getItem('transbill_admin_token'),
      });
      setReminderMessage(`${response.data.reminders_sent || 0} reminder email(s) sent.`);
    } catch (error) {
      setReminderMessage(error?.response?.data?.error || 'Reminder emails could not be sent.');
    } finally {
      setSendingReminders(false);
    }
  };

  if (verifying) return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#E2E8E2] border-t-[#2D6A2F] rounded-full animate-spin" />
    </div>
  );

  if (!authenticated) return <AdminLogin onLogin={(info) => { setAuthenticated(true); setAdminInfo(info); }} />;

  if (showSchedule) return <ScheduleView onBack={() => setShowSchedule(false)} />;
  if (showAiReview) return <AiInterviewReview onBack={() => setShowAiReview(false)} />;

  return (
    <div className="min-h-screen bg-[#F8FAF8]">
      <div className="sticky top-0 z-40 bg-white border-b border-[#E2E8E2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TransbillLogo />
            <span className="text-xs font-bold text-[#7A7A8A] bg-[#F8FAF8] px-2 py-0.5 rounded-full">ADMIN</span>
            {adminInfo && (
              <div className="hidden sm:flex items-center gap-2 text-xs">
                <span className="text-[#7A7A8A]">{adminInfo.email}</span>
                <span className="bg-[#EBF5EB] text-[#2D6A2F] px-2 py-0.5 rounded-full font-bold uppercase">{adminInfo.role.replace('_', ' ')}</span>
              </div>
            )}
          </div>
          <button onClick={handleLogout} className="text-[#7A7A8A] hover:text-[#1A1A1A] flex items-center gap-1.5 text-sm">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-extrabold text-2xl tracking-[-0.5px] text-[#1A1A1A]">Recruitment Dashboard</h1>
          <div className="flex items-center gap-2">
            <button onClick={sendIncompleteReminders} disabled={sendingReminders} className="border border-[#E2E8E2] text-[#7A7A8A] hover:text-[#1A1A1A] disabled:opacity-50 font-semibold text-sm px-4 py-2.5 rounded-full flex items-center gap-2 transition-all bg-white">
              <Mail className="w-4 h-4" /> {sendingReminders ? 'Sending...' : 'Remind Incomplete'}
            </button>
            <button onClick={() => setShowAiReview(true)} className="bg-[#1565C0] hover:bg-[#0D47A1] text-white font-semibold text-sm px-4 py-2.5 rounded-full flex items-center gap-2 transition-all">
              <Bot className="w-4 h-4" /> Structured Digital Interviews
            </button>
            <Link to="/AdminDashboard" className="bg-[#0B1120] hover:bg-[#1E3A5F] text-white font-semibold text-sm px-4 py-2.5 rounded-full flex items-center gap-2 transition-all">
              <BarChart3 className="w-4 h-4" /> Funnel Dashboard
            </Link>
            <button onClick={() => setShowSchedule(true)} className="border border-[#E2E8E2] text-[#7A7A8A] hover:text-[#1A1A1A] font-semibold text-sm px-4 py-2.5 rounded-full flex items-center gap-2 transition-all bg-white">
              <CalendarDays className="w-4 h-4" /> Schedule
            </button>
            {adminInfo?.role === 'owner' && (
              <Link to="/admin-access" className="border border-[#E2E8E2] text-[#7A7A8A] hover:text-[#1A1A1A] font-semibold text-sm px-4 py-2.5 rounded-full flex items-center gap-2 transition-all bg-white">
                <Users className="w-4 h-4" /> Admin Access
              </Link>
            )}
            <button onClick={() => setShowSettings(true)} className="border border-[#E2E8E2] text-[#7A7A8A] hover:text-[#1A1A1A] font-semibold text-sm px-4 py-2.5 rounded-full flex items-center gap-2 transition-all bg-white">
              <Settings className="w-4 h-4" /> Settings
            </button>
            <button onClick={exportCSV} className="bg-[#3A7D3C] hover:bg-[#4A9A4D] text-white font-semibold text-sm px-5 py-2.5 rounded-full flex items-center gap-2 transition-all">
              <Download className="w-4 h-4" /> Export to CSV
            </button>
          </div>
        </div>

        {reminderMessage && (
          <div className="bg-[#EBF5EB] border border-[#2D6A2F]/30 text-[#245C27] rounded-lg px-4 py-3 text-sm font-medium">
            {reminderMessage}
          </div>
        )}

        {applicants.length >= 9500 && (
          <div className="bg-amber-50 border border-amber-300 text-amber-800 rounded-lg px-4 py-3 text-sm font-medium">
            ⚠ You are approaching the display limit (9,500+ records loaded). Export to CSV to access the full dataset.
          </div>
        )}

        {isError && (
          <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-3 text-sm font-medium">
            Unable to load applicant data. Please refresh the page or check your connection.
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#E2E8E2] border-t-[#2D6A2F] rounded-full animate-spin" />
          </div>
        ) : !isError && (
          <>
            <StatsCards applicants={applicants} onOutcomeClick={setOutcomeDrilldown} />
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
          readOnly={adminInfo?.role === 'read_only'}
        />
      )}

      {outcomeDrilldown && (
        <InterviewOutcomeDrilldown
          title={outcomeDrilldown === 'total' ? 'All Interview Outcomes' : `Interview Outcome: ${outcomeDrilldown}`}
          count={drilldownApplicants.length}
          applicants={drilldownApplicants}
          interviewResults={interviewResults}
          onSelectApplicant={(a) => { setOutcomeDrilldown(null); setSelectedApplicant(a); }}
          onClose={() => setOutcomeDrilldown(null)}
        />
      )}

      {showSettings && (
        <SettingsPanel
          onClose={() => setShowSettings(false)}
          applicants={applicants}
          settingsRecord={settingsRecord}
          onSettingsSaved={(saved) => {
            setSettingsRecord(prev => ({ ...prev, ...saved }));
          }}
        />
      )}

      {showAdminUsers && (
        <AdminUsersPanel onClose={() => setShowAdminUsers(false)} />
      )}
    </div>
  );
}
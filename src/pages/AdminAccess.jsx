import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import FunnelSidebar from '@/components/admin/funnel/FunnelSidebar';
import AdminLogin from './AdminLogin';
import { UserPlus, UserCheck, UserX, Shield, Loader2, AlertCircle, Edit3, X } from 'lucide-react';

const ROLE_LABELS = {
  owner: 'Owner',
  admin: 'Administrator',
  read_only: 'Read Only',
  digital_marketer: 'Digital Marketer',
};

const ROLE_STYLES = {
  owner: 'bg-purple-100 text-purple-700',
  admin: 'bg-blue-100 text-blue-700',
  read_only: 'bg-gray-100 text-gray-600',
  digital_marketer: 'bg-teal-100 text-teal-700',
};

export default function AdminAccess() {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [adminInfo, setAdminInfo] = useState(null);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('digital_marketer');
  const [newNotes, setNewNotes] = useState('');
  const [adding, setAdding] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  // Auth verification
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

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await base44.functions.invoke('adminUserManagement', {
        action: 'list',
        token: sessionStorage.getItem('transbill_admin_token'),
      });
      if (res.data?.users) {
        setUsers(res.data.users);
        setAuditLogs(res.data.auditLogs || []);
      } else {
        setError(res.data?.error || 'Unable to load admin users.');
      }
    } catch (e) {
      setError(e?.response?.data?.error || 'Unable to load admin users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (authenticated) load(); }, [authenticated]);

  const handleLogout = () => {
    if (!confirm('Are you sure you want to log out?')) return;
    sessionStorage.removeItem('transbill_admin_token');
    sessionStorage.removeItem('transbill_admin_info');
    setAuthenticated(false);
    setAdminInfo(null);
  };

  const handleAdd = async () => {
    if (!newEmail.trim()) return;
    setAdding(true);
    setError('');
    try {
      const res = await base44.functions.invoke('adminUserManagement', {
        action: 'add',
        token: sessionStorage.getItem('transbill_admin_token'),
        email: newEmail,
        display_name: newName,
        role: newRole,
        notes: newNotes,
      });
      if (!res.data?.success) {
        setError(res.data?.error || 'Unable to add admin user.');
      } else {
        setNewEmail(''); setNewName(''); setNewRole('digital_marketer'); setNewNotes('');
        await load();
      }
    } catch (e) {
      setError(e?.response?.data?.error || 'Unable to add admin user.');
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (user) => {
    const action = user.active ? 'deactivate' : 'activate';
    const confirmMsg = action === 'deactivate'
      ? `Deactivate ${user.email}? They will lose portal access immediately.`
      : `Re-activate ${user.email}?`;
    if (!confirm(confirmMsg)) return;
    setActionLoading(user.id);
    setError('');
    try {
      const res = await base44.functions.invoke('adminUserManagement', {
        action,
        token: sessionStorage.getItem('transbill_admin_token'),
        email: user.email,
      });
      if (!res.data?.success) {
        setError(res.data?.error || 'Unable to update admin user.');
      } else {
        await load();
      }
    } catch (e) {
      setError(e?.response?.data?.error || 'Unable to update admin user.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveEdit = async (updates) => {
    setActionLoading(editingUser.id);
    setError('');
    try {
      const res = await base44.functions.invoke('adminUserManagement', {
        action: 'edit',
        token: sessionStorage.getItem('transbill_admin_token'),
        email: editingUser.email,
        role: updates.role,
        notes: updates.notes,
      });
      if (!res.data?.success) {
        setError(res.data?.error || 'Unable to update admin user.');
      } else {
        setEditingUser(null);
        await load();
      }
    } catch (e) {
      setError(e?.response?.data?.error || 'Unable to update admin user.');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Render states ──
  if (verifying) return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#F4F6F9]">
      <div className="w-8 h-8 border-4 border-[#E5E7EB] border-t-[#0A2540] rounded-full animate-spin" />
    </div>
  );

  if (!authenticated) return <AdminLogin onLogin={(info) => { setAuthenticated(true); setAdminInfo(info); }} />;

  // Non-owner users cannot access this page
  if (adminInfo?.role !== 'owner') {
    return (
      <div className="min-h-screen bg-[#F4F6F9]">
        <FunnelSidebar adminInfo={adminInfo} onLogout={handleLogout} activePage="access" />
        <div className="lg:pl-[230px]">
          <main className="px-4 sm:px-6 lg:px-10 py-6 max-w-[800px] mx-auto">
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-8 text-center">
              <AlertCircle className="w-10 h-10 text-[#DC2626] mx-auto mb-3" />
              <h2 className="font-bold text-lg text-[#0A2540] mb-1">Owner Access Required</h2>
              <p className="text-sm text-[#6B7280] mb-4">Only owners can manage admin access records.</p>
              <button onClick={() => navigate('/AdminDashboard')} className="text-sm font-semibold text-[#0891B2] hover:text-[#0A2540]">Return to dashboard</button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9]">
      <FunnelSidebar adminInfo={adminInfo} onLogout={handleLogout} activePage="access" />

      <div className="lg:pl-[230px]">
        <main className="px-4 sm:px-6 lg:px-10 py-6 max-w-[900px] mx-auto">
          {/* Header */}
          <div className="mb-5">
            <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-1">Transbill Solutions Limited</p>
            <h1 className="font-extrabold text-2xl sm:text-3xl text-[#0A2540] tracking-tight">Admin Access</h1>
            <p className="text-xs text-[#9CA3AF] mt-1">Manage who can log in to the admin portal and their permissions.</p>
          </div>

          {error && (
            <div className="bg-[#FEF2F2] border border-[#DC2626]/30 text-[#DC2626] rounded-lg px-4 py-3 text-sm font-medium mb-4">
              {error}
            </div>
          )}

          {/* Add new user */}
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 mb-5">
            <h3 className="font-bold text-sm text-[#0A2540] flex items-center gap-2 mb-4"><UserPlus className="w-4 h-4" /> Pre-approve a new access record</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-[10px] font-semibold text-[#6B7280] uppercase mb-1 block">Email</label>
                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="email@example.com"
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm outline-none focus:border-[#0A2540]" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-[#6B7280] uppercase mb-1 block">Display Name (optional)</label>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Jane Doe"
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm outline-none focus:border-[#0A2540]" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-[10px] font-semibold text-[#6B7280] uppercase mb-1 block">Role</label>
                <select value={newRole} onChange={e => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm outline-none focus:border-[#0A2540]">
                  <option value="digital_marketer">Digital Marketer (least privilege)</option>
                  <option value="read_only">Read Only</option>
                  <option value="admin">Administrator</option>
                  <option value="owner">Owner</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-[#6B7280] uppercase mb-1 block">Notes (optional)</label>
                <input type="text" value={newNotes} onChange={e => setNewNotes(e.target.value)} placeholder="Agency partner — Q3 campaign"
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm outline-none focus:border-[#0A2540]" />
              </div>
            </div>
            <button onClick={handleAdd} disabled={adding || !newEmail.trim()}
              className="bg-[#0A2540] hover:bg-[#0F2D4F] disabled:opacity-50 text-white font-semibold text-sm px-5 py-2.5 rounded-full flex items-center gap-2 transition-all">
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />} Add Access
            </button>
          </div>

          {/* User list */}
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#0A2540]" /></div>
          ) : (
            <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden mb-5">
              <h3 className="font-bold text-sm text-[#0A2540] px-5 pt-4 pb-2">Approved Accounts ({users.length})</h3>
              <div className="divide-y divide-[#F4F6F9]">
                {users.map(u => (
                  <div key={u.id} className={`px-5 py-3 flex items-center justify-between gap-3 ${u.active ? '' : 'opacity-60 bg-[#F9FAFB]'}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[#EBF5EB] flex items-center justify-center text-[#0A2540] font-bold text-sm flex-shrink-0">
                        {(u.display_name || u.email)[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-[#0A2540] truncate">{u.display_name || u.email}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${ROLE_STYLES[u.role] || ROLE_STYLES.read_only}`}>{ROLE_LABELS[u.role] || u.role}</span>
                          {!u.active && <span className="text-[10px] text-[#9CA3AF] font-medium">Inactive</span>}
                        </div>
                        <div className="text-xs text-[#6B7280] truncate">{u.email}</div>
                        <div className="text-[10px] text-[#9CA3AF]">
                          Added {u.created_date ? new Date(u.created_date).toLocaleDateString('en-GB', { dateStyle: 'medium' }) : '—'}
                          {u.last_login_at && ` · Last login ${new Date(u.last_login_at).toLocaleDateString('en-GB', { dateStyle: 'medium' })}`}
                        </div>
                        {u.notes && <div className="text-[10px] text-[#6B7280] italic truncate mt-0.5">"{u.notes}"</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => setEditingUser(u)} disabled={actionLoading === u.id}
                        className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[#E5E7EB] hover:bg-[#F4F6F9] disabled:opacity-50 flex items-center gap-1.5 transition-colors">
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                      <button onClick={() => handleToggle(u)} disabled={actionLoading === u.id || u.email === adminInfo.email}
                        className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[#E5E7EB] hover:bg-[#F4F6F9] disabled:opacity-50 flex items-center gap-1.5 transition-colors"
                        title={u.email === adminInfo.email ? 'You cannot deactivate your own account' : ''}>
                        {actionLoading === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : u.active ? <><UserX className="w-3 h-3" /> Deactivate</> : <><UserCheck className="w-3 h-3" /> Activate</>}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audit trail */}
          {auditLogs.length > 0 && (
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-5">
              <h3 className="font-bold text-sm text-[#0A2540] mb-3 flex items-center gap-2"><Shield className="w-4 h-4" /> Audit Trail</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {auditLogs.map(log => (
                  <div key={log.id} className="text-xs text-[#555555] flex items-start gap-2 border-l-2 border-[#E5E7EB] pl-3">
                    <div>
                      <span className="text-[#9CA3AF] whitespace-nowrap">{new Date(log.performed_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}</span>
                      {' — '}
                      <strong>{log.performed_by}</strong> {log.action} <span className="text-[#0A2540] font-medium">{log.target_email}</span>
                      {log.old_role && log.new_role && log.old_role !== log.new_role && ` (${log.old_role} → ${log.new_role})`}
                      {log.old_status && log.new_status && log.old_status !== log.new_status && ` [${log.old_status} → ${log.new_status}]`}
                      {log.details && <span className="text-[#9CA3AF]"> — {log.details}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Edit modal */}
      {editingUser && (
        <EditModal user={editingUser} onSave={handleSaveEdit} onClose={() => setEditingUser(null)} saving={actionLoading === editingUser.id} />
      )}
    </div>
  );
}

function EditModal({ user, onSave, onClose, saving }) {
  const [role, setRole] = useState(user.role);
  const [notes, setNotes] = useState(user.notes || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base text-[#0A2540]">Edit {user.display_name || user.email}</h3>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#0A2540]"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-semibold text-[#6B7280] uppercase mb-1 block">Role</label>
            <select value={role} onChange={e => setRole(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm outline-none focus:border-[#0A2540]">
              <option value="digital_marketer">Digital Marketer</option>
              <option value="read_only">Read Only</option>
              <option value="admin">Administrator</option>
              <option value="owner">Owner</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-[#6B7280] uppercase mb-1 block">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm outline-none focus:border-[#0A2540] resize-none"
              placeholder="Add context about this access record..." />
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 text-sm font-semibold px-4 py-2.5 rounded-full border border-[#E5E7EB] hover:bg-[#F4F6F9]">Cancel</button>
          <button onClick={() => onSave({ role, notes })} disabled={saving}
            className="flex-1 bg-[#0A2540] hover:bg-[#0F2D4F] disabled:opacity-50 text-white font-semibold text-sm px-4 py-2.5 rounded-full">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
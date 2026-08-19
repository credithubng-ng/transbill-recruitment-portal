import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X, UserPlus, UserCheck, UserX, Shield, Loader2 } from 'lucide-react';

export default function AdminUsersPanel({ onClose }) {
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('admin');
  const [adding, setAdding] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

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

  useEffect(() => { load(); }, []);

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
      });
      if (!res.data?.success) {
        setError(res.data?.error || 'Unable to add admin user.');
      } else {
        setNewEmail(''); setNewName(''); setNewRole('admin');
        await load();
      }
    } catch (e) {
      setError(e?.response?.data?.error || 'Unable to add admin user.');
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (user) => {
    setActionLoading(user.id);
    setError('');
    try {
      const action = user.active ? 'deactivate' : 'activate';
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

  const roleBadge = (role) => {
    const styles = {
      owner: 'bg-purple-100 text-purple-700',
      admin: 'bg-blue-100 text-blue-700',
      read_only: 'bg-gray-100 text-gray-600',
    };
    return <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${styles[role] || styles.read_only}`}>{role.replace('_', ' ')}</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white h-full overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white border-b border-[#E2E8E2] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#2D6A2F]" />
            <h2 className="font-bold text-lg text-[#1A1A1A]">Admin Users</h2>
          </div>
          <button onClick={onClose} className="text-[#7A7A8A] hover:text-[#1A1A1A]"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
          )}

          <div className="border border-[#E2E8E2] rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-sm text-[#1A1A1A] flex items-center gap-2"><UserPlus className="w-4 h-4" /> Pre-approve a new admin user</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="email@example.com" className="px-3 py-2 rounded-lg border border-[#E2E8E2] text-sm outline-none focus:border-[#2D6A2F]" />
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Display name (optional)" className="px-3 py-2 rounded-lg border border-[#E2E8E2] text-sm outline-none focus:border-[#2D6A2F]" />
            </div>
            <div className="flex items-center gap-3">
              <select value={newRole} onChange={e => setNewRole(e.target.value)} className="px-3 py-2 rounded-lg border border-[#E2E8E2] text-sm outline-none focus:border-[#2D6A2F]">
                <option value="admin">Admin</option>
                <option value="read_only">Read Only</option>
                <option value="owner">Owner</option>
              </select>
              <button onClick={handleAdd} disabled={adding || !newEmail.trim()} className="bg-[#3A7D3C] hover:bg-[#4A9A4D] disabled:opacity-50 text-white font-semibold text-sm px-4 py-2 rounded-full flex items-center gap-2">
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />} Add User
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#2D6A2F]" /></div>
          ) : (
            <div className="space-y-2">
              {users.map(u => (
                <div key={u.id} className={`border rounded-xl p-3 flex items-center justify-between ${u.active ? 'border-[#E2E8E2] bg-white' : 'border-[#E2E8E2] bg-gray-50 opacity-60'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#EBF5EB] flex items-center justify-center text-[#2D6A2F] font-bold text-sm">
                      {(u.display_name || u.email)[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#1A1A1A]">{u.display_name || u.email}</span>
                        {roleBadge(u.role)}
                        {!u.active && <span className="text-xs text-gray-500 font-medium">Inactive</span>}
                      </div>
                      <div className="text-xs text-[#7A7A8A]">{u.email}</div>
                      {u.last_login_at && <div className="text-xs text-[#7A7A8A]">Last login: {new Date(u.last_login_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</div>}
                    </div>
                  </div>
                  <button onClick={() => handleToggle(u)} disabled={actionLoading === u.id} className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[#E2E8E2] hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1.5">
                    {actionLoading === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : u.active ? <><UserX className="w-3 h-3" /> Deactivate</> : <><UserCheck className="w-3 h-3" /> Activate</>}
                  </button>
                </div>
              ))}
            </div>
          )}

          {auditLogs.length > 0 && (
            <div className="border border-[#E2E8E2] rounded-xl p-4">
              <h3 className="font-semibold text-sm text-[#1A1A1A] mb-3">Recent Activity</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {auditLogs.map(log => (
                  <div key={log.id} className="text-xs text-[#555555] flex items-start gap-2">
                    <span className="text-[#7A7A8A] whitespace-nowrap">{new Date(log.performed_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}</span>
                    <span><strong>{log.performed_by}</strong> {log.action} <span className="text-[#2D6A2F]">{log.target_email}</span> ({log.target_role})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, RefreshCw, UserCheck, UserX, Eye, EyeOff } from 'lucide-react';

export default function AdminUsersPanel() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', display_name: '' });
  const [resetTarget, setResetTarget] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const token = sessionStorage.getItem('transbill_admin_token');

  const fetchAdmins = async () => {
    setLoading(true);
    const res = await base44.functions.invoke('adminAuth', { action: 'list_admins', token });
    setAdmins(res.data?.admins || []);
    setLoading(false);
  };

  useEffect(() => { fetchAdmins(); }, []);

  const flash = (msg, isError = false) => {
    if (isError) setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(''); setSuccess(''); }, 3000);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) { flash('Username and password required', true); return; }
    const res = await base44.functions.invoke('adminAuth', { action: 'create_admin', token, ...form });
    if (res.data?.success) {
      flash('Admin user created');
      setForm({ username: '', password: '', display_name: '' });
      setShowForm(false);
      fetchAdmins();
    } else {
      flash(res.data?.error || 'Failed to create admin', true);
    }
  };

  const toggleActive = async (admin) => {
    await base44.functions.invoke('adminAuth', { action: 'update_admin', token, admin_id: admin.id, is_active: !admin.is_active });
    flash(`${admin.username} ${admin.is_active ? 'disabled' : 'enabled'}`);
    fetchAdmins();
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetPassword) return;
    await base44.functions.invoke('adminAuth', { action: 'update_admin', token, admin_id: resetTarget.id, password: resetPassword });
    flash('Password updated');
    setResetTarget(null);
    setResetPassword('');
  };

  const handleDelete = async (admin) => {
    if (!confirm(`Delete admin "${admin.username}"? This cannot be undone.`)) return;
    await base44.functions.invoke('adminAuth', { action: 'delete_admin', token, admin_id: admin.id });
    flash('Admin deleted');
    fetchAdmins();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[#1A1A1A] text-base">Admin Users</h3>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 bg-[#2D6A2F] hover:bg-[#3A7D3C] text-white text-sm font-semibold px-4 py-2 rounded-full transition-all">
          <Plus className="w-4 h-4" /> New Admin
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2 rounded-lg">{success}</div>}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-[#F8FAF8] border border-[#E2E8E2] rounded-xl p-4 space-y-3">
          <p className="font-semibold text-sm text-[#1A1A1A]">Create New Admin</p>
          <input className="admin-input" placeholder="Username (e.g. john.doe)" value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
          <input className="admin-input" placeholder="Display Name (optional)" value={form.display_name}
            onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))} />
          <div className="relative">
            <input className="admin-input pr-10" type={showPassword ? 'text' : 'password'} placeholder="Password"
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            <button type="button" onClick={() => setShowPassword(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A7A8A]">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-[#2D6A2F] text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-[#3A7D3C] transition-all">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm text-[#7A7A8A] px-4 py-2 rounded-full border border-[#E2E8E2] hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      )}

      {resetTarget && (
        <form onSubmit={handleResetPassword} className="bg-[#FFF8E1] border border-[#FFE082] rounded-xl p-4 space-y-3">
          <p className="font-semibold text-sm text-[#1A1A1A]">Reset Password for <span className="text-[#2D6A2F]">{resetTarget.username}</span></p>
          <input className="admin-input" type="password" placeholder="New Password" value={resetPassword}
            onChange={e => setResetPassword(e.target.value)} />
          <div className="flex gap-2">
            <button type="submit" className="bg-[#2D6A2F] text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-[#3A7D3C] transition-all">Update Password</button>
            <button type="button" onClick={() => { setResetTarget(null); setResetPassword(''); }}
              className="text-sm text-[#7A7A8A] px-4 py-2 rounded-full border border-[#E2E8E2] hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8 text-[#7A7A8A] text-sm">Loading...</div>
      ) : admins.length === 0 ? (
        <div className="text-center py-8 text-[#7A7A8A] text-sm">No admin users yet. Create one above.</div>
      ) : (
        <div className="space-y-2">
          {admins.map(admin => (
            <div key={admin.id} className={`flex items-center justify-between p-3.5 rounded-xl border ${admin.is_active ? 'bg-white border-[#E2E8E2]' : 'bg-gray-50 border-[#E2E8E2] opacity-60'}`}>
              <div>
                <p className="font-semibold text-sm text-[#1A1A1A]">{admin.display_name || admin.username}</p>
                <p className="text-xs text-[#7A7A8A]">@{admin.username} · {admin.is_active ? <span className="text-[#2D6A2F] font-medium">Active</span> : <span className="text-red-500 font-medium">Disabled</span>}</p>
                {admin.last_login_at && (
                  <p className="text-xs text-[#7A7A8A]">Last login: {new Date(admin.last_login_at).toLocaleString('en-NG')}</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setResetTarget(admin)} title="Reset Password"
                  className="p-2 rounded-lg hover:bg-gray-100 text-[#7A7A8A] hover:text-[#1A1A1A] transition-all">
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button onClick={() => toggleActive(admin)} title={admin.is_active ? 'Disable' : 'Enable'}
                  className="p-2 rounded-lg hover:bg-gray-100 text-[#7A7A8A] hover:text-[#1A1A1A] transition-all">
                  {admin.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                </button>
                <button onClick={() => handleDelete(admin)} title="Delete"
                  className="p-2 rounded-lg hover:bg-red-50 text-[#7A7A8A] hover:text-red-600 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .admin-input {
          width: 100%;
          padding: 0.6rem 0.85rem;
          border-radius: 8px;
          border: 1.5px solid #E2E8E2;
          font-size: 0.875rem;
          color: #1A1A1A;
          background: white;
          outline: none;
        }
        .admin-input:focus { border-color: #2D6A2F; }
      `}</style>
    </div>
  );
}
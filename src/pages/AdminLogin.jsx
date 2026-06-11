import React, { useState } from 'react';
import TransbillLogo from '../components/TransbillLogo';
import { base44 } from '@/api/base44Client';

export default function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await base44.functions.invoke('adminAuth', { username, password });
    setLoading(false);
    if (res.data?.success) {
      sessionStorage.setItem('transbill_admin_token', res.data.token);
      sessionStorage.setItem('transbill_admin_name', res.data.display_name || username);
      onLogin();
    } else {
      setError(res.data?.error || 'Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <TransbillLogo />
        </div>
        <div className="bg-[#F8FAF8] border border-[#E2E8E2] rounded-[14px] p-6">
          <h2 className="font-bold text-lg text-[#1A1A1A] text-center mb-1">Admin Access</h2>
          <p className="text-[#7A7A8A] text-sm text-center mb-5">Enter your credentials to continue</p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              value={username}
              onChange={e => { setUsername(e.target.value); setError(''); }}
              placeholder="Username"
              autoComplete="username"
              className="w-full px-4 py-3 rounded-[10px] border-[1.5px] border-[#E2E8E2] focus:border-[#2D6A2F] outline-none text-sm"
            />
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="Password"
              autoComplete="current-password"
              className="w-full px-4 py-3 rounded-[10px] border-[1.5px] border-[#E2E8E2] focus:border-[#2D6A2F] outline-none text-sm"
            />
            {error && <p className="text-[#D32F2F] text-xs font-medium">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-[#3A7D3C] hover:bg-[#4A9A4D] disabled:opacity-60 text-white font-bold py-3 rounded-full transition-all mt-1">
              {loading ? 'Verifying...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
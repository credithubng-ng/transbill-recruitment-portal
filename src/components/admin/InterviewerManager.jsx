import React, { useState, useEffect } from 'react';
import { adminApi } from '@/lib/adminApi';
import { Plus, Trash2, Check, X, Edit2 } from 'lucide-react';

const DAY_OPTIONS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function InterviewerCard({ interviewer, onUpdate, onDelete, weekBookingCount }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...interviewer });
  const [saving, setSaving] = useState(false);
  const [blockedInput, setBlockedInput] = useState('');

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const toggleDay = (day) => {
    const days = form.working_days || [];
    if (days.includes(day)) {
      set('working_days', days.filter(d => d !== day));
    } else {
      set('working_days', [...days, day]);
    }
  };

  const addBlockedDate = () => {
    if (!blockedInput) return;
    const current = form.blocked_dates || [];
    if (!current.includes(blockedInput)) {
      set('blocked_dates', [...current, blockedInput]);
    }
    setBlockedInput('');
  };

  const removeBlockedDate = (d) => {
    set('blocked_dates', (form.blocked_dates || []).filter(x => x !== d));
  };

  const handleSave = async () => {
    setSaving(true);
    await adminApi.update('Interviewer', interviewer.id, form);
    onUpdate({ ...interviewer, ...form });
    setSaving(false);
    setEditing(false);
  };

  const handleToggleActive = async () => {
    const updated = { ...interviewer, is_active: !interviewer.is_active };
    await adminApi.update('Interviewer', interviewer.id, { is_active: !interviewer.is_active });
    onUpdate(updated);
  };

  return (
    <div className={`border rounded-[12px] p-4 bg-white ${interviewer.is_active ? 'border-[#E2E8E2]' : 'border-[#E2E8E2] opacity-60'}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-bold text-[#1A1A1A] text-sm">{interviewer.full_name}</p>
          <p className="text-xs text-[#7A7A8A]">{interviewer.email}</p>
          <p className="text-xs text-[#3A7D3C] font-semibold mt-1">
            {weekBookingCount} interview{weekBookingCount !== 1 ? 's' : ''} this week
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleActive}
            className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${interviewer.is_active ? 'bg-[#EBF5EB] text-[#2D6A2F]' : 'bg-[#F5F5F5] text-[#9E9E9E]'}`}
          >
            {interviewer.is_active ? 'Active' : 'Inactive'}
          </button>
          <button onClick={() => setEditing(v => !v)} className="p-1.5 rounded-lg hover:bg-[#F8FAF8] text-[#7A7A8A]">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(interviewer.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-[#D32F2F]">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!editing && (
        <div className="text-xs text-[#555555] space-y-1">
          <p><span className="text-[#7A7A8A]">Hours:</span> {interviewer.available_from} – {interviewer.available_to}</p>
          <p><span className="text-[#7A7A8A]">Capacity:</span> {interviewer.daily_capacity}/day</p>
          <p><span className="text-[#7A7A8A]">Days:</span> {(interviewer.working_days || []).join(', ') || '—'}</p>
        </div>
      )}

      {editing && (
        <div className="space-y-3 mt-3 border-t border-[#E2E8E2] pt-3">
          <Field label="Full Name">
            <input type="text" value={form.full_name || ''} onChange={e => set('full_name', e.target.value)}
              className="w-full px-3 py-2 rounded-[8px] border-[1.5px] border-[#E2E8E2] focus:border-[#2D6A2F] outline-none text-sm" />
          </Field>
          <Field label="Email">
            <input type="email" value={form.email || ''} onChange={e => set('email', e.target.value)}
              className="w-full px-3 py-2 rounded-[8px] border-[1.5px] border-[#E2E8E2] focus:border-[#2D6A2F] outline-none text-sm" />
          </Field>
          <Field label="Working Days">
            <div className="flex flex-wrap gap-1.5">
              {DAY_OPTIONS.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${
                    (form.working_days || []).includes(day)
                      ? 'bg-[#3A7D3C] text-white border-[#3A7D3C]'
                      : 'bg-white text-[#555555] border-[#E2E8E2] hover:border-[#3A7D3C]'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Available From">
              <input type="time" value={form.available_from || '09:00'} onChange={e => set('available_from', e.target.value)}
                className="w-full px-3 py-2 rounded-[8px] border-[1.5px] border-[#E2E8E2] focus:border-[#2D6A2F] outline-none text-sm" />
            </Field>
            <Field label="Available To">
              <input type="time" value={form.available_to || '17:30'} onChange={e => set('available_to', e.target.value)}
                className="w-full px-3 py-2 rounded-[8px] border-[1.5px] border-[#E2E8E2] focus:border-[#2D6A2F] outline-none text-sm" />
            </Field>
          </div>
          <Field label="Daily Capacity">
            <input type="number" value={form.daily_capacity || 12} onChange={e => set('daily_capacity', Number(e.target.value))}
              className="w-full px-3 py-2 rounded-[8px] border-[1.5px] border-[#E2E8E2] focus:border-[#2D6A2F] outline-none text-sm" />
          </Field>
          <Field label="Blocked Dates">
            <div className="flex gap-2 mb-2">
              <input type="date" value={blockedInput} onChange={e => setBlockedInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-[8px] border-[1.5px] border-[#E2E8E2] focus:border-[#2D6A2F] outline-none text-sm" />
              <button onClick={addBlockedDate} className="px-3 py-2 bg-[#3A7D3C] text-white rounded-[8px] text-sm font-bold">
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(form.blocked_dates || []).map(d => (
                <span key={d} className="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  {d}
                  <button onClick={() => removeBlockedDate(d)}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </Field>
          <div className="flex gap-2 pt-1">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 bg-[#3A7D3C] hover:bg-[#4A9A4D] disabled:opacity-50 text-white font-bold py-2 rounded-full text-sm transition-all">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={() => { setEditing(false); setForm({ ...interviewer }); }}
              className="flex-1 border border-[#E2E8E2] text-[#7A7A8A] font-semibold py-2 rounded-full text-sm hover:text-[#1A1A1A] transition-all">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-semibold text-[#7A7A8A] block mb-1">{label}</label>
      {children}
    </div>
  );
}

export default function InterviewerManager() {
  const [interviewers, setInterviewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weekBookings, setWeekBookings] = useState({});

  useEffect(() => {
    adminApi.list('Interviewer').then((ivs) => {
      setInterviewers(ivs || []);

    }).finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    const created = await adminApi.create('Interviewer', {
      full_name: 'New Interviewer — click edit to update',
      email: 'interviewer@transbill.ng',
      is_active: true,
      working_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      available_from: '09:00',
      available_to: '17:30',
      blocked_dates: [],
      daily_capacity: 12,
    });
    setInterviewers(prev => [...prev, created]);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this interviewer?')) return;
    await adminApi.delete('Interviewer', id);
    setInterviewers(prev => prev.filter(iv => iv.id !== id));
  };

  const handleUpdate = (updated) => {
    setInterviewers(prev => prev.map(iv => iv.id === updated.id ? updated : iv));
  };

  if (loading) return <div className="text-xs text-[#7A7A8A] py-4">Loading interviewers...</div>;

  return (
    <div className="space-y-3">
      {interviewers.map(iv => (
        <InterviewerCard
          key={iv.id}
          interviewer={iv}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          weekBookingCount={weekBookings[iv.id] || 0}
        />
      ))}
      <button onClick={handleAdd}
        className="w-full border-2 border-dashed border-[#E2E8E2] hover:border-[#3A7D3C] text-[#7A7A8A] hover:text-[#3A7D3C] font-semibold text-sm py-3 rounded-[12px] flex items-center justify-center gap-2 transition-all">
        <Plus className="w-4 h-4" /> Add Interviewer
      </button>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Calendar, MapPin, User, Zap, Loader2 } from 'lucide-react';

function formatSlot(iso) {
  return new Date(iso).toLocaleString('en-NG', {
    weekday: 'short', day: 'numeric', month: 'short',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
    hour12: true, timeZone: 'Africa/Lagos'
  });
}

// Lagos timezone offset: UTC+1. All date/time inputs are interpreted as
// Africa/Lagos regardless of the admin's browser-local timezone.
const LAGOS_OFFSET = '+01:00';

// Build an ISO UTC string from a YYYY-MM-DD date + HH:MM time interpreted as Lagos time.
function lagosToUtc(dateStr, timeStr) {
  return new Date(`${dateStr}T${timeStr}:00${LAGOS_OFFSET}`).toISOString();
}

// Iterate YYYY-MM-DD calendar days from dateFrom to dateTo (inclusive).
// Uses Date.UTC for both construction and extraction so the browser's local
// timezone never shifts the calendar day. Never use new Date('YYYY-MM-DD') or
// toISOString().slice(0,10) to derive a civil date — that is the off-by-one root cause.
function eachYmd(dateFrom, dateTo) {
  const [fy, fm, fd] = dateFrom.split('-').map(Number);
  const [ey, em, ed] = dateTo.split('-').map(Number);
  const out = [];
  let ms = Date.UTC(fy, fm - 1, fd);
  const endMs = Date.UTC(ey, em - 1, ed);
  while (ms <= endMs) {
    const dt = new Date(ms);
    out.push(`${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`);
    ms += 86400000;
  }
  return out;
}

// Generate slot objects for all slots in the bulk config across a date range.
// All times are interpreted as Africa/Lagos (UTC+1), not browser-local.
function generateBulkSlots({ dateFrom, dateTo, fromTime, toTime, intervalMins, interviewers, location }) {
  const slots = [];
  const [fH, fM] = fromTime.split(':').map(Number);
  const [tH, tM] = toTime.split(':').map(Number);
  const startMins = fH * 60 + fM;
  const endMins = tH * 60 + tM;
  // No interviewers → one slot per time block with blank interviewer.
  const interviewerList = interviewers.length > 0 ? interviewers : [''];
  for (const dateStr of eachYmd(dateFrom, dateTo)) {
    for (let mins = startMins; mins + intervalMins <= endMins; mins += intervalMins) {
      const h = String(Math.floor(mins / 60)).padStart(2, '0');
      const m = String(mins % 60).padStart(2, '0');
      const iso = lagosToUtc(dateStr, `${h}:${m}`);
      interviewerList.forEach(interviewer => {
        slots.push({ slot_datetime: iso, location, interviewer: interviewer.trim(), is_booked: false });
      });
    }
  }
  return slots;
}

// Validate single slot fields. Returns an error string or null.
function validateSingle(date, time) {
  if (!date) return 'Please select a date.';
  if (!time) return 'Please select a time.';
  const iso = lagosToUtc(date, time);
  if (new Date(iso) <= new Date()) return 'Cannot create a slot in the past. Please choose a future date and time.';
  return null;
}

// Validate bulk fields. Returns an error string or null.
function validateBulk(dateFrom, dateTo, fromTime, toTime, intervalMins, interviewers) {
  if (!dateFrom) return 'Please select a From Date.';
  if (!dateTo) return 'Please select a To Date.';
  if (dateTo < dateFrom) return 'To Date must be on or after From Date.';
  if (!fromTime) return 'Please set a From time.';
  if (!toTime) return 'Please set a To time.';
  const [fH, fM] = fromTime.split(':').map(Number);
  const [tH, tM] = toTime.split(':').map(Number);
  if (fH * 60 + fM >= tH * 60 + tM) return 'To time must be after From time.';
  if (!intervalMins || intervalMins < 1) return 'Interval must be at least 1 minute.';
  const firstIso = lagosToUtc(dateFrom, fromTime);
  if (new Date(firstIso) <= new Date()) return 'The first slot would be in the past. Please choose a future From Date or time.';
  return null;
}

export default function SlotManager() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('single');

  // Single slot state
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newInterviewer, setNewInterviewer] = useState('');
  const [adding, setAdding] = useState(false);
  const [singleError, setSingleError] = useState('');

  // Bulk state
  const [bulkDateFrom, setBulkDateFrom] = useState('');
  const [bulkDateTo, setBulkDateTo] = useState('');
  const [bulkFrom, setBulkFrom] = useState('09:00');
  const [bulkTo, setBulkTo] = useState('17:00');
  const [bulkInterval, setBulkInterval] = useState(30);
  const [bulkInterviewers, setBulkInterviewers] = useState('');
  const [bulkLocation, setBulkLocation] = useState('');
  const [bulkPreview, setBulkPreview] = useState([]);
  const [bulkAdding, setBulkAdding] = useState(false);
  const [bulkError, setBulkError] = useState('');

  // Today's date in Lagos for the min attribute on date inputs.
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' });

  const loadSlots = async () => {
    try {
      const all = await base44.entities.InterviewSlot.list('slot_datetime', 1000);
      setSlots(all);
    } catch (_e) {
      // Load errors don't block the form — slots list stays empty.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSlots(); }, []);

  // Live preview for bulk
  useEffect(() => {
    if (!bulkDateFrom || !bulkDateTo || !bulkFrom || !bulkTo || !bulkInterval) {
      setBulkPreview([]);
      return;
    }
    if (bulkDateTo < bulkDateFrom) { setBulkPreview([]); return; }
    const interviewers = bulkInterviewers.split(',').map(s => s.trim()).filter(Boolean);
    const preview = generateBulkSlots({
      dateFrom: bulkDateFrom, dateTo: bulkDateTo, fromTime: bulkFrom, toTime: bulkTo,
      intervalMins: Number(bulkInterval), interviewers, location: bulkLocation
    });
    setBulkPreview(preview);
  }, [bulkDateFrom, bulkDateTo, bulkFrom, bulkTo, bulkInterval, bulkInterviewers, bulkLocation]);

  const handleAddSingle = async () => {
    const err = validateSingle(newDate, newTime);
    if (err) { setSingleError(err); return; }
    setSingleError('');
    setAdding(true);
    try {
      const res = await base44.functions.invoke('adminSlotManagement', {
        action: 'create',
        token: sessionStorage.getItem('transbill_admin_token'),
        date: newDate, time: newTime,
        interviewer: newInterviewer, location: newLocation,
      });
      if (!res?.data?.success) {
        setSingleError(res?.data?.error || 'Unable to create slot.');
        return;
      }
      setNewDate(''); setNewTime(''); setNewLocation(''); setNewInterviewer('');
      await loadSlots();
    } catch (e) {
      setSingleError(e?.response?.data?.error || e?.message || 'Unable to create slot. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  const handleAddBulk = async () => {
    const err = validateBulk(bulkDateFrom, bulkDateTo, bulkFrom, bulkTo, bulkInterval, bulkInterviewers);
    if (err) { setBulkError(err); return; }
    setBulkError('');
    if (!bulkPreview.length) return;
    setBulkAdding(true);
    try {
      const res = await base44.functions.invoke('adminSlotManagement', {
        action: 'bulkCreate',
        token: sessionStorage.getItem('transbill_admin_token'),
        dateFrom: bulkDateFrom, dateTo: bulkDateTo,
        fromTime: bulkFrom, toTime: bulkTo,
        intervalMins: Number(bulkInterval),
        interviewers: bulkInterviewers, location: bulkLocation,
      });
      if (!res?.data?.success) {
        setBulkError(res?.data?.error || 'Unable to create slots.');
        return;
      }
      setBulkDateFrom(''); setBulkDateTo(''); setBulkFrom('09:00'); setBulkTo('17:00');
      setBulkInterval(30); setBulkInterviewers(''); setBulkLocation('');
      setBulkPreview([]);
      await loadSlots();
    } catch (e) {
      setBulkError(e?.response?.data?.error || e?.message || 'Unable to create slots. Please try again.');
    } finally {
      setBulkAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this slot?')) return;
    try {
      const res = await base44.functions.invoke('adminSlotManagement', {
        action: 'delete',
        token: sessionStorage.getItem('transbill_admin_token'),
        slotId: id,
      });
      if (!res?.data?.success) {
        alert(res?.data?.error || 'Unable to delete slot.');
        return;
      }
      setSlots(s => s.filter(x => x.id !== id));
    } catch (e) {
      alert(e?.response?.data?.error || e?.message || 'Unable to delete slot. Please try again.');
    }
  };

  // Display only current/future slots. A slot that has already started is past.
  // Comparison is by instant (UTC ms); Africa/Lagos is the display timezone.
  const now = Date.now();
  const visibleSlots = slots.filter(s => new Date(s.slot_datetime).getTime() >= now);
  const hiddenCount = slots.length - visibleSlots.length;

  return (
    <div className="space-y-4">
      <div className="bg-[#FFF3E0] border border-[#F57C00]/30 rounded-[10px] p-3">
        <p className="text-xs text-[#BF360C] font-medium">
          <strong>Live Panel Interview Slots.</strong> These slots are for admin-referred live panel interviews only. Structured Digital Interview slots are auto-generated — applicants self-book from the portal.
        </p>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-2">
        <button onClick={() => setMode('single')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${mode === 'single' ? 'bg-[#2D6A2F] text-white' : 'bg-[#F8FAF8] text-[#7A7A8A] border border-[#E2E8E2]'}`}>
          Single Slot
        </button>
        <button onClick={() => setMode('bulk')}
          className={`flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${mode === 'bulk' ? 'bg-[#2D6A2F] text-white' : 'bg-[#F8FAF8] text-[#7A7A8A] border border-[#E2E8E2]'}`}>
          <Zap className="w-3 h-3" /> Bulk Generate
        </button>
      </div>

      {/* Single slot form */}
      {mode === 'single' && (
        <div className="bg-[#F8FAF8] rounded-[10px] p-4 space-y-3 border border-[#E2E8E2]">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-[#7A7A8A] font-medium">Date (Lagos)</label>
              <input type="date" value={newDate} min={todayStr} onChange={e => { setNewDate(e.target.value); setSingleError(''); }}
                className="w-full mt-0.5 px-3 py-2 rounded-lg border border-[#E2E8E2] text-sm focus:border-[#2D6A2F] outline-none" />
            </div>
            <div>
              <label className="text-[10px] text-[#7A7A8A] font-medium">Time (WAT)</label>
              <input type="time" value={newTime} onChange={e => { setNewTime(e.target.value); setSingleError(''); }}
                className="w-full mt-0.5 px-3 py-2 rounded-lg border border-[#E2E8E2] text-sm focus:border-[#2D6A2F] outline-none" />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-[#7A7A8A] font-medium">Interviewer (optional)</label>
            <input type="text" value={newInterviewer} onChange={e => setNewInterviewer(e.target.value)}
              placeholder="e.g. Amaka Obi"
              className="w-full mt-0.5 px-3 py-2 rounded-lg border border-[#E2E8E2] text-sm focus:border-[#2D6A2F] outline-none" />
          </div>
          <div>
            <label className="text-[10px] text-[#7A7A8A] font-medium">Location / Meeting Link (optional)</label>
            <input type="text" value={newLocation} onChange={e => setNewLocation(e.target.value)}
              placeholder="e.g. 5 Broad St or https://meet.google.com/..."
              className="w-full mt-0.5 px-3 py-2 rounded-lg border border-[#E2E8E2] text-sm focus:border-[#2D6A2F] outline-none" />
          </div>
          {singleError && <p className="text-xs text-[#D32F2F] font-medium">{singleError}</p>}
          <button onClick={handleAddSingle} disabled={adding || !newDate || !newTime}
            className="flex items-center gap-2 bg-[#3A7D3C] hover:bg-[#4A9A4D] disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-full transition-all">
            <Plus className="w-4 h-4" /> {adding ? 'Adding...' : 'Add Slot'}
          </button>
        </div>
      )}

      {/* Bulk form */}
      {mode === 'bulk' && (
        <div className="bg-[#F8FAF8] rounded-[10px] p-4 space-y-3 border border-[#E2E8E2]">
          <p className="text-xs text-[#7A7A8A]">Generate many slots at once across a date range. All times are in Lagos time (WAT / UTC+1). One slot per interviewer per time block per day.</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-[#7A7A8A] font-medium">From Date (Lagos)</label>
              <input type="date" value={bulkDateFrom} min={todayStr} onChange={e => { setBulkDateFrom(e.target.value); setBulkError(''); }}
                className="w-full mt-0.5 px-3 py-2 rounded-lg border border-[#E2E8E2] text-sm focus:border-[#2D6A2F] outline-none" />
            </div>
            <div>
              <label className="text-[10px] text-[#7A7A8A] font-medium">To Date (Lagos)</label>
              <input type="date" value={bulkDateTo} min={bulkDateFrom || todayStr} onChange={e => { setBulkDateTo(e.target.value); setBulkError(''); }}
                className="w-full mt-0.5 px-3 py-2 rounded-lg border border-[#E2E8E2] text-sm focus:border-[#2D6A2F] outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-[#7A7A8A] font-medium">From (WAT)</label>
              <input type="time" value={bulkFrom} onChange={e => setBulkFrom(e.target.value)}
                className="w-full mt-0.5 px-3 py-2 rounded-lg border border-[#E2E8E2] text-sm focus:border-[#2D6A2F] outline-none" />
            </div>
            <div>
              <label className="text-[10px] text-[#7A7A8A] font-medium">To (WAT)</label>
              <input type="time" value={bulkTo} onChange={e => setBulkTo(e.target.value)}
                className="w-full mt-0.5 px-3 py-2 rounded-lg border border-[#E2E8E2] text-sm focus:border-[#2D6A2F] outline-none" />
            </div>
            <div>
              <label className="text-[10px] text-[#7A7A8A] font-medium">Interval (mins)</label>
              <select value={bulkInterval} onChange={e => setBulkInterval(Number(e.target.value))}
                className="w-full mt-0.5 px-3 py-2 rounded-lg border border-[#E2E8E2] text-sm focus:border-[#2D6A2F] outline-none bg-white">
                {[15, 20, 30, 45, 60].map(v => <option key={v} value={v}>{v} min</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-[#7A7A8A] font-medium">Interviewers (comma-separated, optional)</label>
            <input type="text" value={bulkInterviewers} onChange={e => setBulkInterviewers(e.target.value)}
              placeholder="e.g. Amaka Obi, Tunde Adeyemi, Chidi Nwosu"
              className="w-full mt-0.5 px-3 py-2 rounded-lg border border-[#E2E8E2] text-sm focus:border-[#2D6A2F] outline-none" />
          </div>
          <div>
            <label className="text-[10px] text-[#7A7A8A] font-medium">Location / Meeting Link (optional, shared)</label>
            <input type="text" value={bulkLocation} onChange={e => setBulkLocation(e.target.value)}
              placeholder="e.g. 5 Broad St, Lagos or https://meet.google.com/..."
              className="w-full mt-0.5 px-3 py-2 rounded-lg border border-[#E2E8E2] text-sm focus:border-[#2D6A2F] outline-none" />
          </div>

          {/* Live preview */}
          {bulkPreview.length > 0 && (
            <div className="bg-white border border-[#E2E8E2] rounded-lg p-3">
              <p className="text-xs font-bold text-[#1A1A1A] mb-2">{bulkPreview.length} slots will be created:</p>
              <div className="max-h-36 overflow-y-auto space-y-1">
                {bulkPreview.map((s, i) => (
                  <div key={i} className="text-[10px] text-[#555555] flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-[#2D6A2F] flex-shrink-0" />
                    {formatSlot(s.slot_datetime)}
                    {s.interviewer && <span className="text-[#7A7A8A]">· {s.interviewer}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {bulkError && <p className="text-xs text-[#D32F2F] font-medium">{bulkError}</p>}

          <button onClick={handleAddBulk} disabled={bulkAdding || bulkPreview.length === 0}
            className="flex items-center gap-2 bg-[#3A7D3C] hover:bg-[#4A9A4D] disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-full transition-all">
            {bulkAdding ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : <><Zap className="w-4 h-4" /> Create {bulkPreview.length} Slots</>}
          </button>
        </div>
      )}

      {/* Slot list — past slots are hidden, not deleted */}
      {loading ? (
        <p className="text-sm text-[#7A7A8A]">Loading slots…</p>
      ) : visibleSlots.length === 0 ? (
        <div className="space-y-1">
          <p className="text-sm text-[#7A7A8A] text-center py-4">{slots.length > 0 ? 'No current or upcoming slots.' : 'No slots created yet.'}</p>
          {hiddenCount > 0 && <p className="text-[10px] text-[#7A7A8A] text-center">Past slots are hidden ({hiddenCount}).</p>}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-[#7A7A8A] font-semibold uppercase tracking-wide">{visibleSlots.length} slot{visibleSlots.length !== 1 ? 's' : ''} upcoming</p>
            {hiddenCount > 0 && <p className="text-[10px] text-[#7A7A8A]">Past slots are hidden ({hiddenCount})</p>}
          </div>
          {visibleSlots.map(slot => (
            <div key={slot.id} className={`flex items-start justify-between p-3 rounded-[10px] border text-sm ${
              slot.is_booked ? 'bg-[#F5F5F5] border-[#E2E8E2] opacity-60' : 'bg-white border-[#E2E8E2]'
            }`}>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-semibold text-[#1A1A1A]">
                  <Calendar className="w-3.5 h-3.5 text-[#2D6A2F]" />
                  {formatSlot(slot.slot_datetime)}
                </div>
                {slot.interviewer && (
                  <div className="flex items-center gap-1.5 text-xs text-[#555555]">
                    <User className="w-3 h-3" /> {slot.interviewer}
                  </div>
                )}
                {slot.location && (
                  <div className="flex items-center gap-1.5 text-xs text-[#7A7A8A]">
                    <MapPin className="w-3 h-3" /> {slot.location}
                  </div>
                )}
                {slot.is_booked && (
                  <span className="text-[10px] font-bold text-[#F57C00] bg-[#FFF3E0] px-2 py-0.5 rounded-full">BOOKED</span>
                )}
              </div>
              {!slot.is_booked && (
                <button onClick={() => handleDelete(slot.id)}
                  className="text-[#7A7A8A] hover:text-[#D32F2F] ml-2 flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
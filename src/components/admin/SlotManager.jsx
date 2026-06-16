import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Calendar, MapPin, User, Zap, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

function formatSlot(iso) {
  return new Date(iso).toLocaleString('en-NG', {
    weekday: 'short', day: 'numeric', month: 'short',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
    hour12: true, timeZone: 'Africa/Lagos'
  });
}

// Generate ISO strings for all slots in the bulk config across a date range
function generateBulkSlots({ dateFrom, dateTo, fromTime, toTime, intervalMins, interviewers, location }) {
  const slots = [];
  const [fH, fM] = fromTime.split(':').map(Number);
  const [tH, tM] = toTime.split(':').map(Number);
  const startMins = fH * 60 + fM;
  const endMins = tH * 60 + tM;

  // Iterate each date in range
  const start = new Date(dateFrom + 'T12:00:00');
  const end = new Date(dateTo + 'T12:00:00');
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().slice(0, 10);
    for (let mins = startMins; mins + intervalMins <= endMins; mins += intervalMins) {
      const h = String(Math.floor(mins / 60)).padStart(2, '0');
      const m = String(mins % 60).padStart(2, '0');
      const iso = new Date(`${dateStr}T${h}:${m}:00`).toISOString();
      interviewers.forEach(interviewer => {
        slots.push({ slot_datetime: iso, location, interviewer: interviewer.trim(), is_booked: false });
      });
    }
  }
  return slots;
}

export default function SlotManager() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('single'); // 'single' | 'bulk'

  // Single slot state
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newInterviewer, setNewInterviewer] = useState('');
  const [adding, setAdding] = useState(false);

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

  const loadSlots = async () => {
    const all = await base44.entities.InterviewSlot.list('slot_datetime', 1000);
    setSlots(all);
    setLoading(false);
  };

  useEffect(() => { loadSlots(); }, []);

  // Live preview for bulk
  useEffect(() => {
    if (!bulkDateFrom || !bulkDateTo || !bulkFrom || !bulkTo || !bulkInterval || !bulkInterviewers.trim()) {
      setBulkPreview([]);
      return;
    }
    if (bulkDateTo < bulkDateFrom) { setBulkPreview([]); return; }
    const interviewers = bulkInterviewers.split(',').map(s => s.trim()).filter(Boolean);
    if (!interviewers.length) { setBulkPreview([]); return; }
    const preview = generateBulkSlots({
      dateFrom: bulkDateFrom, dateTo: bulkDateTo, fromTime: bulkFrom, toTime: bulkTo,
      intervalMins: Number(bulkInterval), interviewers, location: bulkLocation
    });
    setBulkPreview(preview);
  }, [bulkDateFrom, bulkDateTo, bulkFrom, bulkTo, bulkInterval, bulkInterviewers, bulkLocation]);

  const handleAddSingle = async () => {
    if (!newDate || !newTime) return;
    setAdding(true);
    const iso = new Date(`${newDate}T${newTime}:00`).toISOString();
    await base44.entities.InterviewSlot.create({
      slot_datetime: iso, location: newLocation,
      interviewer: newInterviewer, is_booked: false,
    });
    setNewDate(''); setNewTime(''); setNewLocation(''); setNewInterviewer('');
    await loadSlots();
    setAdding(false);
  };

  const handleAddBulk = async () => {
    if (!bulkPreview.length) return;
    setBulkAdding(true);
    await base44.entities.InterviewSlot.bulkCreate(bulkPreview);
    setBulkDateFrom(''); setBulkDateTo(''); setBulkFrom('09:00'); setBulkTo('17:00');
    setBulkInterval(30); setBulkInterviewers(''); setBulkLocation('');
    setBulkPreview([]);
    await loadSlots();
    setBulkAdding(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this slot?')) return;
    await base44.entities.InterviewSlot.delete(id);
    setSlots(s => s.filter(x => x.id !== id));
  };

  return (
    <div className="space-y-4">

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
              <label className="text-[10px] text-[#7A7A8A] font-medium">Date</label>
              <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
                className="w-full mt-0.5 px-3 py-2 rounded-lg border border-[#E2E8E2] text-sm focus:border-[#2D6A2F] outline-none" />
            </div>
            <div>
              <label className="text-[10px] text-[#7A7A8A] font-medium">Time (WAT)</label>
              <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)}
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
          <button onClick={handleAddSingle} disabled={adding || !newDate || !newTime}
            className="flex items-center gap-2 bg-[#3A7D3C] hover:bg-[#4A9A4D] disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-full transition-all">
            <Plus className="w-4 h-4" /> {adding ? 'Adding...' : 'Add Slot'}
          </button>
        </div>
      )}

      {/* Bulk form */}
      {mode === 'bulk' && (
        <div className="bg-[#F8FAF8] rounded-[10px] p-4 space-y-3 border border-[#E2E8E2]">
          <p className="text-xs text-[#7A7A8A]">Generate many slots at once across a date range. One slot per interviewer per time block per day.</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-[#7A7A8A] font-medium">From Date</label>
              <input type="date" value={bulkDateFrom} onChange={e => setBulkDateFrom(e.target.value)}
                className="w-full mt-0.5 px-3 py-2 rounded-lg border border-[#E2E8E2] text-sm focus:border-[#2D6A2F] outline-none" />
            </div>
            <div>
              <label className="text-[10px] text-[#7A7A8A] font-medium">To Date</label>
              <input type="date" value={bulkDateTo} min={bulkDateFrom} onChange={e => setBulkDateTo(e.target.value)}
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
            <label className="text-[10px] text-[#7A7A8A] font-medium">Interviewers (comma-separated)</label>
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

          <button onClick={handleAddBulk} disabled={bulkAdding || bulkPreview.length === 0}
            className="flex items-center gap-2 bg-[#3A7D3C] hover:bg-[#4A9A4D] disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-full transition-all">
            {bulkAdding ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : <><Zap className="w-4 h-4" /> Create {bulkPreview.length} Slots</>}
          </button>
        </div>
      )}

      {/* Slot list */}
      {loading ? (
        <p className="text-sm text-[#7A7A8A]">Loading slots…</p>
      ) : slots.length === 0 ? (
        <p className="text-sm text-[#7A7A8A] text-center py-4">No slots created yet.</p>
      ) : (
        <div className="space-y-2">
          <p className="text-[10px] text-[#7A7A8A] font-semibold uppercase tracking-wide">{slots.length} slot{slots.length !== 1 ? 's' : ''} total</p>
          {slots.map(slot => (
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
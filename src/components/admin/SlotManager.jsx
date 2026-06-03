import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Calendar, MapPin } from 'lucide-react';

export default function SlotManager() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [adding, setAdding] = useState(false);

  const loadSlots = async () => {
    const all = await base44.entities.InterviewSlot.list('slot_datetime', 1000);
    setSlots(all);
    setLoading(false);
  };

  useEffect(() => { loadSlots(); }, []);

  const handleAdd = async () => {
    if (!newDate || !newTime) return;
    setAdding(true);
    const iso = new Date(`${newDate}T${newTime}:00`).toISOString();
    await base44.entities.InterviewSlot.create({
      slot_datetime: iso,
      location: newLocation,
      is_booked: false,
    });
    setNewDate('');
    setNewTime('');
    setNewLocation('');
    await loadSlots();
    setAdding(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this slot?')) return;
    await base44.entities.InterviewSlot.delete(id);
    setSlots(s => s.filter(x => x.id !== id));
  };

  const format = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString('en-NG', {
      weekday: 'short', day: 'numeric', month: 'short',
      year: 'numeric', hour: '2-digit', minute: '2-digit',
      hour12: true, timeZone: 'Africa/Lagos'
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-[#7A7A8A] uppercase tracking-wide">Interview Slots</p>

      {/* Add new slot */}
      <div className="bg-[#F8FAF8] rounded-[10px] p-4 space-y-3 border border-[#E2E8E2]">
        <p className="text-xs font-semibold text-[#1A1A1A]">Add New Slot</p>
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
          <label className="text-[10px] text-[#7A7A8A] font-medium">Location / Meeting Link (optional)</label>
          <input type="text" value={newLocation} onChange={e => setNewLocation(e.target.value)}
            placeholder="e.g. 5 Broad St, Lagos or https://meet.google.com/..."
            className="w-full mt-0.5 px-3 py-2 rounded-lg border border-[#E2E8E2] text-sm focus:border-[#2D6A2F] outline-none" />
        </div>
        <button onClick={handleAdd} disabled={adding || !newDate || !newTime}
          className="flex items-center gap-2 bg-[#3A7D3C] hover:bg-[#4A9A4D] disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-full transition-all">
          <Plus className="w-4 h-4" /> {adding ? 'Adding...' : 'Add Slot'}
        </button>
      </div>

      {/* Slot list */}
      {loading ? (
        <p className="text-sm text-[#7A7A8A]">Loading slots…</p>
      ) : slots.length === 0 ? (
        <p className="text-sm text-[#7A7A8A] text-center py-4">No slots created yet.</p>
      ) : (
        <div className="space-y-2">
          {slots.map(slot => (
            <div key={slot.id} className={`flex items-start justify-between p-3 rounded-[10px] border text-sm ${
              slot.is_booked ? 'bg-[#F5F5F5] border-[#E2E8E2] opacity-60' : 'bg-white border-[#E2E8E2]'
            }`}>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-semibold text-[#1A1A1A]">
                  <Calendar className="w-3.5 h-3.5 text-[#2D6A2F]" />
                  {format(slot.slot_datetime)}
                </div>
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
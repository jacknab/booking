import { useState, useEffect } from 'react';
import { supabase, BusinessHours } from '../lib/supabase';
import { getDayName, formatTime } from '../lib/businessHours';
import { X, Edit2, Save, ArrowLeft } from 'lucide-react';

interface AdminPanelProps {
  onClose: () => void;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [hours, setHours] = useState<BusinessHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    opens_at: '',
    closes_at: '',
    is_closed: false,
  });

  useEffect(() => {
    fetchHours();
  }, []);

  const fetchHours = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('business_hours')
      .select('*')
      .order('day_of_week', { ascending: true });

    if (error) {
      console.error('Error fetching hours:', error);
    } else {
      setHours(data || []);
    }
    setLoading(false);
  };

  const handleEdit = (hour: BusinessHours) => {
    setEditingDay(hour.day_of_week);
    setFormData({
      opens_at: hour.opens_at || '',
      closes_at: hour.closes_at || '',
      is_closed: hour.is_closed,
    });
  };

  const handleSave = async () => {
    if (editingDay === null) return;

    setSaving(true);
    const { error } = await supabase
      .from('business_hours')
      .update({
        opens_at: formData.is_closed ? null : formData.opens_at,
        closes_at: formData.is_closed ? null : formData.closes_at,
        is_closed: formData.is_closed,
        updated_at: new Date().toISOString(),
      })
      .eq('day_of_week', editingDay);

    if (error) {
      console.error('Error saving hours:', error);
      alert('Error saving hours');
    } else {
      await fetchHours();
      setEditingDay(null);
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setEditingDay(null);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
          <p className="text-stone-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-stone-900 text-white px-8 py-6 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="hover:bg-stone-800 p-2 rounded-lg transition"
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-2xl font-black">Business Hours</h2>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-stone-800 p-2 rounded-lg transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-4">
          {hours.map(hour => (
            <div key={hour.day_of_week} className="border border-stone-200 rounded-xl p-6">
              {editingDay === hour.day_of_week ? (
                // Edit mode
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-stone-900">{getDayName(hour.day_of_week)}</h3>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_closed}
                      onChange={e => setFormData({ ...formData, is_closed: e.target.checked })}
                      className="w-5 h-5 rounded border-stone-300 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-stone-700">Closed this day</span>
                  </label>

                  {!formData.is_closed && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-2">Opens at</label>
                        <input
                          type="time"
                          value={formData.opens_at}
                          onChange={e => setFormData({ ...formData, opens_at: e.target.value })}
                          className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-2">Closes at</label>
                        <input
                          type="time"
                          value={formData.closes_at}
                          onChange={e => setFormData({ ...formData, closes_at: e.target.value })}
                          className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-900 font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="flex-1 bg-stone-100 hover:bg-stone-200 disabled:opacity-50 text-stone-900 font-semibold py-2.5 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View mode
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-stone-900">{getDayName(hour.day_of_week)}</h3>
                    {hour.is_closed ? (
                      <p className="text-sm text-red-600 font-medium mt-1">Closed</p>
                    ) : hour.opens_at && hour.closes_at ? (
                      <p className="text-sm text-stone-600 mt-1">
                        {formatTime(hour.opens_at)} – {formatTime(hour.closes_at)}
                      </p>
                    ) : (
                      <p className="text-sm text-stone-400 mt-1">No hours set</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleEdit(hour)}
                    className="bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-700 p-3 rounded-lg transition"
                    aria-label="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-stone-200 px-8 py-4 bg-stone-50">
          <button
            onClick={onClose}
            className="w-full bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3 rounded-lg transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

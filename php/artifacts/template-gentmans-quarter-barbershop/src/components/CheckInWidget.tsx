import { useState, useEffect } from 'react';
import { CheckInFormData, Service, Barber, QueueEntry } from '../lib/types';
import { getServices, getBarbers, checkIn, getQueueStatus, cancelCheckIn } from '../lib/api';
import { Theme } from '../lib/themes';
import { Clock, Users, Phone, User, Scissors, ChevronDown, Check, X, AlertCircle } from 'lucide-react';

interface Props {
  theme: Theme;
}

export default function CheckInWidget({ theme }: Props) {
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [step, setStep] = useState<'form' | 'confirming' | 'success' | 'status'>('form');
  const [formData, setFormData] = useState<CheckInFormData>({
    customer_name: '', customer_phone: '', party_size: 1, service_id: '', preferred_barber: '',
  });
  const [queueEntry, setQueueEntry] = useState<QueueEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusPhone, setStatusPhone] = useState('');
  const [statusResult, setStatusResult] = useState<QueueEntry | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [svc, brb] = await Promise.all([getServices(), getBarbers()]);
      setServices(svc); setBarbers(brb);
    } catch (e) { console.error('Failed to load data', e); }
  }

  async function handleSubmit() {
    if (!formData.customer_name.trim() || !formData.customer_phone.trim()) { setError('Please fill in your name and phone number.'); return; }
    if (!formData.service_id) { setError('Please select a service.'); return; }
    setError(''); setStep('confirming');
  }

  async function confirmCheckIn() {
    setLoading(true); setError('');
    try {
      const entry = await checkIn(formData);
      setQueueEntry(entry); setStep('success');
    } catch { setError('Something went wrong. Please try again.'); setStep('form'); }
    finally { setLoading(false); }
  }

  async function handleStatusCheck() {
    if (!statusPhone.trim()) return;
    setLoading(true);
    try { const result = await getQueueStatus(statusPhone); setStatusResult(result); }
    catch { setError('Could not check status.'); }
    finally { setLoading(false); }
  }

  async function handleCancelCheckIn() {
    if (!statusResult) return;
    setLoading(true);
    try { await cancelCheckIn(statusResult.id); setStatusResult(null); setStatusPhone(''); }
    catch { setError('Could not cancel.'); }
    finally { setLoading(false); }
  }

  function resetForm() {
    setStep('form'); setQueueEntry(null);
    setFormData({ customer_name: '', customer_phone: '', party_size: 1, service_id: '', preferred_barber: '' });
    setError('');
  }

  const c = theme.colors;
  const categories = [...new Set(services.map(s => s.category))];

  return (
    <div id="checkin" className="py-20 px-4" style={{ backgroundColor: c.checkinBg }}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: c.text, fontFamily: theme.fonts.heading }}>Join the Queue</h2>
          <p className="text-lg" style={{ color: c.textSecondary, fontFamily: theme.fonts.body }}>
            Skip the wait. Check in from anywhere and we'll let you know when it's almost your turn.
          </p>
        </div>

        <div className="flex mb-8 rounded-lg overflow-hidden" style={{ border: `1px solid ${c.border}` }}>
          {step !== 'status' ? (
            <button className="flex-1 py-3 text-center font-semibold text-sm transition-all" style={{ backgroundColor: c.accent, color: c.badgeText, fontFamily: theme.fonts.body }}>Check In</button>
          ) : (
            <button onClick={() => { setStep('form'); setError(''); }} className="flex-1 py-3 text-center font-semibold text-sm transition-all" style={{ backgroundColor: 'transparent', color: c.textSecondary, fontFamily: theme.fonts.body }}>Check In</button>
          )}
          {step === 'status' ? (
            <button className="flex-1 py-3 text-center font-semibold text-sm transition-all" style={{ backgroundColor: c.accent, color: c.badgeText, fontFamily: theme.fonts.body }}>Check Status</button>
          ) : (
            <button onClick={() => { setStep('status'); setError(''); }} className="flex-1 py-3 text-center font-semibold text-sm transition-all" style={{ backgroundColor: 'transparent', color: c.textSecondary, fontFamily: theme.fonts.body }}>Check Status</button>
          )}
        </div>

        {(step === 'form' || step === 'confirming') && (
          <div className="rounded-2xl p-6 md:p-8" style={{ backgroundColor: c.checkinCard, border: `1px solid ${c.border}` }}>
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2" style={{ color: c.text, fontFamily: theme.fonts.body }}><User size={14} className="inline mr-1" /> Your Name</label>
              <input type="text" value={formData.customer_name} onChange={e => setFormData({ ...formData, customer_name: e.target.value })} placeholder="Enter your name" className="w-full px-4 py-3 rounded-lg text-base outline-none transition-all" style={{ backgroundColor: c.bgSecondary, color: c.text, border: `1px solid ${c.border}`, fontFamily: theme.fonts.body }} />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2" style={{ color: c.text, fontFamily: theme.fonts.body }}><Phone size={14} className="inline mr-1" /> Phone Number</label>
              <input type="tel" value={formData.customer_phone} onChange={e => setFormData({ ...formData, customer_phone: e.target.value })} placeholder="(555) 123-4567" className="w-full px-4 py-3 rounded-lg text-base outline-none transition-all" style={{ backgroundColor: c.bgSecondary, color: c.text, border: `1px solid ${c.border}`, fontFamily: theme.fonts.body }} />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2" style={{ color: c.text, fontFamily: theme.fonts.body }}><Users size={14} className="inline mr-1" /> Party Size</label>
              <div className="flex gap-3">
                {[1, 2, 3, 4].map(n => (
                  <button key={n} onClick={() => setFormData({ ...formData, party_size: n })} className="w-12 h-12 rounded-lg font-semibold transition-all" style={{ backgroundColor: formData.party_size === n ? c.accent : c.bgSecondary, color: formData.party_size === n ? c.badgeText : c.textSecondary, border: `1px solid ${formData.party_size === n ? c.accent : c.border}`, fontFamily: theme.fonts.body }}>{n}</button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2" style={{ color: c.text, fontFamily: theme.fonts.body }}><Scissors size={14} className="inline mr-1" /> Select Service</label>
              {categories.map(cat => (
                <div key={cat} className="mb-4">
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: c.accent, fontFamily: theme.fonts.body }}>{cat}</p>
                  <div className="space-y-2">
                    {services.filter(s => s.category === cat).map(svc => (
                      <button key={svc.id} onClick={() => setFormData({ ...formData, service_id: svc.id })} className="w-full text-left px-4 py-3 rounded-lg transition-all flex justify-between items-center" style={{ backgroundColor: formData.service_id === svc.id ? c.accentLight : c.bgSecondary, border: `1px solid ${formData.service_id === svc.id ? c.accent : c.border}`, fontFamily: theme.fonts.body }}>
                        <div><span className="font-semibold text-sm" style={{ color: c.text }}>{svc.name}</span><span className="text-xs ml-2" style={{ color: c.textSecondary }}>{svc.duration_minutes} min</span></div>
                        <span className="font-bold" style={{ color: c.priceTag }}>${svc.price.toFixed(2)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2" style={{ color: c.text, fontFamily: theme.fonts.body }}><ChevronDown size={14} className="inline mr-1" /> Preferred Barber (Optional)</label>
              <select value={formData.preferred_barber} onChange={e => setFormData({ ...formData, preferred_barber: e.target.value })} className="w-full px-4 py-3 rounded-lg text-base outline-none" style={{ backgroundColor: c.bgSecondary, color: c.text, border: `1px solid ${c.border}`, fontFamily: theme.fonts.body }}>
                <option value="">No preference / First available</option>
                {barbers.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
              </select>
            </div>
            {error && <div className="mb-4 flex items-center gap-2 text-sm" style={{ color: '#ef4444', fontFamily: theme.fonts.body }}><AlertCircle size={16} /> {error}</div>}
            {step === 'form' && (
              <button onClick={handleSubmit} className="w-full py-4 rounded-lg font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98]" style={{ backgroundColor: c.buttonPrimary, color: c.badgeText, fontFamily: theme.fonts.heading }}>Check In Now</button>
            )}
            {step === 'confirming' && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: c.accentLight, border: `1px solid ${c.accent}` }}>
                  <p className="font-semibold mb-1" style={{ color: c.text, fontFamily: theme.fonts.body }}>Confirm your check-in:</p>
                  <p className="text-sm" style={{ color: c.textSecondary, fontFamily: theme.fonts.body }}>Name: {formData.customer_name} | Phone: {formData.customer_phone} | Party: {formData.party_size}</p>
                  <p className="text-sm" style={{ color: c.textSecondary, fontFamily: theme.fonts.body }}>Service: {services.find(s => s.id === formData.service_id)?.name}{formData.preferred_barber ? ` | Barber: ${formData.preferred_barber}` : ''}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep('form')} className="flex-1 py-3 rounded-lg font-semibold transition-all" style={{ backgroundColor: c.bgSecondary, color: c.text, border: `1px solid ${c.border}`, fontFamily: theme.fonts.body }}>Go Back</button>
                  <button onClick={confirmCheckIn} disabled={loading} className="flex-1 py-3 rounded-lg font-bold transition-all hover:scale-[1.02] disabled:opacity-50" style={{ backgroundColor: c.buttonPrimary, color: c.badgeText, fontFamily: theme.fonts.heading }}>{loading ? 'Checking In...' : 'Confirm Check-In'}</button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'success' && queueEntry && (
          <div className="rounded-2xl p-6 md:p-8 text-center" style={{ backgroundColor: c.checkinCard, border: `1px solid ${c.accent}` }}>
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: c.accent }}><Check size={32} style={{ color: c.badgeText }} /></div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: c.text, fontFamily: theme.fonts.heading }}>You're Checked In!</h3>
            <p className="mb-6" style={{ color: c.textSecondary, fontFamily: theme.fonts.body }}>We'll text you when it's almost your turn.</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-lg" style={{ backgroundColor: c.bgSecondary }}>
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: c.textSecondary, fontFamily: theme.fonts.body }}>Position in Queue</p>
                <p className="text-3xl font-bold" style={{ color: c.accent, fontFamily: theme.fonts.heading }}>#{queueEntry.position}</p>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: c.bgSecondary }}>
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: c.textSecondary, fontFamily: theme.fonts.body }}>Estimated Wait</p>
                <p className="text-3xl font-bold" style={{ color: c.accent, fontFamily: theme.fonts.heading }}>{queueEntry.estimated_wait_minutes} min</p>
              </div>
            </div>
            <div className="mb-6">
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: c.bgSecondary }}>
                <div className="h-full rounded-full transition-all" style={{ backgroundColor: c.accent, width: `${Math.max(5, 100 - (queueEntry.position * 15))}%` }} />
              </div>
              <p className="text-xs mt-2" style={{ color: c.textSecondary, fontFamily: theme.fonts.body }}><Clock size={12} className="inline mr-1" />We'll notify you ~15 minutes before your turn</p>
            </div>
            <button onClick={resetForm} className="w-full py-3 rounded-lg font-semibold transition-all" style={{ backgroundColor: c.bgSecondary, color: c.text, border: `1px solid ${c.border}`, fontFamily: theme.fonts.body }}>Check In Another Person</button>
          </div>
        )}

        {step === 'status' && (
          <div className="rounded-2xl p-6 md:p-8" style={{ backgroundColor: c.checkinCard, border: `1px solid ${c.border}` }}>
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2" style={{ color: c.text, fontFamily: theme.fonts.body }}><Phone size={14} className="inline mr-1" /> Enter your phone number</label>
              <div className="flex gap-3">
                <input type="tel" value={statusPhone} onChange={e => setStatusPhone(e.target.value)} placeholder="(555) 123-4567" className="flex-1 px-4 py-3 rounded-lg text-base outline-none" style={{ backgroundColor: c.bgSecondary, color: c.text, border: `1px solid ${c.border}`, fontFamily: theme.fonts.body }} />
                <button onClick={handleStatusCheck} disabled={loading} className="px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50" style={{ backgroundColor: c.buttonPrimary, color: c.badgeText, fontFamily: theme.fonts.body }}>{loading ? '...' : 'Check'}</button>
              </div>
            </div>
            {statusResult && (
              <div className="p-4 rounded-lg" style={{ backgroundColor: c.accentLight, border: `1px solid ${c.accent}` }}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold" style={{ color: c.text, fontFamily: theme.fonts.heading }}>{statusResult.customer_name}</p>
                    <p className="text-sm" style={{ color: c.textSecondary, fontFamily: theme.fonts.body }}>Status: <span className="font-semibold" style={{ color: c.accent }}>{statusResult.status}</span></p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: c.badge, color: c.badgeText, fontFamily: theme.fonts.body }}>#{statusResult.position}</span>
                </div>
                <div className="flex items-center gap-2 mb-3"><Clock size={14} style={{ color: c.accent }} /><span className="text-sm" style={{ color: c.text, fontFamily: theme.fonts.body }}>Estimated wait: {statusResult.estimated_wait_minutes} min</span></div>
                <div className="h-2 rounded-full overflow-hidden mb-3" style={{ backgroundColor: c.bgSecondary }}>
                  <div className="h-full rounded-full transition-all" style={{ backgroundColor: c.accent, width: `${Math.max(5, 100 - (statusResult.position * 15))}%` }} />
                </div>
                <button onClick={handleCancelCheckIn} disabled={loading} className="flex items-center gap-2 text-sm font-semibold transition-all disabled:opacity-50" style={{ color: '#ef4444', fontFamily: theme.fonts.body }}><X size={14} /> Cancel Check-In</button>
              </div>
            )}
            {statusResult === null && statusPhone && !loading && (
              <p className="text-center text-sm" style={{ color: c.textSecondary, fontFamily: theme.fonts.body }}>No active check-in found for this phone number.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

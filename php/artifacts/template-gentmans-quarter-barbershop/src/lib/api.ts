import { supabase } from './supabase';
import { CheckInFormData, QueueEntry, Service, Barber } from './types';

export async function getServices(): Promise<Service[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch { return []; }
}

export async function getBarbers(): Promise<Barber[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('barbers')
      .select('*')
      .eq('is_active', true);
    if (error) throw error;
    return data || [];
  } catch { return []; }
}

export async function getQueueCount(): Promise<number> {
  if (!supabase) return 0;
  try {
    const { count, error } = await supabase
      .from('queue_entries')
      .select('*', { count: 'exact', head: true })
      .in('status', ['waiting', 'notified']);
    if (error) throw error;
    return count || 0;
  } catch { return 0; }
}

export async function checkIn(formData: CheckInFormData): Promise<QueueEntry> {
  if (!supabase) throw new Error('Database not configured');
  const queueCount = await getQueueCount();
  const avgWait = 25;
  const { data, error } = await supabase
    .from('queue_entries')
    .insert({
      customer_name: formData.customer_name,
      customer_phone: formData.customer_phone,
      party_size: formData.party_size,
      service_id: formData.service_id || null,
      preferred_barber: formData.preferred_barber || null,
      status: 'waiting',
      position: queueCount + 1,
      estimated_wait_minutes: (queueCount + 1) * avgWait,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getQueueStatus(phone: string): Promise<QueueEntry | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('queue_entries')
      .select('*')
      .eq('customer_phone', phone)
      .in('status', ['waiting', 'notified'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch { return null; }
}

export async function cancelCheckIn(id: string): Promise<void> {
  if (!supabase) throw new Error('Database not configured');
  const { error } = await supabase
    .from('queue_entries')
    .update({ status: 'cancelled' })
    .eq('id', id);
  if (error) throw error;
}

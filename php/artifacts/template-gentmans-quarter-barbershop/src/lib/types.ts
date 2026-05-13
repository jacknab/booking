export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  category: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface QueueEntry {
  id: string;
  customer_name: string;
  customer_phone: string;
  party_size: number;
  service_id: string;
  preferred_barber: string;
  status: 'waiting' | 'notified' | 'serving' | 'completed' | 'cancelled';
  position: number;
  estimated_wait_minutes: number;
  notified_at: string | null;
  served_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface Barber {
  id: string;
  name: string;
  is_active: boolean;
  current_service_id: string | null;
  created_at: string;
}

export interface CheckInFormData {
  customer_name: string;
  customer_phone: string;
  party_size: number;
  service_id: string;
  preferred_barber: string;
}

export const BUSINESS = {
  name: "The Gentleman's Quarter",
  tagline: 'Where Tradition Meets Precision',
  phone: '(555) 234-5678',
  email: 'info@gentlemansquarter.com',
  address: '142 Main Street, Downtown',
  hours: {
    weekdays: '9:00 AM - 7:00 PM',
    saturday: '8:00 AM - 6:00 PM',
    sunday: '10:00 AM - 4:00 PM',
  },
  social: {
    instagram: '@gentlemansquarter',
    facebook: 'gentlemansquarter',
  },
  established: 2015,
};

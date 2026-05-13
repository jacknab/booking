import { BusinessHours } from './supabase';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function getDayName(dayOfWeek: number): string {
  return DAY_NAMES[dayOfWeek] || 'Unknown';
}

export function formatTime(time: string | null): string {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const minute = minutes;
  const ampm = hour >= 12 ? 'pm' : 'am';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minute}${ampm}`;
}

export function getBusinessStatus(hours: BusinessHours[]): {
  isOpen: boolean;
  message: string;
  nextOpenTime?: string;
  closingTime?: string;
} {
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0') + ':' + now.getSeconds().toString().padStart(2, '0');

  const todayHours = hours.find(h => h.day_of_week === currentDay);

  if (!todayHours || todayHours.is_closed) {
    return {
      isOpen: false,
      message: 'Closed',
    };
  }

  if (!todayHours.opens_at || !todayHours.closes_at) {
    return {
      isOpen: false,
      message: 'Closed',
    };
  }

  const isOpen = currentTime >= todayHours.opens_at && currentTime < todayHours.closes_at;

  if (isOpen) {
    return {
      isOpen: true,
      message: `Open · Closes ${formatTime(todayHours.closes_at)}`,
      closingTime: todayHours.closes_at,
    };
  } else if (currentTime < todayHours.opens_at) {
    return {
      isOpen: false,
      message: `Closed · Opens ${formatTime(todayHours.opens_at)}`,
      nextOpenTime: todayHours.opens_at,
    };
  } else {
    return {
      isOpen: false,
      message: 'Closed',
    };
  }
}

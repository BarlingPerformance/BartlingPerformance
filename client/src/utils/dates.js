import {
  format,
  parseISO,
  isValid,
  startOfDay,
  endOfDay,
  addDays,
  isSameDay,
} from 'date-fns';
import { de } from 'date-fns/locale';

export function toDate(value) {
  if (value instanceof Date) return value;
  const d = parseISO(value);
  return isValid(d) ? d : new Date(value);
}

export function formatDateTime(value) {
  const d = toDate(value);
  if (!isValid(d)) return '-';
  return format(d, 'dd.MM.yyyy HH:mm', { locale: de });
}

export function formatDate(value) {
  const d = toDate(value);
  if (!isValid(d)) return '-';
  return format(d, 'dd.MM.yyyy', { locale: de });
}

export function formatTime(value) {
  const d = toDate(value);
  if (!isValid(d)) return '-';
  return format(d, 'HH:mm', { locale: de });
}

export function formatPrice(value) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
}

export { startOfDay, endOfDay, addDays, isSameDay };

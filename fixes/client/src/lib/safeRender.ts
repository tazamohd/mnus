/**
 * SALIS AUTO - Safe Render Utilities
 * 
 * FIXES APPLIED:
 * - [F2] Prevents "Objects are not valid as a React child" crash
 * - The Appointments page was crashing because vehicle info (an object)
 *   was being rendered directly in JSX
 * - These utilities safely convert any value to a displayable string
 */

/**
 * Safely convert any value to a displayable string.
 * Prevents React crash when an object/array is accidentally rendered as a child.
 * 
 * Usage: <td>{safeDisplay(appointment.vehicle)}</td>
 */
export function safeDisplay(value: any, fallback: string = '—'): string {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') return value || fallback;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  
  // Handle Date objects
  if (value instanceof Date) {
    return value.toLocaleDateString();
  }

  // Handle vehicle-like objects (common crash source)
  if (typeof value === 'object') {
    // Try common display patterns
    if (value.displayName) return value.displayName;
    if (value.name) return value.name;
    if (value.make && value.model) {
      return `${value.year || ''} ${value.make} ${value.model}`.trim();
    }
    if (value.label) return value.label;
    if (value.title) return value.title;
    if (value.fullName) return value.fullName;
    if (value.firstName && value.lastName) return `${value.firstName} ${value.lastName}`;

    // Last resort: JSON stringify (truncated)
    try {
      const json = JSON.stringify(value);
      return json.length > 50 ? json.substring(0, 47) + '...' : json;
    } catch {
      return '[Object]';
    }
  }

  return String(value) || fallback;
}

/**
 * Safely format a date value for display.
 * Handles string dates, Date objects, timestamps, and null values.
 */
export function safeDate(
  value: any, 
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
  fallback: string = '—'
): string {
  if (!value) return fallback;

  try {
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return fallback;
    return new Intl.DateTimeFormat('en-SA', options).format(date);
  } catch {
    return fallback;
  }
}

/**
 * Safely format a currency value.
 */
export function safeCurrency(
  value: any,
  currency: string = 'SAR',
  fallback: string = 'SAR 0.00'
): string {
  if (value === null || value === undefined) return fallback;
  
  const num = typeof value === 'number' ? value : parseFloat(value);
  if (isNaN(num)) return fallback;

  try {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(num);
  } catch {
    return `${currency} ${num.toFixed(2)}`;
  }
}

/**
 * Safely format a phone number for display.
 */
export function safePhone(value: any, fallback: string = '—'): string {
  if (!value) return fallback;
  const phone = String(value).replace(/[^\d+]/g, '');
  if (phone.length < 7) return fallback;
  
  // Format Saudi numbers
  if (phone.startsWith('+966') || phone.startsWith('966')) {
    const digits = phone.replace(/^\+?966/, '');
    return `+966 ${digits.substring(0, 2)} ${digits.substring(2, 5)} ${digits.substring(5)}`;
  }
  
  return phone;
}

/**
 * Safely access nested object properties.
 * Usage: safeGet(appointment, 'vehicle.make', 'Unknown')
 */
export function safeGet(obj: any, path: string, fallback: any = undefined): any {
  return path.split('.').reduce((acc, key) => {
    if (acc === null || acc === undefined) return fallback;
    return acc[key] ?? fallback;
  }, obj);
}

export default {
  safeDisplay,
  safeDate,
  safeCurrency,
  safePhone,
  safeGet,
};

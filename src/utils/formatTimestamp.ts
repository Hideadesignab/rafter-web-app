/**
 * Swedish timestamp formatting utility.
 * Formats timestamps according to Swedish locale conventions.
 */

const MONTHS_SV = [
  'jan', 'feb', 'mar', 'apr', 'maj', 'jun',
  'jul', 'aug', 'sep', 'okt', 'nov', 'dec'
];

/**
 * Format a timestamp for display.
 * - Same day: "14:32"
 * - Yesterday: "Igår 14:32"
 * - This year: "12 jan 14:32"
 * - Other years: "12 jan 2024 14:32"
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const time = formatTime(date);

  if (isSameDay(date, now)) {
    return time;
  }

  if (isYesterday(date, now)) {
    return `Igår ${time}`;
  }

  const day = date.getDate();
  const month = MONTHS_SV[date.getMonth()];

  if (date.getFullYear() === now.getFullYear()) {
    return `${day} ${month} ${time}`;
  }

  return `${day} ${month} ${date.getFullYear()} ${time}`;
}

/**
 * Format time as HH:MM
 */
function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Check if two dates are the same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if a date is yesterday relative to another date
 */
function isYesterday(date: Date, relativeTo: Date): boolean {
  const yesterday = new Date(relativeTo);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
}

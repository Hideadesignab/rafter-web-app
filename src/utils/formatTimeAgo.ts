const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const MONTHS_SV = [
  'jan', 'feb', 'mar', 'apr', 'maj', 'jun',
  'jul', 'aug', 'sep', 'okt', 'nov', 'dec'
];

export function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < MINUTE) {
    return 'nu';
  }

  if (diff < HOUR) {
    const minutes = Math.floor(diff / MINUTE);
    return `${minutes} min`;
  }

  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR);
    return `${hours} tim`;
  }

  const date = new Date(timestamp);
  const today = new Date(now);

  // Check if yesterday
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return 'igår';
  }

  // Same year: show "3 jan"
  if (date.getFullYear() === today.getFullYear()) {
    return `${date.getDate()} ${MONTHS_SV[date.getMonth()]}`;
  }

  // Different year: show "3 jan 2024"
  return `${date.getDate()} ${MONTHS_SV[date.getMonth()]} ${date.getFullYear()}`;
}

interface DateSeparatorProps {
  timestamp: number;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Reset time portions for accurate date comparison
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

  if (dateOnly.getTime() === todayOnly.getTime()) {
    return 'Idag';
  }

  if (dateOnly.getTime() === yesterdayOnly.getTime()) {
    return 'Igår';
  }

  return date.toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function DateSeparator({ timestamp }: DateSeparatorProps) {
  const formattedDate = formatDate(timestamp);

  return (
    <div className="flex items-center gap-4 py-2">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs text-gray-400 font-medium">{formattedDate}</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

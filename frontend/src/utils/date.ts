export function eventDate(date?: string) {
  if (!date) return 'Tamamlandı';
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Istanbul',
  }).format(new Date(date));
}

export function sortEvents<T extends { date?: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) =>
      (b.date ? new Date(b.date).getTime() : -Infinity) -
        (a.date ? new Date(a.date).getTime() : -Infinity) || 0,
  );
}

export function eventTime(date?: string) {
  if (!date || !date.includes('T')) return '';
  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Istanbul',
  }).format(new Date(date));
}

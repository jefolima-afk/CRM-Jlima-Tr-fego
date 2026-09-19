export function formatBRL(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return '-';
  try {
    const parts = dateString.split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('pt-BR');
  } catch {
    return dateString || '-';
  }
}

export function formatDateTime(dateString?: string | null, timeString?: string | null): string {
  if (!dateString) return '-';
  const formattedDate = formatDate(dateString);
  if (timeString) {
    return `${formattedDate} às ${timeString}`;
  }
  return formattedDate;
}

export function maskCpfCnpj(val?: string | null): string {
  if (!val) return '';
  const digits = val.replace(/\D/g, '');
  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  if (digits.length === 14) {
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return val;
}

export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isDateToday(dateString?: string): boolean {
  if (!dateString) return false;
  return dateString.startsWith(getTodayString());
}

export function isDateOverdue(dateString?: string, timeString?: string): boolean {
  if (!dateString) return false;
  const today = getTodayString();
  if (dateString < today) return true;
  if (dateString === today && timeString) {
    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMins = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${currentHours}:${currentMins}`;
    return timeString < currentTime;
  }
  return false;
}

export function isDateThisWeek(dateString?: string): boolean {
  if (!dateString) return false;
  const today = new Date();
  const target = new Date(dateString + 'T00:00:00');
  
  // Calculate start of current week (Monday) and end (Sunday)
  const day = today.getDay();
  const diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(today.setDate(diffToMonday));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return target >= monday && target <= sunday;
}

export function daysUntil(dateString?: string): number {
  if (!dateString) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateString + 'T00:00:00');
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

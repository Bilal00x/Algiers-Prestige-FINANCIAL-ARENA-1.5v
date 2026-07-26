const currencySymbols: Record<string, string> = {
  DZD: 'د.ج',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  CHF: 'CHF',
  AED: 'د.إ',
};

export function formatCurrency(amount: number, currency: string = 'DZD'): string {
  const symbol = currencySymbols[currency] || currency;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
  return `${formatted} ${symbol}`;
}

export function formatDZD(amount: number): string {
  const formatted = new Intl.NumberFormat('fr-DZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
  return `${formatted} د.ج`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-DZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-DZ', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

export function getISOWeek(dateString: string): string {
  const date = new Date(dateString);
  const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = temp.getUTCDay() || 7;
  temp.setUTCDate(temp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((temp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${temp.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function getMonthKey(dateString: string): string {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function formatWeekLabel(weekKey: string): string {
  const [year, week] = weekKey.split('-W');
  const firstDay = new Date(Number(year), 0, 1 + (Number(week) - 1) * 7);
  const lastDay = new Date(firstDay);
  lastDay.setDate(lastDay.getDate() + 6);
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  return `${firstDay.toLocaleDateString('fr-DZ', options)} - ${lastDay.toLocaleDateString('fr-DZ', options)}, ${year}`;
}

export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1);
  return date.toLocaleDateString('fr-DZ', { month: 'long', year: 'numeric' });
}

export interface DaySummary {
  date: string;
  label: string;
  deposits: number;
  withdrawals: number;
  net: number;
  count: number;
}

export interface PeriodSummary {
  key: string;
  label: string;
  deposits: number;
  withdrawals: number;
  net: number;
  count: number;
  days: DaySummary[];
}

export function computeDailySummaries(transactions: { amount: number; type: string; created_at: string }[]): DaySummary[] {
  const grouped: Record<string, DaySummary> = {};

  for (const tx of transactions) {
    const dateKey = new Date(tx.created_at).toISOString().split('T')[0];
    const absAmount = Math.abs(tx.amount);

    if (!grouped[dateKey]) {
      const date = new Date(dateKey);
      grouped[dateKey] = {
        date: dateKey,
        label: date.toLocaleDateString('fr-DZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        deposits: 0,
        withdrawals: 0,
        net: 0,
        count: 0,
      };
    }

    grouped[dateKey].count += 1;
    if (tx.type === 'deposit') {
      grouped[dateKey].deposits += absAmount;
      grouped[dateKey].net += absAmount;
    } else {
      grouped[dateKey].withdrawals += absAmount;
      grouped[dateKey].net -= absAmount;
    }
  }

  return Object.values(grouped).sort((a, b) => b.date.localeCompare(a.date));
}

export function computeWeeklySummaries(days: DaySummary[]): PeriodSummary[] {
  const grouped: Record<string, PeriodSummary> = {};

  for (const day of days) {
    const weekKey = getISOWeek(day.date);
    if (!grouped[weekKey]) {
      grouped[weekKey] = {
        key: weekKey,
        label: formatWeekLabel(weekKey),
        deposits: 0,
        withdrawals: 0,
        net: 0,
        count: 0,
        days: [],
      };
    }
    grouped[weekKey].deposits += day.deposits;
    grouped[weekKey].withdrawals += day.withdrawals;
    grouped[weekKey].net += day.net;
    grouped[weekKey].count += day.count;
    grouped[weekKey].days.push(day);
  }

  return Object.values(grouped).sort((a, b) => b.key.localeCompare(a.key));
}

export function computeMonthlySummaries(days: DaySummary[]): PeriodSummary[] {
  const grouped: Record<string, PeriodSummary> = {};

  for (const day of days) {
    const monthKey = getMonthKey(day.date);
    if (!grouped[monthKey]) {
      grouped[monthKey] = {
        key: monthKey,
        label: formatMonthLabel(monthKey),
        deposits: 0,
        withdrawals: 0,
        net: 0,
        count: 0,
        days: [],
      };
    }
    grouped[monthKey].deposits += day.deposits;
    grouped[monthKey].withdrawals += day.withdrawals;
    grouped[monthKey].net += day.net;
    grouped[monthKey].count += day.count;
    grouped[monthKey].days.push(day);
  }

  return Object.values(grouped).sort((a, b) => b.key.localeCompare(a.key));
}

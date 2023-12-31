import { Range } from '~/types/range';

/**
 *  Get the nearest date range to the given date
 * @param startDate - The date to compare to today
 * @returns The nearest date range to the given date
 */
export default function getNearestDateRange(startDate: string): Range {
  const today = new Date();
  const start = new Date(startDate);
  const diffTime = Math.abs(today.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays <= 1) return '1d';
  else if (diffDays <= 5) return '5d';
  else if (diffDays <= 30) return '1mo';
  else if (diffDays <= 90) return '3mo';
  else if (diffDays <= 180) return '6mo';
  else if (diffDays <= 365) return '1y';
  else if (diffDays <= 730) return '2y';
  else if (diffDays <= 1825) return '5y';
  else if (diffDays <= 3650) return '10y';
  else return 'max';
}

import { range } from 'lodash-es';
import { isWorkDayBr } from './is-work-day-br';

export const getProfitPre = (
  startDate: Date,
  endDate: Date,
  amount: number,
  tax: number,
) => {
  // Get all years between start and end
  const years = range(startDate.getFullYear(), endDate.getFullYear() + 1);
  // Create an record for each year with all the days for that year
  const days = years.reduce((acc, curr) => {
    const daysInYear = range(0, 365).map(day => {
      return new Date(curr, 0, day);
    });
    return [...acc, ...daysInYear];
  }, [] as Array<Date>);
  // Filter only work days for each year
  const workDays = days.filter(day => isWorkDayBr(day));
  // Create a record for each year
  const yearsRecord = years.reduce(
    (acc, curr) => {
      return {
        ...acc,
        [curr]: workDays.filter(day => day.getFullYear() === curr),
      };
    },
    {} as Record<number, Array<Date>>,
  );
  // Takes the daily profit for each year
  const dailyProfitWithYear = Object.keys(yearsRecord).map(year => {
    const yearDays = yearsRecord[Number(year)].length;
    const dailyProfit = Math.pow(1 + tax / 100, 1 / yearDays) - 1;
    return {
      year: Number(year),
      profit: dailyProfit,
    };
  });
  // Filter the dates between start and end of the investment
  const dates = workDays.filter(day => day >= startDate && day <= endDate);
  // Calculate the profit for every day between start and end using the daily profit for each year using the amount
  const totalProfit = dates.reduce((acc, curr) => {
    const year = curr.getFullYear();
    const dailyProfit = dailyProfitWithYear.find(
      dailyProfit => dailyProfit.year === year,
    )?.profit;
    if (!dailyProfit) throw new Error('Daily profit not found');
    const profit = acc * (1 + dailyProfit ?? 0);
    return profit;
  }, amount);
  // Creates an array of numbers using investmentDates to reduce the dates to the actual amount of money for that day
  const prices = dates.reduce(
    (acc, curr) => {
      const year = curr.getFullYear();
      const dailyProfit = dailyProfitWithYear.find(
        dailyProfit => dailyProfit.year === year,
      )?.profit;
      if (!dailyProfit) throw new Error('Daily profit not found');
      const profit = acc[acc.length - 1] * (1 + dailyProfit);
      return [...acc, profit];
    },
    [amount],
  );

  return { totalProfit, dates, prices };
};
/* eslint-disable no-case-declarations */
/* eslint-disable no-undef */
import { ApexOptions } from 'apexcharts';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { FixedIncomeIndex } from '~/clients/firebase-client/models/Investments';
import { EVOLUTION_CHART_OPTIONS } from '~/constants/evolution-chart-option';
import { getProfitCdi } from '~/helpers/get-profit-cdi';
import { getprofitIpca } from '~/helpers/get-profit-ipca';
import { getProfitPre } from '~/helpers/get-profit-pre';
import { useCustomSelector } from '~/hooks/use-custom-selector';
import useUpdateResultMonth from '~/hooks/use-update-result-month';
import { isCrypto } from '~/type-guards/is-crypto';
import { isFixedIncome } from '~/type-guards/is-fixed-income';
import { isStock } from '~/type-guards/is-stock';

export default function EvolutionChart() {
  const investmentsStore = useCustomSelector(state => state.investments);
  const investmentsDataStore = useCustomSelector(
    state => state.investmentsData,
  );
  const investmentsResultStore = useCustomSelector(
    state => state.investmentsResult,
  );
  const updateResultMonth = useUpdateResultMonth();
  const [options, setOptions] = useState<{
    series: ApexAxisChartSeries;
    options: ApexOptions;
  }>({
    series: [
      {
        name: 'Investido',
        data: [],
      },
      {
        name: 'Valor bruto',
        data: [],
      },
    ],
    options: EVOLUTION_CHART_OPTIONS([]),
  });
  useEffect(() => {
    if (
      !investmentsStore.asyncState.isLoaded ||
      !investmentsDataStore.cryptos.asyncState.isLoaded
    )
      return;
    const allInvestments = [
      ...investmentsStore.cryptos,
      ...investmentsStore.fixedIncomes,
      ...investmentsStore.stocks,
      ...investmentsStore.cash,
      ...investmentsStore.treasuries,
    ].sort(
      (ant, curr) =>
        new Date(ant.startDate).getTime() - new Date(curr.startDate).getTime(),
    );
    if (allInvestments.length === 0) return;
    const now = new Date();
    const firstDate = new Date(allInvestments[0].startDate);
    const yearDiff = (now.getFullYear() - firstDate.getFullYear()) * 12;
    const totalPeriod = now.getMonth() - firstDate.getMonth() + yearDiff + 1;
    const dates = Array.from(Array(totalPeriod).keys()).map((period, index) => {
      const date = new Date(firstDate);
      date.setMonth(date.getMonth() + period);
      if (index === totalPeriod - 1) {
        return now.toISOString();
      }

      return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString();
    });
    const rate =
      investmentsDataStore.fiats.fiatData.find(fiat => fiat.name === 'BRL')
        ?.rate ?? 1;
    const prices = dates.map(date => {
      const dateInvested = allInvestments.filter(
        investment => new Date(investment.startDate) <= new Date(date),
      );
      // Handle fixed incomes and Stock/crypto, case stock/crypto handle USD to BRL
      return dateInvested.reduce((acc, curr) => {
        if (isCrypto(curr)) {
          return acc + curr.amount * curr.price ?? 0;
        }
        if (isStock(curr)) {
          if (curr.currency === 'USD') {
            return acc + curr.amount * curr.price * rate ?? 0;
          }

          return acc + curr.amount * curr.price ?? 0;
        }
        return acc + curr.amount;
      }, 0);
    });

    const pricesProfit = dates.map((date, index) => {
      if (index + 1 === dates.length) return 0;
      const dateInvested = allInvestments.filter(
        investment => new Date(investment.startDate) <= new Date(date),
      );
      // #TODO: The rate should be the rate of the date that represents the month
      const rate =
        investmentsDataStore.fiats.fiatData.find(fiat => fiat.name === 'BRL')
          ?.rate ?? 1;
      // Handle fixed incomes and Stock/crypto, case stock/crypto handle USD to BRL
      return dateInvested.reduce((acc, curr) => {
        if (isCrypto(curr)) {
          // find the current price of the crypto
          const currentPrice =
            investmentsDataStore.cryptos.dataCryptos
              .findLast(crypto => crypto.id === curr.ticker)
              ?.results.findLast(result => {
                return result[0] * 1000 <= new Date(date).getTime();
              })?.[1] ?? 0;
          return acc + curr.amount * currentPrice * rate ?? 0;
        }
        if (isStock(curr)) {
          const currentPrice =
            investmentsDataStore.stocks.stockData
              .findLast(stock => stock.symbol === curr.ticker)
              ?.historicalDataPrice.findLast(result => {
                return result.date * 1000 <= new Date(date).getTime();
              })?.close ?? 0;
          if (curr.currency === 'USD') {
            return acc + curr.amount * currentPrice * rate ?? 0;
          }

          return acc + curr.amount * currentPrice ?? 0;
        }
        if (isFixedIncome(curr)) {
          switch (curr.index) {
            case FixedIncomeIndex.CDI:
              getProfitCdi(
                new Date(curr.startDate),
                new Date(date),
                curr.amount,
                curr.rate,
              ).then(profit => {
                return acc + profit * curr.amount;
              });
              break;
            case FixedIncomeIndex.IPCA:
              const profitIpca =
                getprofitIpca(
                  new Date(curr.startDate),
                  new Date(date),
                  curr.amount,
                  curr.rate,
                  investmentsDataStore.fixedIncomes.ipca,
                )?.totalProfit ?? 0;
              return acc + profitIpca;
            case FixedIncomeIndex.PRE:
              const profitPre = getProfitPre(
                new Date(curr.startDate),
                new Date(date),
                curr.amount,
                curr.rate,
              ).totalProfit;
              return acc + profitPre;
          }
        }
        return acc + curr.amount;
      }, 0);
    });

    pricesProfit[pricesProfit.length - 1] =
      investmentsResultStore.currentBalance;

    updateResultMonth(
      pricesProfit[pricesProfit.length - 1] /
        pricesProfit?.[pricesProfit.length - 2]
        ? prices[prices.length - 1]
        : pricesProfit[pricesProfit.length - 2],
    );
    setOptions({
      series: [
        {
          name: 'Investido',
          data: prices,
        },
        {
          name: 'Valor bruto',
          data: pricesProfit,
        },
      ],
      options: EVOLUTION_CHART_OPTIONS(dates),
    });
  }, [investmentsStore, investmentsDataStore, investmentsResultStore]);
  return (
    <ReactApexChart
      options={options.options}
      series={options.series}
      type="area"
      height={270}
    />
  );
}

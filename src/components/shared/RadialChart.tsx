import { ApexOptions } from 'apexcharts';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import bacenClient from '~/clients/bacen-client';
import { Stock } from '~/clients/firebase-client/models/Investments';
import { foxbatClient } from '~/clients/foxbat-client/foxbat-client';
import { HistoryAPI, Result } from '~/clients/foxbat-client/models/HistoryAPI';
import { RADIAL_CHART_OPTIONS } from '~/constants/radial-chart-options';
import { getDataStocksThisMonth } from '~/helpers/get-data-stock-this-month';
import getProfit from '~/helpers/get-profit';
import getStockAllocation from '~/helpers/get-stock-allocation';
import { joinStockData } from '~/helpers/join-stock-data';
import { valueToPercent } from '~/helpers/value-to-percent';

const RadialChart = ({
  investments,
  stocksHistory,
}: {
  investments: Array<Stock>;
  stocksHistory: Array<HistoryAPI>;
}) => {
  const [series, setSeries] = useState<Array<number>>([]);
  const [apexOptions, setApexOptions] = useState<ApexOptions>({});

  async function getSeries() {
    const cdi = bacenClient().cdi.findAccumulatedCurrentMonth();
    const ibov = getIbov();
    const portfolio = investments
      .map(stock => {
        const result = stocksHistory[0].results.find(
          stockHistory => stockHistory.symbol === stock.ticker,
        );
        const dataStockThisMonth = getDataStocksThisMonth([
          result as Result & { date: number },
        ]);
        if (
          dataStockThisMonth.firstDay.date < new Date(stock.startDate).getTime()
        ) {
          // if the stock was bought in this month, take variation from the first day of the month
          const variation = Number(
            getProfit(stock.price, dataStockThisMonth.lastDay.close),
          );
          const allocation = Number(
            getStockAllocation(
              stock.amount,
              dataStockThisMonth.firstDay.close,
              dataStockThisMonth.firstDay.close * stock.amount,
            ),
          );
          return (allocation * variation) / 100;
        }
        // take all the investements before this month
        const investimentsBeforeThisMonth = investments.filter(
          value =>
            new Date(value.startDate).getTime() <
            dataStockThisMonth.firstDay.date * 1000,
        );
        // join  them
        const joinedStockData = joinStockData(investimentsBeforeThisMonth);
        // take the value of each one
        const investimentsBeforeThisMonthValue = joinedStockData
          .map(value => dataStockThisMonth.firstDay.close * value.amount)
          .reduce((accumulator, currentValue) => {
            return accumulator + currentValue;
          }, 0);
        // take the allocation of the current stock in the past month as a percent as string and convert to number
        const allocation = Number(
          getStockAllocation(
            stock.amount,
            dataStockThisMonth.firstDay.close,
            investimentsBeforeThisMonthValue,
          ),
        );
        // multiply by the percent variation
        const variation = Number(
          getProfit(
            dataStockThisMonth.firstDay.close,
            dataStockThisMonth.lastDay.close,
          ),
        );

        return (allocation * variation) / 100;
      })
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    return await Promise.all([ibov, cdi]).then(values => {
      return [portfolio, Number(values[0]), Number(values[1][0].valor)];
    });
  }

  async function getIbov() {
    const ibov = await foxbatClient().stocks.findHistory({
      ticker: ['^BVSP'],
      range: '1mo',
      interval: '1d',
    });
    // takes the percent variation between the first value of the current month and the last value
    const { firstDay, lastDay } = getDataStocksThisMonth(ibov[0].results);
    const result = getProfit(firstDay.close, lastDay.close);
    return result;
  }

  useEffect(() => {
    // be careful case the user don't have any stock
    getSeries().then(s => {
      setSeries(valueToPercent(s));
      setApexOptions({
        ...options,
        labels: [
          `Você: ${s[0].toFixed(2)}%`,
          `IBOV: ${s[1].toFixed(2)}%`,
          `CDI: ${s[2].toFixed(2)}%`,
        ],
      });
    });
  }, [stocksHistory]);
  const options: ApexOptions = RADIAL_CHART_OPTIONS;

  return (
    <div className="w-[265px] h-[300px]" id="chart">
      {series.length > 0 && (
        <ReactApexChart
          options={apexOptions}
          series={series}
          type="radialBar"
          height={350}
        />
      )}
    </div>
  );
};

export default RadialChart;

import { isNil, isNull } from 'lodash-es';
import React, { useCallback, useEffect, useState } from 'react';
import { Stock } from '~/clients/firebase-client/models/Investments';
import InvestementCardChart from './InvestementCardChart';
import getNearestDateRange from '~/helpers/get-nearest-date-range';
import getProfit from '~/helpers/get-profit';
import getStockAllocation from '~/helpers/get-stock-allocation';
import getBalance from '~/helpers/get-balance';
import { Range } from '~/types/range';
import { useCustomSelector } from '~/hooks/use-custom-selector';
import { Result } from '~/clients/firebase-client/models/history-stock-br';
import useDeleteStock from '~/hooks/use-delete-stock';
import { useUsLogos } from '~/hooks/use-us-logos';
import useAddInvestmentResult from '~/hooks/use-add-investment-result';

function StockCard(props: Stock) {
  const [stockInfo, setStockInfo] = useState<Result | null>(null);
  const [chartData, setChartData] = useState<{
    dates: string[];
    prices: number[];
    range: Range;
  } | null>(null);
  const investmentsDataStore = useCustomSelector(
    state => state.investmentsData,
  );
  const investmentsResultStore = useCustomSelector(
    state => state.investmentsResult,
  );
  const deleteStock = useDeleteStock();
  const usLogos = useUsLogos();
  const addInvestmentResult = useAddInvestmentResult();

  useEffect(() => {
    setStockInfo(
      investmentsDataStore.stocks.stockData.find(
        stock => stock.symbol === props.ticker,
      ) ?? null,
    );
  }, [investmentsDataStore]);

  useEffect(() => {
    const range = getNearestDateRange(new Date(props.startDate).toISOString());

    const results = investmentsDataStore.stocks.stockData.find(
      stock => stock.symbol === props.ticker,
    );

    // Dates that will be used in the chart X axis
    const dates = results?.historicalDataPrice
      // removing 10800000 ms (3 hours) to adjust to the brazilian timezone
      .map(price => price.date * 1000 - 10800000)
      // filtering dates that are greater than the start date or the range is 1d
      .filter(value => value > Date.parse(props.startDate) || range === '1d')
      // converting dates to ISO string
      .map(value => new Date(value).toISOString());

    if (isNil(dates) || isNil(results)) return;
    setChartData({
      range,
      dates,
      prices: results.historicalDataPrice
        .slice(dates.length * -1)
        .map(price => price.close),
    });
    addInvestmentResult(
      {
        id: props.ticker,
        currency: 'BRL',
        invested: props.price * props.amount,
        result: results.regularMarketPrice * props.amount,
        period: 'all',
      },
      'stocks',
    );
  }, [stockInfo]);

  const deleteSelectedStock = useCallback(() => {
    deleteStock(props.ticker);
  }, [stockInfo]);

  return (
    <>
      <div className="card bg-base-100 shadow-xl glassy-border z-0">
        <div className="card-body p-4 md:p-8">
          <div className="flex justify-between">
            <div className="flex items-center gap-x-2">
              {stockInfo?.logourl !==
                'https://s3-symbol-logo.tradingview.com/fii--big.svg' &&
                props.currency === 'BRL' &&
                stockInfo?.logourl !== 'https://brapi.dev/favicon.svg' && (
                  <img
                    className="h-8 w-8 rounded drop-shadow"
                    src={stockInfo?.logourl}
                  />
                )}
              {props.currency === 'USD' && (
                <img
                  className="h-8 w-8 rounded drop-shadow"
                  src={usLogos(props.ticker)}
                />
              )}

              <h2 className="card-title">{props.ticker}</h2>
            </div>

            <details className="dropdown dropdown-end">
              <summary className="m-1 btn btn-ghost btn-circle">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 20 20">
                  <circle cx="10" cy="4" r="2" fill="currentColor" />
                  <circle cx="10" cy="10" r="2" fill="currentColor" />
                  <circle cx="10" cy="16" r="2" fill="currentColor" />
                </svg>
              </summary>
              <ul className="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52 glassy-border">
                <li>
                  <button onClick={() => deleteSelectedStock()}>Deletar</button>
                </li>
                <li className="disabled">
                  <button>Atualizar</button>
                </li>
                <li className="disabled">
                  <button>Informar erro</button>
                </li>
              </ul>
            </details>
          </div>
          {!isNull(stockInfo) && (
            <div className="flex flex-col min-[768px]:flex-row gap-x-2">
              <span className="text-sm  font-semibold">
                <span className="text-xs font-normal">Quantidade:</span>{' '}
                {props.amount}
              </span>
              <span className="text-sm  font-semibold">
                <span className="text-xs font-normal">Preço médio:</span> R${' '}
                {props.price.toFixed(2)}
              </span>
              <span className="text-sm  font-semibold">
                <span className="text-xs font-normal">Resultado:</span> %{' '}
                {getProfit(props.price, stockInfo!.regularMarketPrice)}
              </span>
              <span className="text-sm  font-semibold">
                <span className="text-xs font-normal">Carteira:</span> %{' '}
                {getStockAllocation(
                  props.amount,
                  stockInfo!.regularMarketPrice,
                  investmentsResultStore.currentBalance,
                )}
              </span>
              <span className="text-sm  font-semibold">
                <span className="text-xs font-normal">Balanço:</span> R${' '}
                {getBalance(stockInfo!.regularMarketPrice, props.amount)}
              </span>
            </div>
          )}
          {!isNull(chartData) && (
            <>
              <h1 className="font-semibold">
                Variação de preço desde a compra
              </h1>
              <InvestementCardChart
                currency={props.currency}
                dates={chartData.dates}
                prices={chartData.prices}
                range={chartData.range}
              />
            </>
          )}

          <div className="card-actions">
            <div
              className="tooltip tooltip-error w-full z-0"
              data-tip="Essa funcionalidade ainda será desenvolvida">
              <button disabled className="btn btn-primary w-full">
                Mais detalhes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default React.memo(StockCard);

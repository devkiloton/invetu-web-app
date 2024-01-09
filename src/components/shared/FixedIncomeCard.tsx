/* eslint-disable no-case-declarations */
import { isNil, isNull } from 'lodash-es';
import React, { useCallback, useEffect, useState } from 'react';
import {
  FixedIncome,
  FixedIncomeIndex,
} from '~/clients/firebase-client/models/Investments';
import { getProfitCdi } from '~/helpers/get-profit-cdi';
import { useCustomSelector } from '~/hooks/use-custom-selector';
import InvestementCardChart from './InvestementCardChart';
import { getProfitPre } from '~/helpers/get-profit-pre';
import { useDeleteFixedIncome } from '~/hooks/use-delete-fixed-income';
import { getprofitIpca } from '~/helpers/get-profit-ipca';
import useAddInvestmentResult from '~/hooks/use-add-investment-result';

function FixedIncomeCard(props: FixedIncome) {
  const fixedIncomeData = useCustomSelector(
    state => state.investmentsData.fixedIncomes,
  );
  const [chartData, setChartData] = useState<{
    dates: string[];
    prices: number[];
  } | null>(null);
  const [profit, setProfit] = useState(0);
  const addInvestmentResult = useAddInvestmentResult();

  const investmentsDataStore = useCustomSelector(
    state => state.investmentsData.fixedIncomes,
  );
  const investmentsResultStore = useCustomSelector(
    state => state.investmentsResult,
  );
  const deleteFixedIncome = useDeleteFixedIncome();
  useEffect(() => {
    switch (props.index) {
      case FixedIncomeIndex.CDI:
        const lastCdiElement =
          investmentsDataStore.cdi.daily[
            investmentsDataStore.cdi.daily.length - 1
          ];
        const now = new Date();
        // If the endDate is null, it means that the investment is still active and should use the last cdi date
        if (isNil(lastCdiElement)) return;
        const cdiLastDate = new Date(
          lastCdiElement.data.split('/').reverse().join('-'),
        );
        // If the endDate has passed away, it should use the endDate
        const endDate =
          !isNull(props.endDate) && new Date(props.endDate) < now
            ? new Date(props.endDate)
            : cdiLastDate;
        getProfitCdi(
          new Date(props.startDate),
          endDate,
          props.amount,
          props.rate,
        ).then(profit => {
          setProfit(profit);
        });
        addInvestmentResult(
          {
            id: props.name,
            currency: 'BRL',
            period: 'all',
            invested: props.amount,
            result: profit,
          },
          'fixedIncomes',
        );
        break;
      case FixedIncomeIndex.PRE:
        const dataPre = getProfitPre(
          new Date(props.startDate),
          isNil(props?.endDate) ? new Date() : new Date(props.endDate),
          props.amount,
          props.rate,
        );
        setProfit(dataPre.totalProfit / props.amount);
        setChartData({
          dates: dataPre.dates.map(date => date.toISOString()),
          prices: dataPre.prices,
        });
        addInvestmentResult(
          {
            id: props.name,
            currency: 'BRL',
            period: 'all',
            invested: props.amount,
            result: dataPre.totalProfit,
          },
          'fixedIncomes',
        );
        break;
      default:
        const ipcaHistory = fixedIncomeData.ipca;
        const dataIpca = getprofitIpca(
          new Date(props.startDate),
          isNil(props?.endDate) ? new Date() : new Date(props.endDate),
          props.amount,
          props.rate,
          ipcaHistory,
        );
        if (isNull(dataIpca)) return;
        setProfit(dataIpca.totalProfit / props.amount);
        setChartData({
          dates: dataIpca.dates.map(date => date.toISOString()),
          prices: dataIpca.prices,
        });
        break;
    }
  }, [fixedIncomeData]);

  useEffect(() => {
    if (!investmentsDataStore.asyncState.isLoaded) return;
    switch (props.index) {
      case FixedIncomeIndex.CDI:
        const data = investmentsDataStore.cdi.daily
          .map(daily => {
            return {
              date: new Date(daily.data.split('/').reverse().join('-')),
              value: Number(daily.valor),
            };
          })
          .filter(
            dailyFormatted =>
              dailyFormatted.date.getTime() >
                new Date(props.startDate).getTime() &&
              dailyFormatted.date.getTime() <=
                // Adding 24h to handle edge cases
                new Date(props?.endDate ?? new Date()).getTime() +
                  60000 * 60 * 24,
          )
          .map(finalValue => ({
            date: finalValue.date.toISOString(),
            value: Number(finalValue.value),
          }));
        const dates = data.map(daily => daily.date);
        // Calculate the daily earnings using the daily taxes with reduce
        const prices = data.reduce(
          (acc, curr) => {
            const lastValue = acc[acc.length - 1];
            const newValue = lastValue * (1 + curr.value / 100);
            return [...acc, newValue];
          },
          [props.amount],
        );
        setChartData({ dates, prices });
        addInvestmentResult(
          {
            id: props.name,
            currency: 'BRL',
            period: 'all',
            invested: props.amount,
            result: prices[prices.length - 1],
          },
          'fixedIncomes',
        );
        break;
      case FixedIncomeIndex.PRE:
        // Already solved in the useEffect above
        break;
      default:
        // Already solved in the useEffect above
        break;
    }
  }, [investmentsDataStore]);

  const deleteSelectedFixedIncome = useCallback(() => {
    deleteFixedIncome(props.name);
  }, []);
  return (
    <div className="card bg-base-100 shadow-xl glassy-border z-0">
      <div className="card-body p-4 md:p-8">
        <div className="flex justify-between">
          <div className="flex items-center gap-x-2">
            <h2 className="card-title">{props.name}</h2>
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
                <button onClick={deleteSelectedFixedIncome}>Deletar</button>
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
        {!!profit && (
          <div className="flex flex-col min-[768px]:flex-row gap-x-2">
            <span className="text-sm  font-semibold">
              <span className="text-xs font-normal">Total investido:</span>{' '}
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(props.amount)}
            </span>
            <span className="text-sm  font-semibold">
              <span className="text-xs font-normal">Resultado:</span>{' '}
              {new Intl.NumberFormat('pt-BR', {
                style: 'percent',
                maximumFractionDigits: 2,
              }).format((profit / 100) * 100 - 1)}
            </span>
            <span className="text-sm  font-semibold">
              <span className="text-xs font-normal">Carteira:</span> %{' '}
              {new Intl.NumberFormat('pt-BR', {
                style: 'percent',
                maximumFractionDigits: 2,
              }).format(
                (props.amount * profit) / investmentsResultStore.currentBalance,
              )}
            </span>
            <span className="text-sm  font-semibold">
              <span className="text-xs font-normal">Balanço: </span>
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(props.amount * profit)}
            </span>
          </div>
        )}
        {!isNull(chartData) && (
          <>
            <h1 className="font-semibold">Variação de preço desde a compra</h1>
            <InvestementCardChart
              dates={chartData.dates}
              prices={chartData.prices}
            />
          </>
        )}

        <div className="card-actions">
          <div
            className="tooltip tooltip-error w-full z-0"
            data-tip="Ops, funcionalidade em desenvolvimento">
            <button disabled className="btn btn-primary w-full">
              Mais detalhes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(FixedIncomeCard);

import { isNil, isNull } from 'lodash-es';
import React, { useCallback, useEffect, useState } from 'react';
import { Crypto } from '~/clients/firebase-client/models/Investments';
import InvestementCardChart from './InvestementCardChart';
import getNearestDateRange from '~/helpers/get-nearest-date-range';
import { Range } from '~/types/range';
import { useCustomSelector } from '~/hooks/use-custom-selector';
import { CryptoCurrency } from '~/clients/firebase-client/models/status-cryptos';
import { HistoryCryptoUS } from '~/clients/firebase-client/models/data-cryptos';
import useDeleteCrypto from '~/hooks/use-delete-crypto';
import getProfit from '~/helpers/get-profit';
import useAddInvestmentResult from '~/hooks/use-add-investment-result';

function CryptoCard(props: Crypto) {
  const [cryptoInfo, setCryptoInfo] = useState<{
    status: CryptoCurrency;
    data: HistoryCryptoUS;
  } | null>(null);
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
  const deleteCrypto = useDeleteCrypto();
  const addInvestmentResult = useAddInvestmentResult();
  const [investmentResult, setInvestmentResult] = useState(0);

  useEffect(() => {
    if (
      !investmentsDataStore.cryptos.asyncState.isLoaded &&
      !investmentsDataStore.fiats.asyncState.isLoaded
    )
      return;
    const cryptoData = investmentsDataStore.cryptos.dataCryptos.find(
      cryptoCurrency => cryptoCurrency.id === props.ticker,
    );

    const status = investmentsDataStore.cryptos.statusCryptos.find(
      cryptoCurrency => cryptoCurrency.id === props.ticker,
    );
    if (isNil(cryptoData)) return;
    if (isNil(status)) return;

    const convertingUsdToBrl = cryptoData.results.map(result => {
      const rate =
        investmentsDataStore.fiats.fiatData.find(fiat => fiat.name === 'BRL')
          ?.rate ?? 1;

      return [result[0], result[1] * rate, result[2] * rate, result[3] * rate];
    });
    const mutatedCryptoData = {
      ...cryptoData,
      results: convertingUsdToBrl,
    };
    setCryptoInfo({
      data: mutatedCryptoData,
      status,
    });
  }, [investmentsDataStore.cryptos, investmentsDataStore.fiats]);

  useEffect(() => {
    if (!investmentsDataStore.cryptos.asyncState.isLoaded) return;

    const range = getNearestDateRange(new Date(props.startDate).toISOString());

    if (isNull(cryptoInfo)) return;

    const results = cryptoInfo?.data.results.map(result => ({
      date: result[0],
      price: result[1],
    }));

    // Dates that will be used in the chart X axis
    const dates = results
      // removing 10800000 ms (3 hours) to adjust to the brazilian timezone
      .map(result => result.date * 1000 - 10800000)
      // filtering dates that are greater than the start date or the range is 1d
      .filter(value => value > Date.parse(props.startDate) || range === '1d')
      // converting dates to ISO string
      .map(value => new Date(value).toISOString());
    setChartData({
      range,
      dates,
      prices: results.slice(dates.length * -1).map(result => result.price),
    });
    const result =
      cryptoInfo.data.results[cryptoInfo.data.results.length - 1][1];
    const invested = props.price * props.amount;
    setInvestmentResult(result);
    addInvestmentResult(
      {
        id: props.ticker,
        currency: 'BRL',
        invested,
        result,
        period: 'all',
      },
      'cryptos',
    );
  }, [cryptoInfo]);

  const deleteSelectedCrypto = useCallback(() => {
    deleteCrypto(props.ticker);
  }, [cryptoInfo]);

  return (
    <div className="card bg-base-100 shadow-xl glassy-border z-0">
      <div className="card-body p-4 md:p-8">
        <div className="flex justify-between">
          <div className="flex items-center gap-x-2">
            <img className="h-8 w-8 rounded" src={cryptoInfo?.status.icon} />

            <h2 className="card-title">{cryptoInfo?.status.name}</h2>
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
                <button onClick={deleteSelectedCrypto}>Deletar</button>
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
        {!isNull(cryptoInfo) && (
          <div className="flex flex-col min-[768px]:flex-row gap-x-2">
            <span className="text-sm  font-semibold">
              <span className="text-xs font-normal">Quantidade:</span>{' '}
              {props.amount}
            </span>
            <span className="text-sm  font-semibold">
              <span className="text-xs font-normal">Preço médio:</span>{' '}
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(props.price)}
            </span>
            <span className="text-sm  font-semibold">
              <span className="text-xs font-normal">Resultado:</span> %{' '}
              {getProfit(props.price, investmentResult)}
            </span>
            <span className="text-sm  font-semibold">
              <span className="text-xs font-normal">Carteira:</span>{' '}
              {new Intl.NumberFormat('pt-BR', {
                style: 'percent',
                maximumFractionDigits: 2,
              }).format(
                investmentResult / investmentsResultStore.currentBalance,
              )}
            </span>
            <span className="text-sm  font-semibold">
              <span className="text-xs font-normal">Balanço:</span> R${' '}
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(investmentResult)}
            </span>
          </div>
        )}
        {!isNull(chartData) && (
          <>
            <h1 className="font-semibold">Variação de preço desde a compra</h1>
            <InvestementCardChart
              dates={chartData.dates}
              prices={chartData.prices}
              range={chartData.range}
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

export default React.memo(CryptoCard);

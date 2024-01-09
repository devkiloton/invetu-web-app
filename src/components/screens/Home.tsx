/* eslint-disable no-case-declarations */
import { useCallback, useEffect, useState } from 'react';
import PageContainer from '../containers/PageContainer';
import AccountStats from '../shared/AccountStats';
import {
  Crypto,
  FixedIncome,
  Stock,
} from '~/clients/firebase-client/models/Investments';
import { joinStockData } from '~/helpers/join-stock-data';
import { Head } from '../shared/Head';
import EvolutionChart from '../shared/EvolutionChart';
import { useCustomSelector } from '~/hooks/use-custom-selector';
import Ghost from '~/assets/illustrations/ghost.svg';
import Add from '~/assets/illustrations/add.svg';
import WrapperIcon from '../shared/WrapperIcon';
import { getCurrentBalanceFromManyStocks } from '~/helpers/get-current-balance-from-many-stocks';
import { isStock } from '~/type-guards/is-stock';
import { isCrypto } from '~/type-guards/is-crypto';
import StockCard from '../shared/StockCard';
import CryptoCard from '../shared/CryptoCard';
import Dividends from '../shared/Dividends';
import { Result } from '~/clients/firebase-client/models/history-stock-br';
import { joinCryptoData } from '~/helpers/join-crypto-data';
import FixedIncomeCard from '../shared/FixedIncomeCard';
import RadialChart from '../shared/RadialChart';
import AddInvestmentDialog from '../shared/AddInvestmentDialog';

type SupportedInvestments = Stock | FixedIncome | Crypto;

export default function Home() {
  const [investmentsJoined, setInvestmentsJoined] = useState<
    Array<Stock | Crypto | FixedIncome>
  >([]);
  const [isOpen, setIsOpen] = useState(false);
  const [currentStocksBalance, setCurrentStocksBalance] = useState(0);
  const [stocksHistory, setStocksHistory] = useState<Array<Result>>();
  const investmentsStore = useCustomSelector(state => state.investments);
  const investmentsDataStore = useCustomSelector(
    state => state.investmentsData,
  );

  useEffect(() => {
    if (investmentsStore.asyncState.isLoaded === false) return;
    const joinedStocks = joinStockData(investmentsStore.stocks);
    const joinedCryptos = joinCryptoData(investmentsStore.cryptos);
    const fixedIncomes = investmentsStore.fixedIncomes;

    const orderedInvestments = [
      ...joinedStocks,
      ...joinedCryptos,
      ...fixedIncomes,
    ].sort(investment => investment.amount);
    setInvestmentsJoined(orderedInvestments);
  }, [investmentsDataStore]);

  useEffect(() => {
    if (investmentsStore.asyncState.isLoaded === false) return;
    const stocks = investmentsStore.stocks;
    const response = Object.values(investmentsDataStore.stocks.stockData);
    setStocksHistory(response);
    // take the current price of each stock and multiply by the amount
    const currentBalanceFromStocks = getCurrentBalanceFromManyStocks(
      stocks,
      response,
    );
    setCurrentStocksBalance(currentBalanceFromStocks);
  }, [investmentsDataStore]);

  useEffect(() => {
    const fixedIncomes = investmentsStore.fixedIncomes;
    const removingOldFixedIcomes = investmentsJoined.filter(
      investment => isCrypto(investment) || isStock(investment),
    ) as Array<Crypto | Stock>;
    setInvestmentsJoined([...removingOldFixedIcomes, ...fixedIncomes]);
  }, [investmentsStore.fixedIncomes]);

  const investmentCard = useCallback(
    (investment: SupportedInvestments) => {
      switch (true) {
        case isStock(investment):
          const stock = investment as Stock;
          return <StockCard key={stock.ticker} {...stock} />;
        case isCrypto(investment):
          const crypto = investment as Crypto;
          return <CryptoCard key={crypto.ticker} {...crypto} />;
        default:
          const fixedIncome = investment as FixedIncome;
          return <FixedIncomeCard key={fixedIncome.name} {...fixedIncome} />;
      }
    },
    [investmentsDataStore, investmentsStore, currentStocksBalance],
  );

  const setStateDialogAddInvestment = useCallback((state: boolean) => {
    setIsOpen(state);
  }, []);

  return (
    <>
      <Head title="Home" />
      <PageContainer>
        <AccountStats
          investedAmount={investmentsStore.investedAmount}
          currentBalance={currentStocksBalance}
        />
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex flex-col md:flex-row w-full gap-4">
            <div className="glassy-border rounded-2xl p-4 md:p-8">
              <h1 className="font-semibold">Resultados desse mês</h1>
              <div className="flex justify-center">
                <RadialChart
                  investments={investmentsJoined}
                  results={stocksHistory!}
                />
              </div>
            </div>
            <div
              className="tooltip tooltip-error w-full z-0"
              data-tip="Ops, funcionalidade em desenvolvimento">
              <div className="glassy-border rounded-2xl w-full p-4 md:p-8">
                <h1 className="font-semibold mb-3 text-start">
                  Evolução patrimonial
                </h1>
                <EvolutionChart />
              </div>
            </div>
          </div>
          <div className="glassy-border rounded-2xl min-w-80 p-4 md:p-8 max-h-[388px] overflow-scroll">
            <h1 className="font-semibold mb-3">Próximos rendimentos</h1>
            {investmentsJoined.length === 0 && (
              <div className="flex h-full justify-center items-center flex-col gap-4">
                <WrapperIcon>
                  <img src={Ghost} alt="Fantasma" className="w-16 h-16" />
                </WrapperIcon>
                <span className="text-center text-xs font-semibold   max-w-[230px] opacity-70">
                  Cadastre ações, FIIs e ETFs para ver os próximos rendimentos,
                  JCP, bonificações e mais.
                </span>
              </div>
            )}

            {investmentsJoined.length > 0 && (
              <Dividends stocks={investmentsStore.stocks} />
            )}
          </div>
        </div>
        <div className="flex gap-x-4">
          <div className="w-full flex flex-col gap-4">
            {investmentsJoined.length === 0 && (
              <div className="flex h-full justify-center items-center flex-col gap-4">
                <WrapperIcon>
                  <img
                    src={Add}
                    alt="Simbolo de adicionar"
                    className="w-16 h-16"
                  />
                </WrapperIcon>
                <span className="text-center text-xs font-semibold   max-w-[230px] opacity-70">
                  Cadastre seus investimentos e veja o resultado deles aqui.
                </span>
              </div>
            )}
            {investmentsJoined.map(investment => investmentCard(investment))}
          </div>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn btn-primary btn-circle fixed bottom-5 right-5 min-[768px]:hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 rotate-45"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <AddInvestmentDialog
          isOpen={isOpen}
          setIsOpen={setStateDialogAddInvestment}
        />
      </PageContainer>
    </>
  );
}

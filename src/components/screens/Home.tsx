import { useEffect, useState } from 'react';
import PageContainer from '../containers/PageContainer';
import AccountStats from '../shared/AccountStats';
import { Stock } from '~/clients/firebase-client/models/Investments';
import { joinStockData } from '~/helpers/join-stock-data';
import { Dialog } from '@headlessui/react';
import { Head } from '../shared/Head';
import RadialChart from '../shared/RadialChart';
import EvolutionChart from '../shared/EvolutionChart';
import { useCustomSelector } from '~/hooks/use-custom-selector';
import Ghost from '~/assets/illustrations/ghost.svg';
import Add from '~/assets/illustrations/add.svg';
import WrapperIcon from '../shared/WrapperIcon';
import { Result } from '~/clients/firebase-client/models/history-stock-br';
import InvestmentCard from '../shared/InvestmentCard';
import Dividends from '../shared/Dividends';
import { getCurrentBalanceFromManyStocks } from '~/helpers/get-current-balance-from-many-stocks';
import AddInvestmentsForm from '../forms/AddInvestmentsForm';
export default function Home() {
  const [investmentsJoined, setInvestmentsJoined] = useState<Array<Stock>>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [stocksHistory, setStocksHistory] = useState<Array<Result>>();
  const investmentsStore = useCustomSelector(state => state.investments);
  const investmentsDataStore = useCustomSelector(
    state => state.investmentsData,
  );

  useEffect(() => {
    if (investmentsStore.asyncState.isLoaded === false) return;
    const stocks = investmentsStore.stocks;
    const orderedDataByVolume = joinStockData(stocks).sort((a, b) => {
      return b.amount * b.price - a.amount * a.price;
    });
    setInvestmentsJoined(orderedDataByVolume);
  }, [investmentsDataStore]);

  useEffect(() => {
    if (investmentsStore.asyncState.isLoaded === false) return;
    const stocks = investmentsStore.stocks;
    const response = Object.values(investmentsDataStore.data);
    setStocksHistory(response);
    // take the current price of each stock and multiply by the amount
    const currentBalance = getCurrentBalanceFromManyStocks(stocks, response);
    setCurrentBalance(currentBalance);
  }, [investmentsDataStore]);
  return (
    <>
      <Head title="Home" />
      <PageContainer>
        <AccountStats
          investedAmount={investmentsStore.investedAmount}
          currentBalance={currentBalance}
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
          <div className="w-full h-full sticky top-24 max-w-120 hidden min-[1024px]:block ">
            <AddInvestmentsForm />
          </div>
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
            {investmentsJoined.map(investment => {
              return (
                <InvestmentCard
                  key={investment.ticker}
                  {...investment}
                  currentBalance={currentBalance}
                  investedAmount={investmentsStore.investedAmount}
                />
              );
            })}
          </div>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn btn-primary btn-circle fixed bottom-5 right-5 ">
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
        <Dialog
          open={isOpen}
          onClose={() => setIsOpen(false)}
          className="relative z-[100]">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
            <Dialog.Panel className="max-w-120 w-full overflow-scroll max-h-[90vh]">
              <AddInvestmentsForm />
            </Dialog.Panel>
          </div>
        </Dialog>
      </PageContainer>
    </>
  );
}

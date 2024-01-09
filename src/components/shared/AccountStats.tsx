import { useCustomSelector } from '~/hooks/use-custom-selector';

export default function AccountStats(props: {
  investedAmount: number;
  currentBalance: number;
}) {
  const investmentsResult = useCustomSelector(state => state.investmentsResult);
  return (
    <div className="w-full">
      <div className="stats bg-primary text-primary-content w-full bordered flex flex-col md:flex-row">
        <div className="stat border-base-100 border-opacity-20">
          <div className="stat-title text-neutral">Total investido</div>
          <div className="stat-value">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(props.investedAmount)}
          </div>
        </div>

        <div className="stat border-base-100 border-opacity-20">
          <div className="stat-title text-neutral">Saldo bruto</div>
          <div className="stat-value">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(investmentsResult.currentBalance)}
          </div>
        </div>
        <div className="stat border-base-100 border-opacity-20">
          <div className="stat-title text-neutral">Resultado</div>
          <div className="stat-value">
            %{' '}
            {(props.investedAmount === 0
              ? 0
              : (investmentsResult.currentBalance / props.investedAmount) *
                  100 -
                100
            ).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}

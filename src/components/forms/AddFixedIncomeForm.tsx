import React, { useMemo, useState } from 'react';
import useAddFixedIncome from '~/hooks/use-add-fixed-income';
import {
  FixedIncome,
  FixedIncomeIndex,
} from '~/clients/firebase-client/models/Investments';
import ListboxIndexFixedIncome from '../shared/ListboxIndexFixedIncome';
import { useCustomSelector } from '~/hooks/use-custom-selector';

export default function AddFixedIncomeForm() {
  const [fixedIncomeData, setFixedIncomeData] = useState<FixedIncome>({
    name: '',
    index: FixedIncomeIndex.CDI,
    rate: 0,
    startDate: '',
    endDate: null,
    amount: 0,
    currency: 'BRL',
  });

  const addFixedIncome = useAddFixedIncome();
  const investments = useCustomSelector(state => state.investments);

  const handleDateDeposit = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFixedIncomeData({
      ...fixedIncomeData,
      startDate: new Date(event.target.value).toISOString(),
    });
  };

  const handleDateExpire = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFixedIncomeData({
      ...fixedIncomeData,
      endDate: new Date(event.target.value).toISOString(),
    });
  };

  const handleIndexChange = (index: string) => {
    setFixedIncomeData({
      ...fixedIncomeData,
      index: index as FixedIncomeIndex,
    });
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFixedIncomeData({
      ...fixedIncomeData,
      amount: event.target.valueAsNumber,
    });
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFixedIncomeData({
      ...fixedIncomeData,
      name: event.target.value,
    });
  };

  const rateInput = useMemo(() => {
    switch (fixedIncomeData.index) {
      case FixedIncomeIndex.PRE:
        return <></>;
      case FixedIncomeIndex.IPCA:
        return (
          <span className="uppercase font-semibold min-w-[85px]">ipca +</span>
        );
      default:
        return (
          <span className="uppercase font-semibold min-w-[64px]">cdi</span>
        );
    }
  }, [fixedIncomeData.index]);

  const handleRateIndexChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setFixedIncomeData({
      ...fixedIncomeData,
      rate: event.target.valueAsNumber,
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (fixedIncomeData.amount === 0) return alert('Amount is required');
    if (fixedIncomeData.startDate === '')
      return alert('Start date is required');
    const isNameUsed = investments.fixedIncomes.some(
      fixedIncome => fixedIncome.name === fixedIncomeData.name,
    );
    if (fixedIncomeData.name === '') return alert('Name is required');
    if (isNameUsed) return alert('Name is already used');
    addFixedIncome(fixedIncomeData);
    setFixedIncomeData({
      ...fixedIncomeData,
      rate: 0,
      startDate: '',
      endDate: null,
      amount: 0,
      currency: 'BRL',
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        className="tooltip tooltip-error w-full z-0"
        data-tip="Essa funcionalidade ainda será desenvolvida">
        <label className="cursor-pointer label">
          <span className="label-text">Adicionar IR regressivo</span>
          <input type="checkbox" className="toggle toggle-primary" disabled />
        </label>
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Indexador</span>
        </label>
        <ListboxIndexFixedIncome onChange={handleIndexChange} />
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Nome do investimento</span>
        </label>
        <label className="input p-0">
          <input
            onChange={handleNameChange}
            type="text"
            required
            placeholder="ex. Caixinha Nubank"
            className="input input-bordered w-full"
          />
        </label>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Rentabilidade %</span>
        </label>
        <label className="input-group">
          {rateInput}
          <input
            onChange={handleRateIndexChange}
            type="number"
            min={0.01}
            step={0.01}
            required
            placeholder={
              fixedIncomeData.index === FixedIncomeIndex.CDI ? '102' : '5,8'
            }
            className="input input-bordered w-full"
          />
          <span>%</span>
        </label>
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Total investido</span>
        </label>
        <label className="input-group">
          <input
            onChange={handleAmountChange}
            type="number"
            min={0.01}
            step={0.01}
            required
            placeholder="120"
            className="input input-bordered w-full"
          />
          <span>R$</span>
        </label>
      </div>
      <div className="form-control">
        <label className="label">
          {/* #TODO: limit the date range */}
          <span className="label-text">Data de depósito</span>
        </label>
        <label className="input-group">
          <input
            onChange={handleDateDeposit}
            type="date"
            placeholder="ex. 134"
            required
            className="input input-bordered w-full"
          />
          <span>Data</span>
        </label>
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Data de vencimento (opcional)</span>
        </label>
        <label className="input-group">
          <input
            onChange={handleDateExpire}
            type="date"
            placeholder="ex. 134"
            className="input input-bordered w-full"
          />
          <span>Data</span>
        </label>
      </div>
      <div className="form-control mt-6">
        <button className="btn btn-primary">Adicionar</button>
      </div>
    </form>
  );
}

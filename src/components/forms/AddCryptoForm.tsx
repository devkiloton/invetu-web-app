import React, { useRef, useState } from 'react';
import { Crypto } from '~/clients/firebase-client/models/Investments';
import DropdownCryptoInput from '../shared/DropdownCryptoInput';
import useAddCrypto from '~/hooks/use-add-crypto';

export default function AddCryptoForm() {
  const amountInput = useRef<any>();
  const priceInput = useRef<any>();
  const addCrypto = useAddCrypto();

  const [cryptoData, setCryptoData] = useState<Crypto>({
    ticker: '',
    price: 0,
    amount: 0,
    startDate: '',
    currency: 'BRL',
    name: '',
  });

  const handleDateDeposit = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCryptoData({
      ...cryptoData,
      startDate: new Date(event.target.value).toISOString(),
    });
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCryptoData({
      ...cryptoData,
      amount: event.target.valueAsNumber,
    });
  };

  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCryptoData({
      ...cryptoData,
      price: event.target.valueAsNumber,
    });
  };

  const handleCryptocurrencyChange = (ticker: string, name: string) => {
    setCryptoData({
      ...cryptoData,
      ticker,
      name,
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (cryptoData.ticker === '') return alert('Ticker is required');
    if (priceInput.current?.value === 0) return alert('Price is required');
    if (amountInput.current?.value === 0) return alert('Amount is required');
    addCrypto(cryptoData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        className="tooltip tooltip-error w-full z-0"
        data-tip="Essa funcionalidade ainda será desenvolvida">
        <label className="cursor-pointer label">
          <span className="label-text">Adicionar endereço de wallet</span>
          <input type="checkbox" className="toggle toggle-primary" disabled />
        </label>
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Criptomoeda</span>
        </label>
        <DropdownCryptoInput setCryptoCurrency={handleCryptocurrencyChange} />
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Quantidade</span>
        </label>
        <label className="input-group">
          <input
            ref={amountInput}
            onChange={handleAmountChange}
            min={0.00000001}
            step={0.00000001}
            type="number"
            required
            placeholder="ex. 0.02"
            className="input input-bordered w-full"
          />
          <span>Unidades</span>
        </label>
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Cotação da criptomoeda</span>
        </label>
        <label className="input-group">
          <input
            ref={priceInput}
            onChange={handlePriceChange}
            type="number"
            min={0.00000001}
            step={0.00000001}
            required
            placeholder="148.000,00"
            className="input input-bordered w-full"
          />
          <span>R$</span>
        </label>
      </div>
      <div className="form-control">
        <label className="label">
          {/* #TODO: limit the date range */}
          <span className="label-text">Data de compra</span>
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
      <div className="form-control mt-6">
        <button className="btn btn-primary">Adicionar</button>
      </div>
    </form>
  );
}

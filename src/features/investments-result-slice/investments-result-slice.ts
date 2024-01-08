/* eslint-disable no-case-declarations */
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export type InvestmentType =
  | 'stocks'
  | 'cryptos'
  | 'fixedIncomes'
  | 'treasuries';

export type InvestmentResult = {
  id: string;
  invested: number;
  result: number;
  // Period of the result
  period: 'all' | 'ytd' | 'month' | number;
  currency: 'BRL' | 'USD';
  // Side effects for stocks (dividends, bonus, etc.).
  // #TODO: Type not defined yet
  sideEffect?: any;
};

type InvestmentResults = {
  fixedIncomes: Array<InvestmentResult>;
  stocks: Array<InvestmentResult>;
  cryptos: Array<InvestmentResult>;
  treasuries: Array<InvestmentResult>;
  currentBalance: number;
  resultMonth: number;
};

const initialState: InvestmentResults = {
  stocks: [],
  cryptos: [],
  treasuries: [],
  fixedIncomes: [],
  currentBalance: 0,
  resultMonth: 0,
};

export const investmentsResultSlice = createSlice({
  name: 'investments-result',
  initialState,
  reducers: {
    addInvestmentResult: (
      state,
      action: PayloadAction<InvestmentResult & { type: InvestmentType }>,
    ) => {
      const { payload } = action;
      const isAlreadyAdded = state[payload.type].some(
        investmentResult => investmentResult.id === payload.id,
      );
      // If the investment result is already added, we need to remove the previous result
      if (isAlreadyAdded) {
        state.currentBalance -= payload.result;
      }

      state.currentBalance += payload.result;
      const removeIdFromTreasuries = state[payload.type].filter(
        treasury => treasury.id !== payload.id,
      );
      state[payload.type] = [...removeIdFromTreasuries, payload];
    },
    updateResultMonth: (state, action: PayloadAction<number>) => {
      state.resultMonth = action.payload;
    },
    deleteInvestmentResult: (
      state,
      action: PayloadAction<InvestmentResult & { type: InvestmentType }>,
    ) => {
      const { payload } = action;
      const investmentResult = state[payload.type].find(
        investmentResult => investmentResult.id === payload.id,
      );
      if (!investmentResult) return;
      state.currentBalance -= investmentResult.result;
      const removeIdFromStocks = state[payload.type].filter(
        stock => stock.id !== payload.id,
      );
      state[payload.type] = [...removeIdFromStocks];
    },
  },
});

export const { addInvestmentResult, deleteInvestmentResult, updateResultMonth } =
  investmentsResultSlice.actions;
export const investmentsResultReducer = investmentsResultSlice.reducer;

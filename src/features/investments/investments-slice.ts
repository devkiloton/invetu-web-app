import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { firebaseClient } from '~/clients/firebase-client/firebase-client';
import {
  Investments,
  Stock,
} from '~/clients/firebase-client/models/Investments';
import { AsyncStateRedux } from '../types/async-state';
import { useAuth } from '~/lib/firebase';

const initialState: Investments & { asyncState: AsyncStateRedux } = {
  stocks: [],
  cryptos: [],
  treasuries: [],
  companyLoans: [],
  cash: [],
  investedAmount: 0,
  asyncState: {
    isLoading: false,
    isLoaded: false,
    error: null,
  },
};

export const fetchInvestments: any = createAsyncThunk(
  'investments/fetchInvestments',
  async () => {
    const auth = useAuth();
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('User not found');
    const res = await firebaseClient().firestore.investments.get(uid);
    const data = res;
    return data;
  },
);

export const investmentsSlice = createSlice({
  name: 'investments',
  initialState,
  reducers: {
    updateStocks: (state, action: PayloadAction<Stock>) => {
      state.stocks = [...state.stocks, action.payload];
      state.investedAmount =
        state.investedAmount + action.payload.price * action.payload.amount;
    },
    deleteStock: (state, action: PayloadAction<string>) => {
      const stock = state.stocks.find(stock => stock.ticker === action.payload);
      if (!stock) return;
      state.investedAmount = state.investedAmount - stock.price * stock.amount;
      state.stocks = state.stocks.filter(
        stock => stock.ticker !== action.payload,
      );
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchInvestments.pending, state => {
      state.asyncState.isLoading = true;
    });
    builder.addCase(
      fetchInvestments.fulfilled,
      (_state, action: PayloadAction<Investments>) => {
        return {
          ...action.payload,
          asyncState: { isLoading: false, error: null, isLoaded: true },
        };
      },
    );
    builder.addCase(fetchInvestments.rejected, (state, action) => {
      state.asyncState.isLoading = false;
      state.asyncState.error =
        action.error.message ?? new Error('Fetch investments failed').message;
    });
  },
});

export const { deleteStock, updateStocks } = investmentsSlice.actions;
export const investmentsReducer = investmentsSlice.reducer;
import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { firebaseClient } from '~/clients/firebase-client/firebase-client';
import { AsyncStateRedux } from '../types/async-state';
import {
  HistoryStockBR,
  Result,
} from '~/clients/firebase-client/models/history-stock-br';
import { useAuth } from '~/lib/firebase';
import getStocksHighestDateRange from '~/helpers/get-stocks-highest-date-range';
import {
  DataCryptos,
  HistoryCryptoUS,
} from '~/clients/firebase-client/models/data-cryptos';
import {
  CryptoCurrency,
  StatusCryptos,
} from '~/clients/firebase-client/models/status-cryptos';
import { Fiats } from '~/clients/firebase-client/models/fiats';
import { HistoryIPCA } from '~/clients/bacen-client/models/history-ipca';
import { HistoryCDI } from '~/clients/bacen-client/models/history-cdi';
import bacenClient from '~/clients/bacen-client';

type InvestmentsData = {
  stocks: { stockData: Result[]; asyncState: AsyncStateRedux };
  cryptos: {
    statusCryptos: CryptoCurrency[];
    dataCryptos: DataCryptos;
    asyncState: AsyncStateRedux;
  };
  fixedIncomes: {
    cdi: {
      monthly: HistoryCDI;
      daily: HistoryCDI;
    };
    ipca: HistoryIPCA;
    asyncState: AsyncStateRedux;
  };
  fiats: {
    fiatData: Fiats;
    asyncState: AsyncStateRedux;
  };
};

const initialState: InvestmentsData = {
  stocks: {
    stockData: [],
    asyncState: {
      isLoading: false,
      isLoaded: false,
      error: null,
    },
  },
  cryptos: {
    statusCryptos: [],
    dataCryptos: [],
    asyncState: {
      isLoading: false,
      isLoaded: false,
      error: null,
    },
  },
  fixedIncomes: {
    cdi: {
      monthly: [],
      daily: [],
    },
    ipca: [],
    asyncState: {
      isLoading: false,
      isLoaded: false,
      error: null,
    },
  },
  fiats: {
    fiatData: [],
    asyncState: {
      isLoading: false,
      isLoaded: false,
      error: null,
    },
  },
};

export const fetchAllStocksData: any = createAsyncThunk(
  'investments-data/fetchAllStocksData',
  async (_arg, { getState }) => {
    const state = getState() as any;
    if (state.investmentsData.stocks.asyncState.isLoaded)
      return state.investmentsData.stocks.stockData;
    const auth = useAuth();
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('User not found');
    const investments = await firebaseClient().firestore.investments.get(uid);
    const joinedStocks = investments.stocks.map(stock => stock.ticker);

    const stocksData = getStocksHighestDateRange(investments.stocks);

    if (stocksData.stocksMaxRangeTickers.length === 0) {
      return await firebaseClient()
        .functions.findHistoryStocksBR(
          joinedStocks,
          stocksData.highestRange,
          '1d',
        )
        .then(res => {
          res[0] as HistoryStockBR;
          const data = res[0].results.reduce(
            (acc, result) => {
              acc[result.symbol] = result;
              return acc;
            },
            {} as Record<string, Result>,
          );
          return [
            ...Object.values(data),
            ...state.investmentsData.stocks.stockData,
          ];
        });
    } else {
      // Create two promises, one for the stocks with max range and another for the stocks with the highest range, then join them in a way that has the same signature as the first if block
      const maxRangePromise =
        stocksData.stocksMaxRangeTickers.length === 0
          ? firebaseClient().functions.findHistoryStocksBR(
              stocksData.stocksMaxRangeTickers,
              'max',
              '5d',
            )
          : new Promise<[]>(() => []);
      const highestRangePromise =
        firebaseClient().functions.findHistoryStocksBR(
          joinedStocks,
          stocksData.highestRange,
          '1d',
        );
      const [maxRange, highestRange] = await Promise.all([
        maxRangePromise,
        highestRangePromise,
      ]);
      const maxRangeData = maxRange[0].results.reduce(
        (acc, result) => {
          acc[result.symbol] = result;
          return acc;
        },
        {} as Record<string, Result>,
      );
      const highestRangeData = highestRange[0].results.reduce(
        (acc, result) => {
          acc[result.symbol] = result;
          return acc;
        },
        {} as Record<string, Result>,
      );
      return [
        ...Object.values(maxRangeData),
        ...Object.values(highestRangeData),
      ];
    }
  },
);

export const fetchCryptoStatus: any = createAsyncThunk(
  'investments-data/fetchCryptoStatus',
  async () => {
    const statusCryptos = await firebaseClient().functions.findAllCryptos();
    return statusCryptos;
  },
);

export const fetchCryptoData: any = createAsyncThunk(
  'investments-data/fetchCryptoData',
  async () => {
    const auth = useAuth();
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('User not found');
    const investments = await firebaseClient().firestore.investments.get(uid);
    const joinedCryptos = investments.cryptos.map(crypto => crypto.ticker);
    if (joinedCryptos.length === 0) return Promise.resolve([]);
    const dataCryptos = await firebaseClient().functions.findCryptosData(
      joinedCryptos,
      'all',
    );
    return dataCryptos;
  },
);

export const fetchFiats: any = createAsyncThunk(
  'investments-data/fetchFiats',
  async () => {
    const fiats = await firebaseClient().functions.findFiats();
    return fiats;
  },
);

export const fetchAllFixedIncomeData: any = createAsyncThunk(
  'investments-data/fetchAllFixedIncomeData',
  async () => {
    const cdiMonthly = await bacenClient().cdi.findMonthlyHistory();
    const cdiDaily = await bacenClient().cdi.findDailyHistory();
    const cdi = { monthly: cdiMonthly, daily: cdiDaily };
    const ipca = await bacenClient().ipca.findHistory();
    const fixedIncomes = { cdi, ipca };

    return fixedIncomes;
  },
);

export const investmentsDataSlice = createSlice({
  name: 'investments-data',
  initialState,
  reducers: {
    addStockData: (state, action: PayloadAction<Result>) => {
      state.stocks = {
        stockData: [...state.stocks.stockData, action.payload],
        asyncState: { isLoading: false, error: null, isLoaded: true },
      };
    },
    deleteStockData: (state, action: PayloadAction<string>) => {
      state.stocks.stockData = state.stocks.stockData.filter(
        stock => stock.symbol !== action.payload,
      );
    },
    addCryptoData: (state, action: PayloadAction<HistoryCryptoUS>) => {
      state.cryptos.dataCryptos = [
        ...state.cryptos.dataCryptos,
        action.payload,
      ];
    },
    deleteCryptoData: (state, action: PayloadAction<string>) => {
      state.cryptos.dataCryptos = state.cryptos.dataCryptos.filter(
        crypto => crypto.id !== action.payload,
      );
    },
  },
  extraReducers: builder => {
    // Stocks extra reducers
    builder.addCase(fetchAllStocksData.pending, state => {
      state.stocks.asyncState.isLoading = true;
    });
    builder.addCase(
      fetchAllStocksData.fulfilled,
      (_state, action: PayloadAction<Result[]>) => {
        return {
          ..._state,
          stocks: {
            ..._state.stocks,
            stockData: action.payload,
            asyncState: { isLoading: false, error: null, isLoaded: true },
          },
        };
      },
    );
    builder.addCase(fetchAllStocksData.rejected, (state, action) => {
      state.stocks.asyncState.isLoading = false;
      state.stocks.asyncState.error =
        action.error.message ?? new Error('Fetch investments failed').message;
    });
    // Cryptos extra reducers
    builder.addCase(
      fetchCryptoStatus.fulfilled,
      (state, action: PayloadAction<StatusCryptos>) => {
        return {
          ...state,
          cryptos: {
            ...state.cryptos,
            statusCryptos: action.payload.result,
            asyncState: {
              isLoading: false,
              isLoaded: true,
              error: null,
            },
          },
        };
      },
    );
    builder.addCase(
      fetchCryptoData.fulfilled,
      (state, action: PayloadAction<DataCryptos>) => {
        return {
          ...state,
          cryptos: {
            ...state.cryptos,
            dataCryptos: action.payload,
            asyncState: {
              isLoading: false,
              isLoaded: true,
              error: null,
            },
          },
        };
      },
    );
    // Fiats extra reducers
    builder.addCase(
      fetchFiats.fulfilled,
      (state, action: PayloadAction<Fiats>) => {
        return {
          ...state,
          fiats: {
            ...state.fiats,
            fiatData: action.payload,
          },
        };
      },
    );
    // Fixed Income extra reducers
    builder.addCase(
      fetchAllFixedIncomeData.fulfilled,
      (
        state,
        action: PayloadAction<{
          cdi: {
            monthly: HistoryCDI;
            daily: HistoryCDI;
          };
          ipca: HistoryIPCA;
        }>,
      ) => {
        return {
          ...state,
          fixedIncomes: {
            ...state.fixedIncomes,
            cdi: action.payload.cdi,
            ipca: action.payload.ipca,
            asyncState: {
              isLoading: false,
              isLoaded: true,
              error: null,
            },
          },
        };
      },
    );
  },
});

export const {
  addStockData,
  deleteStockData,
  addCryptoData,
  deleteCryptoData,
} = investmentsDataSlice.actions;
export const investmentsDataReducer = investmentsDataSlice.reducer;

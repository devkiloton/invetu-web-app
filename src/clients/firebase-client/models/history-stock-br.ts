/* eslint-disable no-unused-vars */
export type HistoricalDataPrice = {
  date: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjustedClose: number;
};

export enum CashDividendLabel {
  dividendo = 'DIVIDENDO',
  jrsCapProprio = 'JRS CAP PROPRIO',
  rendimento = 'RENDIMENTO',
  amortizacao = 'AMORTIZACAO RF',
}

export type CashDividend = {
  assetIssued: string;
  paymentDate: string;
  rate: number;
  relatedTo: string;
  approvedOn: string;
  isinCode: string;
  label: CashDividendLabel;
  lastDatePrior: string;
  remarks: string;
};

export enum StockDividendLabel {
  desdobramento = 'DESDOBRAMENTO',
  grupamento = 'GRUPAMENTO',
  cisRedCap = 'CIS RED CAP',
  bonificacao = 'BONIFICACAO',
}

export type StockDividend = {
  assetIssued: string;
  factor: number;
  approvedOn: string;
  isinCode: string;
  // CIS RED CAP: https://www.infomoney.com.br/mercados/atencao-5-acoes-da-bovespa-sofrem-alteracao-nos-precos-apos-proventos-nesta-6a/
  label: StockDividendLabel;
  lastDatePrior: string;
  remarks: string;
};

export type Subscription = {
  assetIssued: string;
  percentage: number;
  priceUnit: number;
  tradingPeriod: string;
  subscriptionDate: string;
  approvedOn: string;
  isinCode: string;
  label: 'SUBSCRICAO';
  lastDatePrior: string;
  remarks: string;
};

export type DividendsData = {
  cashDividends: CashDividend[];
  stockDividends: StockDividend[];
  subscriptions: Subscription[];
};

export type Result = {
  symbol: string;
  currency: string;
  twoHundredDayAverage: number;
  twoHundredDayAverageChange: number;
  twoHundredDayAverageChangePercent: number;
  marketCap?: number;
  shortName: string;
  longName: string;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketTime: string;
  regularMarketPrice: number;
  regularMarketDayHigh: number;
  regularMarketDayRange: string;
  regularMarketDayLow: number;
  regularMarketVolume: number;
  regularMarketPreviousClose: number;
  regularMarketOpen: number;
  averageDailyVolume3Month: number;
  averageDailyVolume10Day: number;
  fiftyTwoWeekLowChange: number;
  fiftyTwoWeekLowChangePercent?: number;
  fiftyTwoWeekRange: string;
  fiftyTwoWeekHighChange: number;
  fiftyTwoWeekHighChangePercent: number;
  fiftyTwoWeekLow: number;
  fiftyTwoWeekHigh: number;
  priceEarnings?: number;
  earningsPerShare?: number;
  logourl: string;
  updatedAt: string;
  usedInterval?: string;
  usedRange?: string;
  historicalDataPrice: HistoricalDataPrice[];
  validRanges: string[];
  validIntervals: string[];
  dividendsData: DividendsData;
};

export type HistoryStockBR = {
  results: Result[];
  requestedAt: string;
  took: string;
};

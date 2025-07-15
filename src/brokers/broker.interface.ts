import type { Holding, Position } from "../types/portfolio.js";
import type { StockQuote, OHLCVCandle } from "../types/market.js";
import type { FundsInfo } from "../types/funds.js";

export interface IBroker {
  readonly name: string;

  getHoldings(): Promise<Holding[]>;
  getPositions(): Promise<Position[]>;
  getQuote(symbols: string[]): Promise<StockQuote[]>;
  getLTP(symbols: string[]): Promise<Record<string, number>>;
  getHistoricalCandles(
    instrumentKey: string,
    interval: string,
    fromDate: string,
    toDate: string
  ): Promise<OHLCVCandle[]>;
  getFunds(): Promise<FundsInfo>;
  isAuthenticated(): boolean;
}

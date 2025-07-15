import type { BrokerSource } from "./common.js";

export interface Holding {
  broker: BrokerSource;
  tradingSymbol: string;
  exchange: string;
  isin: string;
  instrumentToken: string;
  quantity: number;
  averagePrice: number;
  lastPrice: number;
  currentValue: number;
  investedValue: number;
  pnl: number;
  pnlPercent: number;
  dayChange: number;
  dayChangePercent: number;
}

export interface Position {
  broker: BrokerSource;
  tradingSymbol: string;
  exchange: string;
  product: string;
  quantity: number;
  averagePrice: number;
  lastPrice: number;
  pnl: number;
  buyValue: number;
  sellValue: number;
  unrealisedPnl: number;
  realisedPnl: number;
}

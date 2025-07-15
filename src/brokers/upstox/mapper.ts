import type { Holding, Position } from "../../types/portfolio.js";
import type { StockQuote, OHLCVCandle } from "../../types/market.js";
import type { FundsInfo } from "../../types/funds.js";

export function mapUpstoxHolding(raw: any): Holding {
  const investedValue = (raw.average_price ?? 0) * (raw.quantity ?? 0);
  const currentValue = (raw.last_price ?? 0) * (raw.quantity ?? 0);
  const pnl = currentValue - investedValue;
  return {
    broker: "upstox",
    tradingSymbol: raw.trading_symbol ?? raw.tradingsymbol ?? "",
    exchange: raw.exchange ?? "",
    isin: raw.isin ?? "",
    instrumentToken: raw.instrument_token ?? "",
    quantity: raw.quantity ?? 0,
    averagePrice: raw.average_price ?? 0,
    lastPrice: raw.last_price ?? 0,
    currentValue,
    investedValue,
    pnl: raw.pnl ?? pnl,
    pnlPercent: investedValue > 0 ? (pnl / investedValue) * 100 : 0,
    dayChange: raw.day_change ?? 0,
    dayChangePercent: raw.day_change_percentage ?? 0,
  };
}

export function mapUpstoxPosition(raw: any): Position {
  return {
    broker: "upstox",
    tradingSymbol: raw.trading_symbol ?? raw.tradingsymbol ?? "",
    exchange: raw.exchange ?? "",
    product: raw.product ?? "",
    quantity: raw.quantity ?? 0,
    averagePrice: raw.average_price ?? raw.buy_price ?? 0,
    lastPrice: raw.last_price ?? 0,
    pnl: raw.pnl ?? (raw.unrealised ?? 0) + (raw.realised ?? 0),
    buyValue: raw.buy_value ?? raw.day_buy_value ?? 0,
    sellValue: raw.sell_value ?? raw.day_sell_value ?? 0,
    unrealisedPnl: raw.unrealised ?? 0,
    realisedPnl: raw.realised ?? 0,
  };
}

export function mapUpstoxQuote(key: string, raw: any): StockQuote {
  return {
    symbol: raw.symbol ?? key,
    exchange: key.split("|")[0]?.replace("_EQ", "") ?? "",
    lastPrice: raw.last_price ?? 0,
    open: raw.ohlc?.open ?? 0,
    high: raw.ohlc?.high ?? 0,
    low: raw.ohlc?.low ?? 0,
    close: raw.ohlc?.close ?? 0,
    volume: raw.volume ?? 0,
    change: raw.net_change ?? 0,
    changePercent: raw.ohlc?.close
      ? ((raw.last_price - raw.ohlc.close) / raw.ohlc.close) * 100
      : 0,
    timestamp: raw.timestamp ?? new Date().toISOString(),
  };
}

export function mapUpstoxCandle(raw: any[]): OHLCVCandle {
  return {
    timestamp: raw[0] ?? "",
    open: raw[1] ?? 0,
    high: raw[2] ?? 0,
    low: raw[3] ?? 0,
    close: raw[4] ?? 0,
    volume: raw[5] ?? 0,
    oi: raw[6] ?? 0,
  };
}

export function mapUpstoxFunds(raw: any): FundsInfo {
  const equity = raw?.equity ?? raw;
  return {
    broker: "upstox",
    availableMargin: equity?.available_margin ?? 0,
    usedMargin: equity?.used_margin ?? 0,
    totalBalance:
      (equity?.available_margin ?? 0) + (equity?.used_margin ?? 0),
    collateral: equity?.collateral ?? 0,
    payinAmount: equity?.payin_amount ?? 0,
  };
}

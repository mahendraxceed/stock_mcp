import type { Holding, Position } from "../../types/portfolio.js";
import type { StockQuote, OHLCVCandle } from "../../types/market.js";
import type { FundsInfo } from "../../types/funds.js";
import type * as RupeezyTypes from "@rupeezy/jsvortex";

type RupeezyHolding = RupeezyTypes.Constants.Holding;
type RupeezyPosition = RupeezyTypes.Constants.Position;
type RupeezyFundDetails = RupeezyTypes.Constants.FundDetails;

export function mapRupeezyHolding(raw: RupeezyHolding): Holding {
  const symbol =
    raw.nse?.symbol ?? raw.bse?.symbol ?? "";
  const exchange =
    raw.nse ? "NSE" : raw.bse ? "BSE" : "";
  const quantity = raw.total_free ?? 0;
  const avgPrice = raw.average_price ?? 0;
  const lastPrice = raw.last_price ?? 0;
  const investedValue = avgPrice * quantity;
  const currentValue = lastPrice * quantity;
  const pnl = currentValue - investedValue;

  return {
    broker: "rupeezy",
    tradingSymbol: symbol,
    exchange,
    isin: raw.isin ?? "",
    instrumentToken: String(raw.nse?.token ?? raw.bse?.token ?? ""),
    quantity,
    averagePrice: avgPrice,
    lastPrice,
    currentValue,
    investedValue,
    pnl,
    pnlPercent: investedValue > 0 ? (pnl / investedValue) * 100 : 0,
    dayChange: 0,
    dayChangePercent: 0,
  };
}

export function mapRupeezyPosition(raw: RupeezyPosition): Position {
  const netQty = raw.quantity ?? 0;
  const buyValue = raw.buy_value ?? 0;
  const sellValue = raw.sell_value ?? 0;
  const pnl = raw.value ?? sellValue - buyValue;

  return {
    broker: "rupeezy",
    tradingSymbol: raw.symbol ?? "",
    exchange: raw.exchange ?? "",
    product: raw.product ?? "",
    quantity: netQty,
    averagePrice: raw.average_price ?? 0,
    lastPrice: 0,
    pnl,
    buyValue,
    sellValue,
    unrealisedPnl: pnl,
    realisedPnl: 0,
  };
}

export function mapRupeezyQuote(
  key: string,
  raw: any
): StockQuote {
  // Rupeezy prices may be in paisa — check magnitude
  const divisor = raw.last_trade_price > 100000 ? 100 : 1;
  const lastPrice = (raw.last_trade_price ?? 0) / divisor;
  const open = (raw.open_price ?? 0) / divisor;
  const high = (raw.high_price ?? 0) / divisor;
  const low = (raw.low_price ?? 0) / divisor;
  const close = (raw.close_price ?? 0) / divisor;
  const change = lastPrice - close;

  return {
    symbol: key,
    exchange: raw.exchange ?? key.split("-")[0]?.replace("_EQ", "") ?? "",
    lastPrice,
    open,
    high,
    low,
    close,
    volume: raw.volume ?? 0,
    change,
    changePercent: close > 0 ? (change / close) * 100 : 0,
    timestamp: raw.last_trade_time
      ? new Date(raw.last_trade_time * 1000).toISOString()
      : new Date().toISOString(),
  };
}

export function mapRupeezyCandles(
  raw: RupeezyTypes.Constants.HistoricalResponse
): OHLCVCandle[] {
  if (!raw?.t?.length) return [];
  return raw.t.map((ts, i) => ({
    timestamp: new Date(ts * 1000).toISOString(),
    open: raw.o[i] ?? 0,
    high: raw.h[i] ?? 0,
    low: raw.l[i] ?? 0,
    close: raw.c[i] ?? 0,
    volume: raw.v[i] ?? 0,
  }));
}

export function mapRupeezyFunds(raw: RupeezyFundDetails): FundsInfo {
  return {
    broker: "rupeezy",
    availableMargin: raw.net_available ?? 0,
    usedMargin: raw.total_utilization ?? 0,
    totalBalance: raw.total_trading_power ?? 0,
    collateral: raw.collateral ?? 0,
    payinAmount: raw.deposit ?? 0,
  };
}

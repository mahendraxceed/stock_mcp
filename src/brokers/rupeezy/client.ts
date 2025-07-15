import { VortexAPI, Constants } from "@rupeezy/jsvortex";
import type { IBroker } from "../broker.interface.js";
import type { AppConfig } from "../../config.js";
import type { Holding, Position } from "../../types/portfolio.js";
import type { StockQuote, OHLCVCandle } from "../../types/market.js";
import type { FundsInfo } from "../../types/funds.js";
import {
  mapRupeezyHolding,
  mapRupeezyPosition,
  mapRupeezyQuote,
  mapRupeezyCandles,
  mapRupeezyFunds,
} from "./mapper.js";
import { logger } from "../../utils/logger.js";

const RESOLUTION_MAP: Record<string, Constants.Resolutions> = {
  "1minute": Constants.Resolutions.MIN_1,
  "5minute": Constants.Resolutions.MIN_5,
  "15minute": Constants.Resolutions.MIN_15,
  "30minute": Constants.Resolutions.MIN_30,
  "1hour": Constants.Resolutions.MIN_60,
  day: Constants.Resolutions.DAY,
  week: Constants.Resolutions.WEEK,
  month: Constants.Resolutions.MONTH,
};

export class RupeezyBroker implements IBroker {
  readonly name = "rupeezy";
  private client: VortexAPI;

  constructor(private config: AppConfig["rupeezy"]) {
    this.client = new VortexAPI(config.apiSecret, config.applicationId);
    if (config.accessToken) {
      this.client.set_access_token(config.accessToken);
    }
    logger.info("Rupeezy broker initialized");
  }

  async getHoldings(): Promise<Holding[]> {
    const res = await this.client.holdings();
    return (res.data || []).map(mapRupeezyHolding);
  }

  async getPositions(): Promise<Position[]> {
    const res = await this.client.positions();
    return (res.data?.net || []).map(mapRupeezyPosition);
  }

  async getQuote(instruments: string[]): Promise<StockQuote[]> {
    const res = await this.client.quotes(
      instruments,
      Constants.QuoteModes.OHLCV
    );
    return Object.entries(res.data || {}).map(([key, val]) =>
      mapRupeezyQuote(key, val)
    );
  }

  async getLTP(instruments: string[]): Promise<Record<string, number>> {
    const res = await this.client.quotes(
      instruments,
      Constants.QuoteModes.LTP
    );
    const result: Record<string, number> = {};
    for (const [key, val] of Object.entries(res.data || {})) {
      const ltp = (val as any).last_trade_price ?? 0;
      result[key] = ltp > 100000 ? ltp / 100 : ltp;
    }
    return result;
  }

  async getHistoricalCandles(
    instrumentKey: string,
    interval: string,
    fromDate: string,
    toDate: string
  ): Promise<OHLCVCandle[]> {
    // instrumentKey format: "NSE_EQ-2885"
    const parts = instrumentKey.split("-");
    const exchange = parts[0] as Constants.ExchangeTypes;
    const token = parseInt(parts[1] ?? "0", 10);
    const resolution = RESOLUTION_MAP[interval] ?? Constants.Resolutions.DAY;

    const res = await this.client.historical_candles(
      exchange,
      token,
      new Date(toDate),
      new Date(fromDate),
      resolution
    );
    return mapRupeezyCandles(res);
  }

  async getFunds(): Promise<FundsInfo> {
    const res = await this.client.funds();
    return mapRupeezyFunds(
      res.exchange_combined ?? (res as any).data?.exchange_combined ?? res
    );
  }

  isAuthenticated(): boolean {
    return !!this.config.accessToken;
  }
}

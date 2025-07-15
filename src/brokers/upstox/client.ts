import UpstoxClient from "upstox-js-sdk";
import type { IBroker } from "../broker.interface.js";
import type { AppConfig } from "../../config.js";
import type { Holding, Position } from "../../types/portfolio.js";
import type { StockQuote, OHLCVCandle } from "../../types/market.js";
import type { FundsInfo } from "../../types/funds.js";
import {
  mapUpstoxHolding,
  mapUpstoxPosition,
  mapUpstoxQuote,
  mapUpstoxCandle,
  mapUpstoxFunds,
} from "./mapper.js";
import { logger } from "../../utils/logger.js";

export class UpstoxBroker implements IBroker {
  readonly name = "upstox";
  private portfolioApi: any;
  private marketQuoteApi: any;
  private historyApi: any;
  private userApi: any;

  constructor(private config: AppConfig["upstox"]) {
    const defaultClient = UpstoxClient.ApiClient.instance;
    const oauth2 = defaultClient.authentications["OAUTH2"];
    oauth2.accessToken = config.accessToken;

    this.portfolioApi = new UpstoxClient.PortfolioApi();
    this.marketQuoteApi = new UpstoxClient.MarketQuoteApi();
    this.historyApi = new UpstoxClient.HistoryApi();
    this.userApi = new UpstoxClient.UserApi();
    logger.info("Upstox broker initialized");
  }

  async getHoldings(): Promise<Holding[]> {
    return new Promise((resolve, reject) => {
      this.portfolioApi.getHoldings("2.0", (error: any, data: any) => {
        if (error) return reject(new Error(this.extractError(error)));
        resolve((data?.data || []).map(mapUpstoxHolding));
      });
    });
  }

  async getPositions(): Promise<Position[]> {
    return new Promise((resolve, reject) => {
      this.portfolioApi.getPositions("2.0", (error: any, data: any) => {
        if (error) return reject(new Error(this.extractError(error)));
        resolve((data?.data || []).map(mapUpstoxPosition));
      });
    });
  }

  async getQuote(instrumentKeys: string[]): Promise<StockQuote[]> {
    return new Promise((resolve, reject) => {
      this.marketQuoteApi.getFullMarketQuote(
        instrumentKeys.join(","),
        "2.0",
        (error: any, data: any) => {
          if (error) return reject(new Error(this.extractError(error)));
          const quotes = Object.entries(data?.data || {}).map(
            ([key, val]) => mapUpstoxQuote(key, val)
          );
          resolve(quotes);
        }
      );
    });
  }

  async getLTP(instrumentKeys: string[]): Promise<Record<string, number>> {
    return new Promise((resolve, reject) => {
      this.marketQuoteApi.ltp(
        instrumentKeys.join(","),
        "2.0",
        (error: any, data: any) => {
          if (error) return reject(new Error(this.extractError(error)));
          const result: Record<string, number> = {};
          for (const [key, val] of Object.entries(data?.data || {})) {
            result[key] = (val as any).last_price ?? 0;
          }
          resolve(result);
        }
      );
    });
  }

  async getHistoricalCandles(
    instrumentKey: string,
    interval: string,
    fromDate: string,
    toDate: string
  ): Promise<OHLCVCandle[]> {
    return new Promise((resolve, reject) => {
      this.historyApi.getHistoricalCandleData1(
        instrumentKey,
        interval,
        toDate,
        fromDate,
        "2.0",
        (error: any, data: any) => {
          if (error) return reject(new Error(this.extractError(error)));
          const candles = (data?.data?.candles || []).map(mapUpstoxCandle);
          resolve(candles);
        }
      );
    });
  }

  async getFunds(): Promise<FundsInfo> {
    return new Promise((resolve, reject) => {
      this.userApi.getUserFundMargin(
        "2.0",
        (error: any, data: any) => {
          if (error) return reject(new Error(this.extractError(error)));
          resolve(mapUpstoxFunds(data?.data));
        }
      );
    });
  }

  isAuthenticated(): boolean {
    return !!this.config.accessToken;
  }

  private extractError(error: any): string {
    if (typeof error === "string") return error;
    if (error?.response?.body?.message) return error.response.body.message;
    if (error?.message) return error.message;
    return JSON.stringify(error);
  }
}

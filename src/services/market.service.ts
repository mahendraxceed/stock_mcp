import type { IBroker } from "../brokers/broker.interface.js";
import type { BrokerSource } from "../types/common.js";
import type { StockQuote, OHLCVCandle } from "../types/market.js";

export class MarketService {
  constructor(private brokers: Map<string, IBroker>) {}

  async getQuotes(
    instruments: string[],
    source: BrokerSource = "upstox"
  ): Promise<StockQuote[]> {
    const broker = this.pickOne(source);
    return broker.getQuote(instruments);
  }

  async getLTP(
    instruments: string[],
    source: BrokerSource = "upstox"
  ): Promise<Record<string, number>> {
    const broker = this.pickOne(source);
    return broker.getLTP(instruments);
  }

  async getHistoricalData(
    instrumentKey: string,
    interval: string,
    fromDate: string,
    toDate: string,
    source: BrokerSource = "upstox"
  ): Promise<OHLCVCandle[]> {
    const broker = this.pickOne(source);
    return broker.getHistoricalCandles(instrumentKey, interval, fromDate, toDate);
  }

  private pickOne(source: BrokerSource): IBroker {
    if (source === "all") {
      const first = this.brokers.values().next().value;
      if (!first) throw new Error("No brokers configured");
      return first;
    }
    const broker = this.brokers.get(source);
    if (!broker) throw new Error(`Broker "${source}" is not configured`);
    return broker;
  }
}

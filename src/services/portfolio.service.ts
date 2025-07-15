import type { IBroker } from "../brokers/broker.interface.js";
import type { BrokerSource } from "../types/common.js";
import type { Holding, Position } from "../types/portfolio.js";
import { logger } from "../utils/logger.js";

export class PortfolioService {
  constructor(private brokers: Map<string, IBroker>) {}

  async getHoldings(source: BrokerSource = "all"): Promise<Holding[]> {
    const targets = this.resolveBrokers(source);
    const results = await Promise.allSettled(
      targets.map((b) => b.getHoldings())
    );
    const holdings: Holding[] = [];
    for (const r of results) {
      if (r.status === "fulfilled") {
        holdings.push(...r.value);
      } else {
        logger.error("Failed to fetch holdings:", r.reason);
      }
    }
    return holdings;
  }

  async getPositions(source: BrokerSource = "all"): Promise<Position[]> {
    const targets = this.resolveBrokers(source);
    const results = await Promise.allSettled(
      targets.map((b) => b.getPositions())
    );
    const positions: Position[] = [];
    for (const r of results) {
      if (r.status === "fulfilled") {
        positions.push(...r.value);
      } else {
        logger.error("Failed to fetch positions:", r.reason);
      }
    }
    return positions;
  }

  private resolveBrokers(source: BrokerSource): IBroker[] {
    if (source === "all") return [...this.brokers.values()];
    const broker = this.brokers.get(source);
    if (!broker) throw new Error(`Broker "${source}" is not configured`);
    return [broker];
  }
}

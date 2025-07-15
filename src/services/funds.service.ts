import type { IBroker } from "../brokers/broker.interface.js";
import type { BrokerSource } from "../types/common.js";
import type { FundsInfo } from "../types/funds.js";
import { logger } from "../utils/logger.js";

export class FundsService {
  constructor(private brokers: Map<string, IBroker>) {}

  async getFunds(source: BrokerSource = "all"): Promise<FundsInfo[]> {
    const targets = this.resolveBrokers(source);
    const results = await Promise.allSettled(
      targets.map((b) => b.getFunds())
    );
    const funds: FundsInfo[] = [];
    for (const r of results) {
      if (r.status === "fulfilled") {
        funds.push(r.value);
      } else {
        logger.error("Failed to fetch funds:", r.reason);
      }
    }
    return funds;
  }

  private resolveBrokers(source: BrokerSource): IBroker[] {
    if (source === "all") return [...this.brokers.values()];
    const broker = this.brokers.get(source);
    if (!broker) throw new Error(`Broker "${source}" is not configured`);
    return [broker];
  }
}

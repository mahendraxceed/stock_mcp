import type { IBroker } from "../brokers/broker.interface.js";
import type { BrokerSource } from "../types/common.js";
import type { Holding } from "../types/portfolio.js";
import { PortfolioService } from "./portfolio.service.js";

export interface PortfolioAnalysis {
  totalInvested: number;
  currentValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  totalHoldings: number;
  topGainers: { symbol: string; pnlPercent: number; pnl: number }[];
  topLosers: { symbol: string; pnlPercent: number; pnl: number }[];
  concentrationRisk: { symbol: string; percentage: number; value: number }[];
  diversificationScore: number;
  brokerBreakdown: { broker: string; value: number; count: number }[];
}

export class AnalysisService {
  private portfolioService: PortfolioService;

  constructor(brokers: Map<string, IBroker>) {
    this.portfolioService = new PortfolioService(brokers);
  }

  async analyzePortfolio(
    source: BrokerSource = "all",
    includePositions = false
  ): Promise<PortfolioAnalysis> {
    const holdings = await this.portfolioService.getHoldings(source);

    const totalInvested = holdings.reduce((s, h) => s + h.investedValue, 0);
    const currentValue = holdings.reduce((s, h) => s + h.currentValue, 0);
    const totalPnl = currentValue - totalInvested;
    const totalPnlPercent =
      totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

    // Sort by P&L %
    const sorted = [...holdings].sort(
      (a, b) => b.pnlPercent - a.pnlPercent
    );
    const topGainers = sorted
      .filter((h) => h.pnlPercent > 0)
      .slice(0, 5)
      .map((h) => ({
        symbol: h.tradingSymbol,
        pnlPercent: round(h.pnlPercent),
        pnl: round(h.pnl),
      }));
    const topLosers = sorted
      .filter((h) => h.pnlPercent < 0)
      .slice(-5)
      .reverse()
      .map((h) => ({
        symbol: h.tradingSymbol,
        pnlPercent: round(h.pnlPercent),
        pnl: round(h.pnl),
      }));

    // Concentration risk — top holdings by weight
    const byWeight = [...holdings]
      .sort((a, b) => b.currentValue - a.currentValue)
      .slice(0, 10)
      .map((h) => ({
        symbol: h.tradingSymbol,
        percentage: round(
          currentValue > 0 ? (h.currentValue / currentValue) * 100 : 0
        ),
        value: round(h.currentValue),
      }));

    // Diversification score using HHI
    const diversificationScore = this.calcDiversificationScore(
      holdings,
      currentValue
    );

    // Broker breakdown
    const brokerMap = new Map<string, { value: number; count: number }>();
    for (const h of holdings) {
      const entry = brokerMap.get(h.broker) ?? { value: 0, count: 0 };
      entry.value += h.currentValue;
      entry.count += 1;
      brokerMap.set(h.broker, entry);
    }
    const brokerBreakdown = [...brokerMap.entries()].map(([broker, data]) => ({
      broker,
      value: round(data.value),
      count: data.count,
    }));

    return {
      totalInvested: round(totalInvested),
      currentValue: round(currentValue),
      totalPnl: round(totalPnl),
      totalPnlPercent: round(totalPnlPercent),
      totalHoldings: holdings.length,
      topGainers,
      topLosers,
      concentrationRisk: byWeight,
      diversificationScore,
      brokerBreakdown,
    };
  }

  /**
   * Calculates diversification score (0-100) from Herfindahl-Hirschman Index.
   * 100 = perfectly diversified, 0 = single stock.
   */
  private calcDiversificationScore(
    holdings: Holding[],
    totalValue: number
  ): number {
    if (holdings.length <= 1 || totalValue <= 0) return 0;

    const hhi = holdings.reduce((sum, h) => {
      const weight = h.currentValue / totalValue;
      return sum + weight * weight;
    }, 0);

    // HHI ranges from 1/n (perfect) to 1 (single stock)
    // Normalize to 0-100 scale
    const minHhi = 1 / holdings.length;
    const maxHhi = 1;
    const normalized =
      maxHhi === minHhi ? 100 : ((maxHhi - hhi) / (maxHhi - minHhi)) * 100;

    return round(Math.max(0, Math.min(100, normalized)));
  }
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

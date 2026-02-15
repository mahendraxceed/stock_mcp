import { renderLayout } from "./layout.js";
import { renderDashboardTab } from "./dashboard.view.js";
import { renderPortfolioTab } from "./portfolio.view.js";
import { renderPositionsTab } from "./positions.view.js";
import { renderFundsTab } from "./funds.view.js";
import { renderToolsTab } from "./tools.view.js";
import { renderScripts } from "./scripts.js";

export interface DashboardContext {
  port: number;
  upstox: boolean;
  rupeezy: boolean;
  sessions: number;
}

export function renderDashboard(ctx: DashboardContext): string {
  const content = [
    renderDashboardTab(ctx),
    renderPortfolioTab(),
    renderPositionsTab(),
    renderFundsTab(),
    renderToolsTab(),
  ].join("\n");

  return renderLayout(ctx, content, renderScripts());
}

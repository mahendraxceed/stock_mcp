import { VortexAPI } from "@rupeezy/jsvortex";
import type { AppConfig } from "../../config.js";
import { logger } from "../../utils/logger.js";

const RUPEEZY_FLOW_BASE = "https://flow.rupeezy.in";

export function getRupeezyAuthUrl(config: AppConfig["rupeezy"]): string {
  const params = new URLSearchParams({
    applicationId: config.applicationId,
  });
  return `${RUPEEZY_FLOW_BASE}?${params.toString()}`;
}

export async function exchangeRupeezyToken(
  authCode: string,
  config: AppConfig["rupeezy"]
): Promise<string> {
  const client = new VortexAPI(config.apiSecret, config.applicationId);
  const res = await client.exchange_token(authCode);

  if (!res?.data?.access_token) {
    logger.error("Rupeezy token exchange failed:", res);
    throw new Error("Rupeezy auth failed: no access_token in response");
  }

  logger.info("Rupeezy token obtained successfully");
  return res.data.access_token;
}

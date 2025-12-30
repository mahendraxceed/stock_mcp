import type { AppConfig } from "../../config.js";
import { logger } from "../../utils/logger.js";

const UPSTOX_AUTH_BASE = "https://api.upstox.com/v2/login/authorization";

export function getUpstoxAuthUrl(config: AppConfig["upstox"]): string {
  const params = new URLSearchParams({
    client_id: config.apiKey,
    redirect_uri: config.redirectUri,
    response_type: "code",
  });
  return `${UPSTOX_AUTH_BASE}/dialog?${params.toString()}`;
}

export async function exchangeUpstoxToken(
  code: string,
  config: AppConfig["upstox"]
): Promise<string> {
  const body = new URLSearchParams({
    code,
    client_id: config.apiKey,
    client_secret: config.apiSecret,
    redirect_uri: config.redirectUri,
    grant_type: "authorization_code",
  });

  const res = await fetch(`${UPSTOX_AUTH_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const data = await res.json() as any;

  if (!res.ok || data.status === "error") {
    const msg = data?.errors?.[0]?.message ?? data?.message ?? "Token exchange failed";
    logger.error("Upstox token exchange failed:", msg);
    throw new Error(`Upstox auth failed: ${msg}`);
  }

  const accessToken = data.data?.access_token ?? data.access_token;
  if (!accessToken) throw new Error("No access_token in Upstox response");

  logger.info("Upstox token obtained successfully");
  return accessToken;
}

import "dotenv/config";

export interface AppConfig {
  port: number;
  upstox: {
    apiKey: string;
    apiSecret: string;
    redirectUri: string;
    accessToken: string;
  };
  rupeezy: {
    applicationId: string;
    apiSecret: string;
    redirectUri: string;
    accessToken: string;
  };
  logLevel: "debug" | "info" | "warn" | "error";
  cacheTtlSeconds: number;
}

export function loadConfig(): AppConfig {
  const optional = (key: string, fallback = ""): string =>
    process.env[key] ?? fallback;

  const port = parseInt(optional("PORT", "3001"), 10);

  return {
    port,
    upstox: {
      apiKey: optional("UPSTOX_API_KEY"),
      apiSecret: optional("UPSTOX_API_SECRET"),
      redirectUri: optional(
        "UPSTOX_REDIRECT_URI",
        `http://localhost:${port}/auth/upstox/callback`
      ),
      accessToken: optional("UPSTOX_ACCESS_TOKEN"),
    },
    rupeezy: {
      applicationId: optional("RUPEEZY_APPLICATION_ID"),
      apiSecret: optional("RUPEEZY_API_SECRET"),
      redirectUri: optional(
        "RUPEEZY_REDIRECT_URI",
        `http://localhost:${port}/auth/rupeezy/callback`
      ),
      accessToken: optional("RUPEEZY_ACCESS_TOKEN"),
    },
    logLevel: (process.env.LOG_LEVEL as AppConfig["logLevel"]) ?? "info",
    cacheTtlSeconds: parseInt(optional("CACHE_TTL_SECONDS", "30"), 10),
  };
}

import "dotenv/config";

export interface AppConfig {
  upstox: {
    apiKey: string;
    apiSecret: string;
    redirectUri: string;
    accessToken: string;
  };
  rupeezy: {
    applicationId: string;
    apiSecret: string;
    accessToken: string;
  };
  logLevel: "debug" | "info" | "warn" | "error";
  cacheTtlSeconds: number;
}

export function loadConfig(): AppConfig {
  const optional = (key: string, fallback = ""): string =>
    process.env[key] ?? fallback;

  return {
    upstox: {
      apiKey: optional("UPSTOX_API_KEY"),
      apiSecret: optional("UPSTOX_API_SECRET"),
      redirectUri: optional("UPSTOX_REDIRECT_URI", "http://localhost:3000/callback"),
      accessToken: optional("UPSTOX_ACCESS_TOKEN"),
    },
    rupeezy: {
      applicationId: optional("RUPEEZY_APPLICATION_ID"),
      apiSecret: optional("RUPEEZY_API_SECRET"),
      accessToken: optional("RUPEEZY_ACCESS_TOKEN"),
    },
    logLevel: (process.env.LOG_LEVEL as AppConfig["logLevel"]) ?? "info",
    cacheTtlSeconds: parseInt(process.env.CACHE_TTL_SECONDS ?? "30", 10),
  };
}

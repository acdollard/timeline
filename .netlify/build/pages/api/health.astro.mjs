import { s as supabase } from '../../chunks/supabase_riZVRtFr.mjs';
import { l as logger } from '../../chunks/logger_BUOLHH5s.mjs';
export { renderers } from '../../renderers.mjs';

const __vite_import_meta_env__ = {"ASSETS_PREFIX": undefined, "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "SITE": undefined, "SSR": true, "VITE_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzeWpheHh2dXZlYmZncm13cWtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MTg5NTYsImV4cCI6MjA2NDI5NDk1Nn0.NiAWk-fkKmOwAyALOvpOsPdnHOcXhiDNc9yJlBfQ-n0", "VITE_SUPABASE_URL": "https://vsyjaxxvuvebfgrmwqkn.supabase.co"};
const GET = async () => {
  const healthCheck = {
    status: "healthy",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    version: "1.0.0",
    // Update this with your app version
    checks: {
      database: "unknown",
      environment: "unknown"
    }
  };
  try {
    const { data, error } = await supabase.from("events").select("count").limit(1);
    if (error) {
      healthCheck.checks.database = "unhealthy";
      healthCheck.status = "degraded";
      logger.error("Database health check failed", { error: error.message });
    } else {
      healthCheck.checks.database = "healthy";
    }
    const requiredEnvVars = [
      "VITE_SUPABASE_URL",
      "VITE_SUPABASE_ANON_KEY"
    ];
    const missingEnvVars = requiredEnvVars.filter((varName) => !Object.assign(__vite_import_meta_env__, { _: process.env._ })[varName]);
    if (missingEnvVars.length > 0) {
      healthCheck.checks.environment = "unhealthy";
      healthCheck.status = "unhealthy";
      logger.error("Missing environment variables", { missing: missingEnvVars });
    } else {
      healthCheck.checks.environment = "healthy";
    }
    if (healthCheck.checks.database === "unhealthy" || healthCheck.checks.environment === "unhealthy") {
      healthCheck.status = "unhealthy";
    } else if (healthCheck.checks.database === "unknown" || healthCheck.checks.environment === "unknown") {
      healthCheck.status = "degraded";
    }
    const statusCode = healthCheck.status === "healthy" ? 200 : healthCheck.status === "degraded" ? 200 : 503;
    return new Response(JSON.stringify(healthCheck), {
      status: statusCode,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache"
      }
    });
  } catch (error) {
    logger.error("Health check failed", { error: error instanceof Error ? error.message : "Unknown error" });
    healthCheck.status = "unhealthy";
    healthCheck.checks.database = "unhealthy";
    return new Response(JSON.stringify(healthCheck), {
      status: 503,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache"
      }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

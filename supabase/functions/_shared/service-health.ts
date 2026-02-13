import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

/**
 * Log a service health event to admin_service_health table.
 * Fire-and-forget — never throws.
 */
export async function logServiceHealth(
  serviceName: string,
  endpoint: string,
  statusCode: number | null,
  latencyMs: number,
  errorMessage?: string
): Promise<void> {
  try {
    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return;

    const supabase = createClient(url, key);
    await supabase.from("admin_service_health").insert({
      service_name: serviceName,
      endpoint,
      status_code: statusCode,
      latency_ms: latencyMs,
      error_message: errorMessage || null,
    });
  } catch {
    // Silent — monitoring should never break the app
  }
}

/**
 * Wrap a fetch call with automatic service health logging.
 */
export async function fetchWithHealthLog(
  serviceName: string,
  url: string,
  init?: RequestInit
): Promise<Response> {
  const start = Date.now();
  try {
    const response = await fetch(url, init);
    const latency = Date.now() - start;
    // Fire-and-forget
    logServiceHealth(
      serviceName,
      new URL(url).pathname,
      response.status,
      latency,
      response.ok ? undefined : `HTTP ${response.status}`
    );
    return response;
  } catch (err) {
    const latency = Date.now() - start;
    logServiceHealth(
      serviceName,
      new URL(url).pathname,
      null,
      latency,
      err instanceof Error ? err.message : "Network error"
    );
    throw err;
  }
}

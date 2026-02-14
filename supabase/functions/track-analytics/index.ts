import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface AnalyticsEvent {
  event_type: string;
  event_target: string;
  event_metadata?: Record<string, unknown>;
  session_id: string;
  device_type: string;
}

async function resolveGeo(ip: string): Promise<{ country: string | null; city: string | null }> {
  if (!ip || ip === '127.0.0.1' || ip === '::1') {
    return { country: null, city: null };
  }
  try {
    const resp = await fetch(`http://ip-api.com/json/${ip}?fields=country,city`, {
      signal: AbortSignal.timeout(3000),
    });
    if (resp.ok) {
      const data = await resp.json();
      return { country: data.country || null, city: data.city || null };
    }
  } catch {
    // Geo lookup failure is non-critical
  }
  return { country: null, city: null };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { events } = await req.json() as { events: AnalyticsEvent[] };

    if (!Array.isArray(events) || events.length === 0) {
      return new Response(JSON.stringify({ ok: true, inserted: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract IP from headers
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : '';

    // Resolve geo once per batch (same IP for all events in a batch)
    const geo = await resolveGeo(ip);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Enrich events with geo data
    const enriched = events.slice(0, 100).map((e) => ({
      event_type: e.event_type,
      event_target: (e.event_target || '').slice(0, 500),
      event_metadata: e.event_metadata || {},
      session_id: e.session_id,
      device_type: e.device_type || 'desktop',
      country: geo.country,
      city: geo.city,
    }));

    const { error } = await supabase.from('admin_analytics').insert(enriched);

    if (error) {
      console.error('Insert error:', error.message);
      return new Response(JSON.stringify({ ok: false, error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true, inserted: enriched.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Track analytics error:', err);
    return new Response(JSON.stringify({ ok: false, error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ── Location → country-code mapping ──────────────────────────────────
const VALID_CODES = new Set([
  "us","uk","sg","de","ch","ae","hk","jp","kr","in","br","ng","ca","au","fr","nl","pt","es","it","pl","other",
]);

// Direct value normalization (existing DB values that aren't codes)
const VALUE_NORMALIZE: Record<string, string> = {
  usa: "us",
  "united states": "us",
  "united kingdom": "uk",
  england: "uk",
  india: "in",
  germany: "de",
  france: "fr",
  poland: "pl",
  portugal: "pt",
  "south korea": "kr",
  korea: "kr",
  "hong kong": "hk",
  brazil: "br",
  canada: "ca",
  australia: "au",
  singapore: "sg",
  switzerland: "ch",
  netherlands: "nl",
  spain: "es",
  italy: "it",
  nigeria: "ng",
  japan: "jp",
  "united arab emirates": "ae",
  uae: "ae",
  ireland: "other",
  israel: "other",
  indonesia: "other",
  vietnam: "other",
  china: "other",
  russia: "other",
  turkey: "other",
  mexico: "other",
  argentina: "other",
  colombia: "other",
  kenya: "other",
  "south africa": "other",
  thailand: "other",
  philippines: "other",
  taiwan: "other",
  ukraine: "other",
  romania: "other",
  czech: "other",
  "czech republic": "other",
  czechia: "other",
  austria: "other",
  sweden: "other",
  norway: "other",
  denmark: "other",
  finland: "other",
  belgium: "other",
  greece: "other",
  hungary: "other",
  croatia: "other",
  serbia: "other",
  bulgaria: "other",
  estonia: "other",
  latvia: "other",
  lithuania: "other",
  slovakia: "other",
  slovenia: "other",
  malta: "other",
  cyprus: "other",
  luxembourg: "other",
  iceland: "other",
  "cayman islands": "other",
  cayman: "other",
  bermuda: "other",
  bahamas: "other",
  "british virgin islands": "other",
  panama: "other",
  "costa rica": "other",
  alaska: "us",
  pakistan: "other",
  bangladesh: "other",
  "sri lanka": "other",
  nepal: "other",
  myanmar: "other",
  cambodia: "other",
  malaysia: "other",
  peru: "other",
  chile: "other",
  venezuela: "other",
  ecuador: "other",
  uruguay: "other",
  paraguay: "other",
  bolivia: "other",
  egypt: "other",
  morocco: "other",
  tunisia: "other",
  ghana: "other",
  ethiopia: "other",
  tanzania: "other",
  uganda: "other",
  rwanda: "other",
};

// City / region keywords → code
const CITY_MAP: Record<string, string> = {
  // US cities & states
  "new york": "us", "san francisco": "us", "los angeles": "us", seattle: "us",
  chicago: "us", boston: "us", austin: "us", denver: "us", miami: "us",
  portland: "us", "washington dc": "us", "washington, dc": "us", atlanta: "us",
  dallas: "us", houston: "us", philadelphia: "us", phoenix: "us",
  "san diego": "us", "san jose": "us", detroit: "us", minneapolis: "us",
  nashville: "us", charlotte: "us", "salt lake": "us", pittsburgh: "us",
  raleigh: "us", columbus: "us", indianapolis: "us", "las vegas": "us",
  california: "us", texas: "us", florida: "us", colorado: "us",
  massachusetts: "us", virginia: "us", georgia: "us", illinois: "us",
  "new jersey": "us", pennsylvania: "us", ohio: "us", michigan: "us",
  carolina: "us", maryland: "us", connecticut: "us", oregon: "us",
  tennessee: "us", arizona: "us", minnesota: "us", wisconsin: "us",
  indiana: "us", missouri: "us", iowa: "us", utah: "us",
  // US state abbreviations (2-letter at end of string handled separately)
  // UK
  london: "uk", manchester: "uk", birmingham: "uk", edinburgh: "uk",
  bristol: "uk", cambridge: "uk", oxford: "uk", glasgow: "uk", cardiff: "uk",
  leeds: "uk", liverpool: "uk", belfast: "uk", nottingham: "uk",
  // Germany
  berlin: "de", munich: "de", hamburg: "de", frankfurt: "de", cologne: "de",
  düsseldorf: "de", stuttgart: "de", leipzig: "de", dresden: "de",
  // France
  paris: "fr", lyon: "fr", marseille: "fr", toulouse: "fr",
  // Singapore
  singapore: "sg",
  // Switzerland
  zurich: "ch", zürich: "ch", geneva: "ch", basel: "ch", bern: "ch", zug: "ch",
  // UAE
  dubai: "ae", "abu dhabi": "ae",
  // Hong Kong
  "hong kong": "hk",
  // Japan
  tokyo: "jp", osaka: "jp", kyoto: "jp",
  // South Korea
  seoul: "kr", busan: "kr",
  // India
  bangalore: "in", bengaluru: "in", mumbai: "in", delhi: "in",
  hyderabad: "in", chennai: "in", pune: "in", kolkata: "in", gurgaon: "in",
  noida: "in", gurugram: "in", ahmedabad: "in",
  // Brazil
  "são paulo": "br", "sao paulo": "br", "rio de janeiro": "br",
  // Nigeria
  lagos: "ng", abuja: "ng",
  // Canada
  toronto: "ca", vancouver: "ca", montreal: "ca", ottawa: "ca", calgary: "ca",
  // Australia
  sydney: "au", melbourne: "au", brisbane: "au", perth: "au",
  // Netherlands
  amsterdam: "nl", rotterdam: "nl",
  // Portugal
  lisbon: "pt", porto: "pt",
  // Spain
  madrid: "es", barcelona: "es",
  // Italy
  rome: "it", milan: "it",
  // Poland
  warsaw: "pl", krakow: "pl", kraków: "pl", wroclaw: "pl",
};

// US state abbreviations
const US_STATES = new Set([
  "al","ak","az","ar","ca","co","ct","de","fl","ga","hi","id","il","in","ia",
  "ks","ky","la","me","md","ma","mi","mn","ms","mo","mt","ne","nv","nh","nj",
  "nm","ny","nc","nd","oh","ok","or","pa","ri","sc","sd","tn","tx","ut","vt",
  "va","wa","wv","wi","wy","dc",
]);

function mapLocationToCode(location: string): string | null {
  const lower = location.toLowerCase().trim();
  if (!lower) return null;

  // 1. Check if it's already a valid code
  if (VALID_CODES.has(lower)) return lower;

  // 2. Direct normalization (full country names)
  if (VALUE_NORMALIZE[lower]) return VALUE_NORMALIZE[lower];

  // 3. Check country names/keywords anywhere in string
  for (const [keyword, code] of Object.entries(VALUE_NORMALIZE)) {
    if (keyword.length >= 4 && lower.includes(keyword)) return code;
  }

  // 4. Check city names anywhere in string
  for (const [city, code] of Object.entries(CITY_MAP)) {
    if (lower.includes(city)) return code;
  }

  // 5. Check for US state abbreviations (e.g. "CA", "NY" at end)
  const parts = lower.split(/[,\s]+/).filter(Boolean);
  const last = parts[parts.length - 1];
  if (last && US_STATES.has(last)) return "us";

  // 6. Check for "USA", "US", "UK" tokens
  if (parts.includes("us") || parts.includes("usa") || parts.includes("u.s.") || parts.includes("u.s.a.")) return "us";
  if (parts.includes("uk") || parts.includes("u.k.")) return "uk";

  return null;
}

// ── Extract GitHub handle from URL ───────────────────────────────────
function extractGithubHandle(url: string): string | null {
  const match = url.match(/github\.com\/([^\/]+)/);
  return match ? match[1] : null;
}

// ── Main handler ─────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const githubToken = Deno.env.get("GITHUB_TOKEN");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse optional batch params
    let batchOffset = 0;
    let batchLimit = 50;
    try {
      const body = await req.json();
      if (body.offset) batchOffset = Number(body.offset);
      if (body.limit) batchLimit = Number(body.limit);
    } catch { /* no body is fine */ }

    // Fetch profiles that need enrichment (no country, have github_org_url)
    const { data: profiles, error: fetchErr } = await supabase
      .from("claimed_profiles")
      .select("id, project_name, country, github_org_url")
      .is("country", null)
      .not("github_org_url", "is", null)
      .order("project_name")
      .range(batchOffset, batchOffset + batchLimit - 1);

    if (fetchErr) throw fetchErr;

    const results = {
      total: profiles.length,
      batch: { offset: batchOffset, limit: batchLimit },
      normalized: 0,
      enriched: 0,
      skipped_no_github: 0,
      skipped_no_location: 0,
      skipped_unmappable: 0,
      already_correct: 0,
      errors: 0,
      details: [] as { name: string; action: string; from: string | null; to: string | null; location?: string }[],
    };

    for (const p of profiles) {
      const currentCountry = p.country?.trim() || null;

      // All profiles in this batch have null country and non-null github_org_url
      // so go straight to GitHub enrichment

      const handle = extractGithubHandle(p.github_org_url);
      if (!handle) {
        results.skipped_no_github++;
        continue;
      }

      // Try org first, fall back to user
      let location: string | null = null;
      for (const endpoint of [`https://api.github.com/orgs/${handle}`, `https://api.github.com/users/${handle}`]) {
        try {
          const headers: Record<string, string> = { "Accept": "application/vnd.github.v3+json", "User-Agent": "rezilience-enricher" };
          if (githubToken) headers["Authorization"] = `Bearer ${githubToken}`;

          const res = await fetch(endpoint, { headers });
          if (res.ok) {
            const data = await res.json();
            if (data.location) {
              location = data.location;
              break;
            }
          }
        } catch {
          // Try next endpoint
        }
      }

      if (!location) {
        results.skipped_no_location++;
        continue;
      }

      const code = mapLocationToCode(location);
      if (!code) {
        results.skipped_unmappable++;
        results.details.push({ name: p.project_name, action: "unmappable", from: null, to: null, location });
        continue;
      }

      const { error: upErr } = await supabase
        .from("claimed_profiles")
        .update({ country: code })
        .eq("id", p.id);

      if (!upErr) {
        results.enriched++;
        results.details.push({ name: p.project_name, action: "enriched", from: null, to: code, location });
      } else {
        results.errors++;
      }

      // Small delay to respect GitHub rate limits
      await new Promise((r) => setTimeout(r, 50));
    }

    return new Response(JSON.stringify({ ok: true, ...results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

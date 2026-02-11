import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OSVVulnerability {
  id: string;
  summary?: string;
  details?: string;
  severity?: { type: string; score: string }[];
  affected?: { package?: { name: string; ecosystem: string }; ranges?: any[] }[];
  published?: string;
}

/**
 * Query OSV.dev for known vulnerabilities in a project's dependencies.
 * Reads dependencies from the dependency_graph table, queries OSV for each,
 * and updates the claimed_profile with vulnerability counts.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profile_id } = await req.json();

    if (!profile_id) {
      return new Response(
        JSON.stringify({ error: "profile_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch dependencies for this profile
    const { data: deps, error: depsError } = await supabase
      .from("dependency_graph")
      .select("crate_name, current_version, dependency_type, package_name")
      .eq("source_profile_id", profile_id);

    if (depsError) {
      throw new Error(`Failed to fetch dependencies: ${depsError.message}`);
    }

    if (!deps || deps.length === 0) {
      // No dependencies to check
      await supabase
        .from("claimed_profiles")
        .update({
          vulnerability_count: 0,
          vulnerability_details: [],
          vulnerability_analyzed_at: new Date().toISOString(),
        })
        .eq("id", profile_id);

      return new Response(
        JSON.stringify({ vulnerability_count: 0, details: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const allVulnerabilities: any[] = [];

    // Query OSV.dev for each dependency (batch where possible)
    for (const dep of deps) {
      const packageName = dep.package_name || dep.crate_name;
      const version = dep.current_version;
      if (!packageName || !version) continue;

      // Determine ecosystem based on dependency_type
      let ecosystem = "crates.io";
      if (dep.dependency_type === "npm") ecosystem = "npm";
      else if (dep.dependency_type === "pypi") ecosystem = "PyPI";

      try {
        const osvResponse = await fetch("https://api.osv.dev/v1/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            package: { name: packageName, ecosystem },
            version,
          }),
        });

        if (osvResponse.ok) {
          const data = await osvResponse.json();
          if (data.vulns && data.vulns.length > 0) {
            for (const vuln of data.vulns as OSVVulnerability[]) {
              allVulnerabilities.push({
                id: vuln.id,
                summary: vuln.summary || "No summary",
                package: packageName,
                version,
                ecosystem,
                severity: vuln.severity?.[0]?.score || "unknown",
                published: vuln.published,
              });
            }
          }
        }
      } catch (osvErr) {
        console.error(`OSV query failed for ${packageName}@${version}:`, osvErr);
      }

      // Rate limit: 100ms between requests
      await new Promise((r) => setTimeout(r, 100));
    }

    // Deduplicate by vulnerability ID
    const uniqueVulns = Array.from(
      new Map(allVulnerabilities.map((v) => [v.id, v])).values()
    );

    // Update the profile
    const { error: updateError } = await supabase
      .from("claimed_profiles")
      .update({
        vulnerability_count: uniqueVulns.length,
        vulnerability_details: uniqueVulns.slice(0, 50), // Cap stored details
        vulnerability_analyzed_at: new Date().toISOString(),
      })
      .eq("id", profile_id);

    if (updateError) {
      console.error("Failed to update vulnerability data:", updateError);
    }

    console.log(`✓ Vulnerability scan for profile ${profile_id}: ${uniqueVulns.length} CVEs found across ${deps.length} dependencies`);

    return new Response(
      JSON.stringify({
        vulnerability_count: uniqueVulns.length,
        details: uniqueVulns,
        dependencies_checked: deps.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Vulnerability analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

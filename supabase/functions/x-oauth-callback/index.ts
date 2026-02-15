/**
 * X (Twitter) OAuth 2.0 PKCE Callback Handler
 */
import { logServiceHealth } from "../_shared/service-health.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface XTokenResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
  scope: string;
  refresh_token?: string;
}

interface XUserResponse {
  data: {
    id: string;
    name: string;
    username: string;
    profile_image_url?: string;
  };
}

interface RequestBody {
  code: string;
  code_verifier: string;
  redirect_uri: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, code_verifier, redirect_uri } = await req.json() as RequestBody;

    if (!code || !code_verifier || !redirect_uri) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required parameters: code, code_verifier, redirect_uri' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const clientId = Deno.env.get('X_CLIENT_ID');
    const clientSecret = Deno.env.get('X_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      console.error('Missing X OAuth credentials');
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Exchange authorization code for access token
    console.log('Exchanging code for access token...');
    
    const tokenParams = new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: clientId,
      redirect_uri,
      code_verifier,
    });

    // X requires Basic auth with client_id:client_secret for confidential clients
    const credentials = btoa(`${clientId}:${clientSecret}`);

    const tokenStart = Date.now();
    const tokenResponse = await fetch('https://api.x.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: tokenParams.toString(),
    });
    logServiceHealth("X (Twitter) API", "/2/oauth2/token", tokenResponse.status, Date.now() - tokenStart, tokenResponse.ok ? undefined : `HTTP ${tokenResponse.status}`);

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', tokenResponse.status, errorText);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to exchange authorization code: ${tokenResponse.status}` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tokenData = await tokenResponse.json() as XTokenResponse;
    console.log('Token exchange successful');

    // Step 2: Fetch user profile
    console.log('Fetching user profile...');
    
    const userStart = Date.now();
    const userResponse = await fetch(
      'https://api.x.com/2/users/me?user.fields=profile_image_url',
      {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      }
    );
    logServiceHealth("X (Twitter) API", "/2/users/me", userResponse.status, Date.now() - userStart, userResponse.ok ? undefined : `HTTP ${userResponse.status}`);

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('User fetch failed:', userResponse.status, errorText);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to fetch user profile: ${userResponse.status}` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userData = await userResponse.json() as XUserResponse;
    console.log('User profile fetched:', userData.data.username);

    // Return user data to frontend
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: userData.data.id,
          username: userData.data.username,
          name: userData.data.name,
          avatarUrl: userData.data.profile_image_url || 
            'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png',
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('X OAuth callback error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

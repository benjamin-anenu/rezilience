/**
 * PKCE (Proof Key for Code Exchange) utilities for OAuth 2.0
 * Used for secure authorization code flow in single-page applications
 */

/**
 * Generates a cryptographically random code verifier
 * Must be between 43-128 characters (we use 64)
 */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

/**
 * Generates a code challenge from a code verifier using SHA-256
 * This is sent to the authorization server, while the verifier is kept secret
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(digest));
}

/**
 * Base64 URL encoding (RFC 4648) - safe for URLs without escaping
 */
function base64UrlEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Generates a random state parameter for CSRF protection
 */
export function generateState(): string {
  return crypto.randomUUID();
}

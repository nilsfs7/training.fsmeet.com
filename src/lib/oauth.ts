const encoder = new TextEncoder();

export function fsmeetApiUrl(): string {
  const configured = process.env.FSMEET_API_URL || "https://api.dev.fsmeet.dffb.org/v1";
  return configured.replace(/\/$/, "");
}

export function clientId(): string {
  return process.env.FSMEET_OAUTH_CLIENT_ID || "training";
}

export function publicOrigin(request: Request): { origin: string; secure: boolean } {
  const url = new URL(request.url);
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const proto = forwardedProto || url.protocol.replace(":", "");
  const host = forwardedHost || request.headers.get("host") || url.host;
  return { origin: `${proto}://${host}`, secure: proto === "https" };
}

/** Registered browser origin. OAuth redirect URIs are matched exactly, so this must not follow a 127.0.0.1 host. */
export function configuredOrigin(): string | null {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured) return null;
  return new URL(configured).origin;
}

export function oauthOrigin(request: Request): { origin: string; secure: boolean } {
  const configured = configuredOrigin();
  if (configured) return { origin: configured, secure: configured.startsWith("https://") };
  return publicOrigin(request);
}

export function redirectUri(origin: string): string {
  return `${origin}/api/auth/fsmeet/callback`;
}

function base64url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export function randomToken(size = 32): string {
  return base64url(crypto.getRandomValues(new Uint8Array(size)));
}

export async function codeChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(verifier));
  return base64url(new Uint8Array(digest));
}

export function authorizeUrl(input: { redirectUri: string; state: string; challenge: string }): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId(),
    redirect_uri: input.redirectUri,
    scope: "openid profile email",
    state: input.state,
    code_challenge: input.challenge,
    code_challenge_method: "S256",
  });
  return `${fsmeetApiUrl()}/oauth/authorize?${params.toString()}`;
}

export async function exchangeCode(input: { code: string; redirectUri: string; verifier: string }): Promise<string> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: input.code,
    redirect_uri: input.redirectUri,
    client_id: clientId(),
    code_verifier: input.verifier,
  });
  const clientSecret = process.env.FSMEET_OAUTH_CLIENT_SECRET;
  if (clientSecret) body.set("client_secret", clientSecret);

  const response = await fetch(`${fsmeetApiUrl()}/oauth/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  const payload = (await response.json().catch(() => null)) as { access_token?: string; error?: string; error_description?: string } | null;
  if (!response.ok || !payload?.access_token) {
    const detail = payload?.error_description || payload?.error || `token status ${response.status}`;
    throw new Error(detail);
  }
  return payload.access_token;
}

export type FsmeetProfile = {
  sub: string;
  name: string;
  email: string | null;
};

export async function readProfile(accessToken: string): Promise<FsmeetProfile> {
  const response = await fetch(`${fsmeetApiUrl()}/oauth/userinfo`, {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  const payload = (await response.json().catch(() => null)) as {
    sub?: string;
    name?: string;
    preferred_username?: string;
    email?: string;
  } | null;
  if (!response.ok || !payload?.sub) {
    throw new Error("userinfo failed");
  }
  const name = payload.name || payload.preferred_username || payload.email || "Athlete";
  return { sub: payload.sub, name, email: payload.email ?? null };
}

export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie") ?? "";
  const pair = header.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  if (!pair) return null;
  return decodeURIComponent(pair.slice(name.length + 1));
}

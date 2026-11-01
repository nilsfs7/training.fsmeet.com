import { NextResponse } from "next/server";
import { authorizeUrl, codeChallenge, configuredOrigin, oauthOrigin, publicOrigin, randomToken, redirectUri } from "@/lib/oauth";

export async function GET(request: Request) {
  const configured = configuredOrigin();
  const current = publicOrigin(request);
  if (configured && current.origin !== configured) {
    return NextResponse.redirect(`${configured}/api/auth/fsmeet`);
  }
  const { origin, secure } = oauthOrigin(request);
  const state = randomToken();
  const verifier = randomToken();
  const challenge = await codeChallenge(verifier);
  const response = NextResponse.redirect(authorizeUrl({ redirectUri: redirectUri(origin), state, challenge }));
  response.cookies.set("oauth_state", state, { httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: 600 });
  response.cookies.set("pkce_verifier", verifier, { httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: 600 });
  return response;
}

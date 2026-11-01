import { NextResponse } from "next/server";
import { exchangeCode, oauthOrigin, readCookie, readProfile, redirectUri } from "@/lib/oauth";
import { COOKIE, sealSession } from "@/lib/session";
import { upsertUser } from "@/lib/sessions";

function finish(origin: string, secure: boolean, location: string) {
  const response = NextResponse.redirect(location);
  response.cookies.set("oauth_state", "", { httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: 0 });
  response.cookies.set("pkce_verifier", "", { httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: 0 });
  return response;
}

export async function GET(request: Request) {
  const { origin, secure } = oauthOrigin(request);
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = readCookie(request, "oauth_state");
  const verifier = readCookie(request, "pkce_verifier");

  if (!code || !state || !verifier || state !== expectedState) {
    return finish(origin, secure, `${origin}/login?error=state`);
  }

  try {
    const accessToken = await exchangeCode({ code, redirectUri: redirectUri(origin), verifier });
    const profile = await readProfile(accessToken);
    const uid = await upsertUser({ sub: profile.sub, name: profile.name, email: profile.email });
    const response = finish(origin, secure, `${origin}/`);
    response.cookies.set(COOKIE, await sealSession({ uid, fsmeetSub: profile.sub, name: profile.name }), {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch (error) {
    console.error("FSMeet sign-in failed", error);
    return finish(origin, secure, `${origin}/login?error=signin`);
  }
}

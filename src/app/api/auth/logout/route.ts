import { NextResponse } from "next/server";
import { oauthOrigin } from "@/lib/oauth";
import { COOKIE } from "@/lib/session";

export async function POST(request: Request) {
  const { origin, secure } = oauthOrigin(request);
  const response = NextResponse.redirect(`${origin}/login`, 303);
  response.cookies.set(COOKIE, "", { httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: 0 });
  return response;
}

import { NextResponse } from "next/server";
import { readRequestSession } from "@/lib/session";
import { deleteSessions, listSessions, parseSession, saveSessions, SessionInputError } from "@/lib/sessions";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await readRequestSession(request);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    return NextResponse.json({ sessions: await listSessions(session.uid) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "database unavailable" }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  const session = await readRequestSession(request);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { ids?: unknown } | null;
  if (!body || !Array.isArray(body.ids) || body.ids.some((id) => typeof id !== "string")) {
    return NextResponse.json({ error: "Expected sessions" }, { status: 400 });
  }
  try {
    await deleteSessions(session.uid, body.ids);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof SessionInputError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error(error);
    return NextResponse.json({ error: "database unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const session = await readRequestSession(request);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { sessions?: unknown } | null;
  if (!body || !Array.isArray(body.sessions)) {
    return NextResponse.json({ error: "Expected sessions" }, { status: 400 });
  }
  try {
    await saveSessions(session.uid, body.sessions.map(parseSession));
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof SessionInputError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error(error);
    return NextResponse.json({ error: "database unavailable" }, { status: 503 });
  }
}

import { NextResponse } from "next/server";
import { readAccountSettings, writeDurationUnit, writeFeelingInput } from "@/lib/account";
import { readRequestSession } from "@/lib/session";
import { isDurationUnit, isFeelingInput } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await readRequestSession(request);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    return NextResponse.json(await readAccountSettings(session.uid));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "database unavailable" }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  const session = await readRequestSession(request);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { feelingInput?: unknown; durationUnit?: unknown } | null;
  const hasFeeling = body != null && Object.prototype.hasOwnProperty.call(body, "feelingInput");
  const hasDuration = body != null && Object.prototype.hasOwnProperty.call(body, "durationUnit");
  if (!body || (!hasFeeling && !hasDuration)) {
    return NextResponse.json({ error: "Setting is invalid" }, { status: 400 });
  }
  if (hasFeeling && !isFeelingInput(body.feelingInput)) {
    return NextResponse.json({ error: "Feeling entry is invalid" }, { status: 400 });
  }
  if (hasDuration && !isDurationUnit(body.durationUnit)) {
    return NextResponse.json({ error: "Duration unit is invalid" }, { status: 400 });
  }
  try {
    if (hasFeeling && isFeelingInput(body.feelingInput)) {
      const saved = await writeFeelingInput(session.uid, body.feelingInput);
      if (!saved) return NextResponse.json({ error: "account missing" }, { status: 404 });
    }
    if (hasDuration && isDurationUnit(body.durationUnit)) {
      const saved = await writeDurationUnit(session.uid, body.durationUnit);
      if (!saved) return NextResponse.json({ error: "account missing" }, { status: 404 });
    }
    return NextResponse.json(await readAccountSettings(session.uid));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "database unavailable" }, { status: 503 });
  }
}

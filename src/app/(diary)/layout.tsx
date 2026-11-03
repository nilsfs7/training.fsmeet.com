import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { FeelingInputProvider } from "@/components/feeling-input";
import { Shell } from "@/components/shell";
import { readAccountSettings } from "@/lib/account";
import { COOKIE, openSession } from "@/lib/session";
import type { DurationUnit, FeelingInput } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DiaryLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  const session = await openSession(jar.get(COOKIE)?.value);
  if (!session) redirect("/login");
  let feelingInput: FeelingInput = "emoji";
  let durationUnit: DurationUnit = "hours";
  let confirmed = false;
  try {
    const settings = await readAccountSettings(session.uid);
    feelingInput = settings.feelingInput;
    durationUnit = settings.durationUnit;
    confirmed = true;
  } catch (error) {
    console.error(error);
  }
  return (
    <Shell name={session.name}>
      <FeelingInputProvider initial={feelingInput} durationUnit={durationUnit} confirmed={confirmed}>
        {children}
      </FeelingInputProvider>
    </Shell>
  );
}

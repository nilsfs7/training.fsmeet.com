import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Shell } from "@/components/shell";
import { COOKIE, openSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function DiaryLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  const session = await openSession(jar.get(COOKIE)?.value);
  if (!session) redirect("/login");
  return <Shell name={session.name}>{children}</Shell>;
}

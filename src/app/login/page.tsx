import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE, openSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  state: "The sign-in attempt expired. Try again.",
  signin: "FSMeet did not finish sign-in. Try again.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const jar = await cookies();
  const session = await openSession(jar.get(COOKIE)?.value);
  if (session) redirect("/");
  const { error } = await searchParams;
  const message = error ? ERRORS[error] ?? "Sign-in failed. Try again." : null;

  return (
    <main className="login app-frame">
      <p className="eyebrow">FSMeet</p>
      <h1>Training diary</h1>
      <p className="lede">Log a session after training. Your FSMeet profile is the only way in.</p>
      {message ? <p className="error">{message}</p> : null}
      <a className="button" href="/api/auth/fsmeet">
        Continue with FSMeet
      </a>
    </main>
  );
}

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CategorySetting } from "@/components/category-setting";
import { ResetTraining } from "@/components/reset-training";
import { DurationSetting } from "@/components/duration-setting";
import { FeelingSetting } from "@/components/feeling-setting";
import { COOKIE, openSession } from "@/lib/session";

export default async function ProfilePage() {
  const jar = await cookies();
  const session = await openSession(jar.get(COOKIE)?.value);
  if (!session) redirect("/login");

  return (
    <>
      <h1>Profile</h1>
      <section className="card account-card">
        <p className="eyebrow">Account</p>
        <p className="account-name">{session.name}</p>
        <p className="meta">Signed in with FSMeet</p>
      </section>
      <FeelingSetting />
      <DurationSetting />
      <CategorySetting />
      <ResetTraining />
      <form action="/api/auth/logout" method="post">
        <button className="button quiet" type="submit">
          Sign out
        </button>
      </form>
    </>
  );
}

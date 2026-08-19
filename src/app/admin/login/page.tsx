import { LoginForm } from "./login-form";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "/admin";

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4 py-16">
      <div>
        <h1 className="text-xl font-semibold">Admin login</h1>
        <p className="text-sm text-muted-foreground">Enter the admin password to continue.</p>
      </div>
      <LoginForm next={next} />
    </div>
  );
}

import { LoginForm } from "@/components/admin/login-form";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type AdminLoginPageProps = {
  searchParams: Promise<{
    redirectedFrom?: string;
  }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = await searchParams;

  return (
    <main className="shell login-shell">
      <div className="container">
        <LoginForm isSupabaseEnabled={isSupabaseConfigured()} redirectedFrom={params.redirectedFrom} />
      </div>
    </main>
  );
}

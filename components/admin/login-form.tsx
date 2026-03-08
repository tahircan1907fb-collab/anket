"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type LoginFormProps = {
  isSupabaseEnabled: boolean;
  redirectedFrom?: string;
};

export function LoginForm({ isSupabaseEnabled, redirectedFrom }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!isSupabaseEnabled) {
      setError("Supabase ortami ayarlanmadan gercek admin girisi acilmaz. Demo modunda /admin sayfasini kullanabilirsiniz.");
      return;
    }

    startTransition(async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (authError) {
          setError(authError.message);
          return;
        }

        router.push(redirectedFrom || "/admin");
        router.refresh();
      } catch {
        setError("Giris sirasinda beklenmeyen bir hata olustu.");
      }
    });
  };

  return (
    <form className="login-card" onSubmit={handleSubmit}>
      <span className="eyebrow">Admin Erisimi</span>
      <h1 className="section-title">Basvurulara erismek icin oturum acin.</h1>
      <p>
        Supabase baglantisi hazirsa sadece yetkili ekip uyeleri admin ekranina girebilir. Ortam degiskenleri yoksa proje
        demo verisiyle calismaya devam eder.
      </p>
      <div className="question-list">
        <div className="question-card">
          <label className="field-label" htmlFor="email">
            E-posta
          </label>
          <input className="field-input" id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
        <div className="question-card">
          <label className="field-label" htmlFor="password">
            Sifre
          </label>
          <input className="field-input" id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </div>
      </div>
      {error ? <div className="error-text">{error}</div> : null}
      <div className="thank-you-actions">
        <button className="button" disabled={isPending} type="submit">
          {isPending ? "Kontrol ediliyor..." : "Admin girisi yap"}
        </button>
      </div>
    </form>
  );
}

import Link from "next/link";

import { SubmissionStatusSelect } from "@/components/admin/status-select";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { getCurrentAdminUser, listSubmissions } from "@/lib/submissions";
import { getStatusLabel, getStatusTone } from "@/lib/survey/logic";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { formatDate, joinClasses } from "@/lib/utils";

type AdminPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
  }>;
};

function buildAdminQuery(params: { q?: string; status?: string }, nextStatus: string) {
  const search = new URLSearchParams();

  if (params.q) {
    search.set("q", params.q);
  }

  if (nextStatus !== "all") {
    search.set("status", nextStatus);
  }

  const query = search.toString();
  return query.length > 0 ? `/admin?${query}` : "/admin";
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const submissions = await listSubmissions({
    q: params.q,
    status: params.status
  });
  const currentUser = await getCurrentAdminUser();
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

  const stats = {
    total: submissions.length,
    newCount: submissions.filter((item) => item.status === "new").length,
    qualified: submissions.filter((item) => item.status === "qualified").length,
    closed: submissions.filter((item) => item.status === "closed").length,
    recent: submissions.filter((item) => new Date(item.created_at).getTime() >= sevenDaysAgo).length
  };

  const statusLinks = [
    { value: "all", label: "Tum akıs", count: submissions.length },
    { value: "new", label: "Yeni", count: stats.newCount },
    { value: "qualified", label: "Nitelikli", count: stats.qualified },
    { value: "closed", label: "Kapali", count: stats.closed }
  ];

  const highlightedSubmission = submissions[0];

  return (
    <>
      <Navbar />
      <main className="shell admin-shell admin-dashboard-shell">
        <div className="container">
          <section className="admin-hero-card">
            <div className="admin-hero-copy">
              <span className="eyebrow">Executive Dashboard</span>
              <h1 className="section-title">Ambar ihtiyac analizleri</h1>
              <p className="muted admin-hero-text">
                Yeni talepleri hizli ayiklayin, demo icin uygun firmalari secin ve sureci tek ekranda yonetin.
              </p>
              <div className="admin-hero-badges">
                {isSupabaseConfigured() ? (
                  <span className="tag status">Aktif oturum: {currentUser?.email ?? "Yetkili kullanici"}</span>
                ) : (
                  <span className="tag">Demo mod acik</span>
                )}
                <span className="tag">Son 7 gun: {stats.recent} yeni hareket</span>
              </div>
            </div>

            <div className="admin-hero-side">
              <div className="admin-highlight-card">
                <span className="admin-highlight-label">Odak kayit</span>
                {highlightedSubmission ? (
                  <>
                    <strong>{highlightedSubmission.company_name}</strong>
                    <p>{highlightedSubmission.suggested_package}</p>
                    <div className="tag-list compact">
                      {highlightedSubmission.summary_tags.slice(0, 3).map((tag) => (
                        <span className="tag" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link className="button-secondary" href={`/admin/submissions/${highlightedSubmission.id}`}>
                      Detay paneline git
                    </Link>
                  </>
                ) : (
                  <p>Su an gosterilecek aktif basvuru bulunmuyor.</p>
                )}
              </div>
            </div>
          </section>

          {!isSupabaseConfigured() ? (
            <div className="notice admin-notice-card">
              <strong>Demo mod aktif.</strong> Supabase ortam degiskenleri baglandiginda gercek auth ve veritabani akisi devreye girer.
            </div>
          ) : null}

          <section className="admin-kpi-grid">
            <div className="admin-stat-card admin-stat-card--accent">
              <span>Toplam basvuru</span>
              <strong>{stats.total}</strong>
              <p>Butun kayit akisini tek yerden izleyin.</p>
            </div>
            <div className="admin-stat-card admin-stat-card--fresh">
              <span>Yeni bekleyen</span>
              <strong>{stats.newCount}</strong>
              <p>Hizli geri donus bekleyen talepler.</p>
            </div>
            <div className="admin-stat-card admin-stat-card--success">
              <span>Nitelikli firsat</span>
              <strong>{stats.qualified}</strong>
              <p>Demo veya kesif gorusmesi icin hazir adaylar.</p>
            </div>
            <div className="admin-stat-card admin-stat-card--muted">
              <span>Kapanan surec</span>
              <strong>{stats.closed}</strong>
              <p>Sonuclanmis veya kapanmis kayitlar.</p>
            </div>
          </section>

          <section className="admin-card admin-control-card">
            <div className="admin-control-header">
              <div>
                <span className="eyebrow">Pipeline Kontrolu</span>
                <h2 className="panel-title">Arama ve durum odagi</h2>
              </div>
              <Link className="button-secondary" href="/">
                Siteye don
              </Link>
            </div>

            <div className="admin-status-nav">
              {statusLinks.map((statusLink) => {
                const isActive = (params.status ?? "all") === statusLink.value || (!params.status && statusLink.value === "all");

                return (
                  <Link
                    className={joinClasses("admin-status-tab", isActive && "is-active")}
                    href={buildAdminQuery(params, statusLink.value)}
                    key={statusLink.value}
                  >
                    <span>{statusLink.label}</span>
                    <strong>{statusLink.count}</strong>
                  </Link>
                );
              })}
            </div>

            <form className="admin-filter-grid" method="get">
              <label className="admin-search-field">
                <span className="field-label">Basvuru ara</span>
                <input className="field-input" defaultValue={params.q ?? ""} name="q" placeholder="Firma, kisi, e-posta veya paket ara" />
              </label>
              <label className="admin-search-field">
                <span className="field-label">Durum filtresi</span>
                <select className="field-select" defaultValue={params.status ?? "all"} name="status">
                  <option value="all">Tum durumlar</option>
                  <option value="new">Yeni</option>
                  <option value="contacted">Iletisim kuruldu</option>
                  <option value="qualified">Nitelikli</option>
                  <option value="closed">Kapandi</option>
                </select>
              </label>
              <button className="button" type="submit">
                Filtreyi uygula
              </button>
            </form>
          </section>

          {submissions.length === 0 ? (
            <div className="empty-card admin-empty-state">
              <strong>Henuz goruntulenecek basvuru yok.</strong>
              <p className="muted">Ana sayfadaki anket dolduruldugunda talepler burada premium pipeline gorunumuyle listelenecek.</p>
            </div>
          ) : (
            <>
              <section className="admin-card admin-table-shell admin-desktop-only">
                <div className="admin-table-header">
                  <div>
                    <span className="eyebrow">Canli Liste</span>
                    <h2 className="panel-title">Basvurular</h2>
                  </div>
                  <p className="muted">Desktop deneyiminde hizli tarama icin tablo korunur, ancak satirlar kart hissi tasir.</p>
                </div>
                <div className="table-wrap">
                  <table className="table admin-table">
                    <thead>
                      <tr>
                        <th>Firma ve iletisim</th>
                        <th>Paket</th>
                        <th>Etiketler</th>
                        <th>Tarih</th>
                        <th>Durum</th>
                        <th>Aksiyon</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((submission) => (
                        <tr key={submission.id}>
                          <td>
                            <div className="company-stack">
                              <strong>{submission.company_name}</strong>
                              <span>{submission.contact_name}</span>
                              <span>{submission.contact_email}</span>
                              <span>{submission.contact_phone}</span>
                            </div>
                          </td>
                          <td>
                            <div className="package-stack">
                              <span className="package-badge">{submission.suggested_package}</span>
                              <span className="muted">{submission.industry}</span>
                            </div>
                          </td>
                          <td>
                            <div className="tag-list compact">
                              {submission.summary_tags.map((tag) => (
                                <span className="tag" key={tag}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td>
                            <div className="date-stack">
                              <strong>{formatDate(submission.created_at)}</strong>
                              <span className="muted">Kayit zamani</span>
                            </div>
                          </td>
                          <td>
                            <SubmissionStatusSelect id={submission.id} value={submission.status} />
                          </td>
                          <td>
                            <Link className="button-secondary admin-row-action" href={`/admin/submissions/${submission.id}`}>
                              Detay paneli
                            </Link>
                            <div className={`status-inline status-inline--${getStatusTone(submission.status)}`}>
                              {getStatusLabel(submission.status)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="admin-mobile-stack admin-mobile-only">
                {submissions.map((submission) => (
                  <article className="admin-card submission-mobile-card" key={submission.id}>
                    <div className="submission-mobile-top">
                      <div>
                        <span className="eyebrow">{submission.suggested_package}</span>
                        <h3 className="panel-title">{submission.company_name}</h3>
                        <p className="muted">{submission.contact_name} · {submission.contact_email}</p>
                      </div>
                      <span className={`status-inline status-inline--${getStatusTone(submission.status)}`}>
                        {getStatusLabel(submission.status)}
                      </span>
                    </div>
                    <div className="tag-list compact">
                      {submission.summary_tags.map((tag) => (
                        <span className="tag" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="submission-mobile-meta">
                      <span>{formatDate(submission.created_at)}</span>
                      <span>{submission.contact_phone}</span>
                    </div>
                    <SubmissionStatusSelect id={submission.id} value={submission.status} />
                    <Link className="button-secondary admin-row-action" href={`/admin/submissions/${submission.id}`}>
                      Detay paneline git
                    </Link>
                  </article>
                ))}
              </section>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

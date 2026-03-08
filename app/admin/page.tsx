import Link from "next/link";

import { SubmissionStatusSelect } from "@/components/admin/status-select";
import { getCurrentAdminUser, listSubmissions } from "@/lib/submissions";
import { getStatusLabel } from "@/lib/survey/logic";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { formatDate } from "@/lib/utils";

type AdminPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
  }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const submissions = await listSubmissions({
    q: params.q,
    status: params.status
  });
  const currentUser = await getCurrentAdminUser();
  const stats = {
    total: submissions.length,
    newCount: submissions.filter((item) => item.status === "new").length,
    qualified: submissions.filter((item) => item.status === "qualified").length
  };

  return (
    <main className="shell admin-shell">
      <div className="container">
        <div className="admin-header">
          <div>
            <span className="eyebrow">Basvuru Paneli</span>
            <h1 className="section-title">Ambar ihtiyac analizleri</h1>
            <p className="muted">
              Yeni talepleri filtreleyin, detaylarini gorun ve demo surecine tasimak icin durumlarini guncelleyin.
            </p>
          </div>
          <div className="tag-list">
            {isSupabaseConfigured() ? (
              <span className="tag status">{currentUser?.email ?? "Yetkili kullanici"}</span>
            ) : (
              <span className="tag">Demo mod: Supabase baglandiginda gercek auth aktif olur</span>
            )}
            <Link className="button-secondary" href="/">
              Siteye don
            </Link>
          </div>
        </div>

        {!isSupabaseConfigured() ? (
          <div className="notice">
            Supabase ortam degiskenleri bulunmadi. Panel demo verisiyle acildi; gercek auth ve veritabani icin .env dosyasini
            doldurup tabloyu olusturun.
          </div>
        ) : null}

        <div className="stats-grid">
          <div className="stat-card">
            <strong>{stats.total}</strong>
            <span>Toplam basvuru</span>
          </div>
          <div className="stat-card">
            <strong>{stats.newCount}</strong>
            <span>Yeni bekleyen</span>
          </div>
          <div className="stat-card">
            <strong>{stats.qualified}</strong>
            <span>Nitelikli firsat</span>
          </div>
        </div>

        <div className="admin-card" style={{ marginTop: "1.2rem" }}>
          <form className="filters" method="get">
            <input className="field-input" defaultValue={params.q ?? ""} name="q" placeholder="Firma, kisi veya e-posta ara" />
            <select className="field-select" defaultValue={params.status ?? "all"} name="status">
              <option value="all">Tum durumlar</option>
              <option value="new">Yeni</option>
              <option value="contacted">Iletisim kuruldu</option>
              <option value="qualified">Nitelikli</option>
              <option value="closed">Kapandi</option>
            </select>
            <button className="button" type="submit">
              Filtrele
            </button>
          </form>
        </div>

        {submissions.length === 0 ? (
          <div className="empty-card" style={{ marginTop: "1rem" }}>
            <strong>Henuz goruntulenecek basvuru yok.</strong>
            <p className="muted">Ana sayfadaki anketi doldurdugunuzda basvurular burada listelenecek.</p>
          </div>
        ) : (
          <div className="admin-card" style={{ marginTop: "1rem" }}>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Firma</th>
                    <th>Paket</th>
                    <th>Etiketler</th>
                    <th>Tarih</th>
                    <th>Durum</th>
                    <th>Detay</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr key={submission.id}>
                      <td>
                        <strong>{submission.company_name}</strong>
                        <div className="muted">{submission.contact_name}</div>
                        <div className="muted">{submission.contact_email}</div>
                      </td>
                      <td>{submission.suggested_package}</td>
                      <td>
                        <div className="tag-list">
                          {submission.summary_tags.map((tag) => (
                            <span className="tag" key={tag}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>{formatDate(submission.created_at)}</td>
                      <td>
                        <SubmissionStatusSelect id={submission.id} value={submission.status} />
                        <div className="muted" style={{ marginTop: "0.45rem" }}>
                          {getStatusLabel(submission.status)}
                        </div>
                      </td>
                      <td>
                        <Link href={`/admin/submissions/${submission.id}`}>Detayi gor</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

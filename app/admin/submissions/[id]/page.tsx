import Link from "next/link";
import { notFound } from "next/navigation";

import { SubmissionStatusSelect } from "@/components/admin/status-select";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { getSubmissionById } from "@/lib/submissions";
import { deriveSurveySummary, getSubmissionAnswerSections, getStatusLabel, getStatusTone } from "@/lib/survey/logic";
import { formatDate } from "@/lib/utils";

type SubmissionDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function SubmissionDetailPage({ params }: SubmissionDetailPageProps) {
  const { id } = await params;
  const submission = await getSubmissionById(id);

  if (!submission) {
    notFound();
  }

  const answerSections = getSubmissionAnswerSections(submission.answers);
  const summary = deriveSurveySummary(submission.answers);

  return (
    <>
      <Navbar />
      <main className="shell admin-shell admin-dashboard-shell">
        <div className="container admin-detail-page">
          <section className="admin-detail-hero">
            <div>
              <Link className="button-secondary admin-back-link" href="/admin">
                Listeye don
              </Link>
              <span className="eyebrow">Basvuru Detayi</span>
              <h1 className="section-title">{submission.company_name}</h1>
              <p className="muted admin-hero-text">
                {submission.contact_name} · {submission.contact_email} · {submission.contact_phone}
              </p>
              <div className="tag-list compact">
                <span className={`status-inline status-inline--${getStatusTone(submission.status)}`}>{getStatusLabel(submission.status)}</span>
                <span className="tag">{formatDate(submission.created_at)}</span>
                <span className="tag">{submission.suggested_package}</span>
              </div>
            </div>

            <div className="admin-highlight-card admin-highlight-card--detail">
              <span className="admin-highlight-label">Operasyon sinyali</span>
              <strong>{summary.suggestedPackage}</strong>
              <p>{summary.narrative}</p>
              <div className="tag-list compact">
                {submission.summary_tags.map((tag) => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <div className="admin-detail-layout">
            <section className="admin-detail-main">
              {answerSections.map((section) => (
                <article className="admin-card answer-section-card" key={section.id}>
                  <div className="answer-section-header">
                    <div>
                      <span className="eyebrow">{section.title}</span>
                      <h2 className="panel-title">{section.title}</h2>
                    </div>
                    <p className="muted">{section.description}</p>
                  </div>
                  <div className="answer-section-list">
                    {section.items.map((item) => (
                      <div className="answer-row answer-row--rich" key={item.questionId}>
                        <div>
                          <strong>{item.label}</strong>
                          {item.otherNote ? <p className="answer-inline-note">Ek not: {item.otherNote}</p> : null}
                        </div>
                        <span>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </section>

            <aside className="admin-detail-sidebar">
              <div className="admin-card detail-summary-card">
                <span className="eyebrow">Kesif Ozeti</span>
                <h2 className="panel-title">{submission.suggested_package}</h2>
                <p className="muted">Basvuru bu asamada bu kapsamla eslesiyor.</p>
                <div className="detail-grid detail-grid--stacked">
                  <div className="detail-card">
                    <strong>Durum yonetimi</strong>
                    <SubmissionStatusSelect id={submission.id} value={submission.status} />
                  </div>
                  <div className="detail-card">
                    <strong>Temel bilgiler</strong>
                    <span>{submission.industry}</span>
                    <span>{submission.warehouse_count} depo yapisi</span>
                    <span>{submission.priority} odak</span>
                    <span>{submission.launch_window} hedef pencere</span>
                  </div>
                </div>
              </div>

              <div className="admin-card detail-summary-card">
                <span className="eyebrow">Iletisim ve etiketler</span>
                <div className="detail-contact-list">
                  <div className="detail-contact-row">
                    <strong>Kisi</strong>
                    <span>{submission.contact_name}</span>
                  </div>
                  <div className="detail-contact-row">
                    <strong>E-posta</strong>
                    <span>{submission.contact_email}</span>
                  </div>
                  <div className="detail-contact-row">
                    <strong>Telefon</strong>
                    <span>{submission.contact_phone}</span>
                  </div>
                </div>
                <div className="tag-list compact">
                  {submission.summary_tags.map((tag) => (
                    <span className="tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

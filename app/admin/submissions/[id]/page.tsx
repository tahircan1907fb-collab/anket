import { notFound } from "next/navigation";
import Link from "next/link";

import { SubmissionStatusSelect } from "@/components/admin/status-select";
import { getSubmissionById } from "@/lib/submissions";
import { getAnswerLabel, getQuestionById } from "@/lib/survey/logic";
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

  const answerEntries = Object.entries(submission.answers).filter(([, value]) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return value !== undefined && String(value).trim().length > 0;
  });

  return (
    <main className="shell admin-shell">
      <div className="container">
        <div className="admin-header">
          <div>
            <span className="eyebrow">Basvuru Detayi</span>
            <h1 className="section-title">{submission.company_name}</h1>
            <p className="muted">
              {submission.contact_name} - {submission.contact_email} - {submission.contact_phone}
            </p>
          </div>
          <div className="tag-list">
            <Link className="button-secondary" href="/admin">
              Listeye don
            </Link>
          </div>
        </div>

        <div className="admin-card">
          <div className="detail-grid">
            <div className="detail-card">
              <strong>Onerilen paket</strong>
              <span>{submission.suggested_package}</span>
            </div>
            <div className="detail-card">
              <strong>Basvuru tarihi</strong>
              <span>{formatDate(submission.created_at)}</span>
            </div>
            <div className="detail-card">
              <strong>Durum</strong>
              <SubmissionStatusSelect id={submission.id} value={submission.status} />
            </div>
            <div className="detail-card">
              <strong>Operasyon etiketi</strong>
              <div className="tag-list" style={{ marginTop: "0.7rem" }}>
                {submission.summary_tags.map((tag) => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card" style={{ marginTop: "1rem" }}>
          <strong>Tum yanitlar</strong>
          <div className="answer-list">
            {answerEntries.map(([questionId, value]) => {
              const question = getQuestionById(questionId);
              return (
                <div className="answer-row" key={questionId}>
                  <strong>{question?.label ?? questionId}</strong>
                  <span>{getAnswerLabel(questionId, value)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}

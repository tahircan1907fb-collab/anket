"use client";

import { useEffect, useState } from "react";

type StoredSummary = {
  suggestedPackage: string;
  summaryTags: string[];
  narrative: string;
};

const emptyState: StoredSummary = {
  suggestedPackage: "Kesif gorusmesi ozetiniz hazirlaniyor",
  summaryTags: ["Ihtiyac analizi tamamlandi"],
  narrative: "Yanıtlariniz kaydedildi. Demo gorusmesinde birlikte detaylandirabiliriz."
};

export function ThankYouSummary() {
  const [summary, setSummary] = useState<StoredSummary>(emptyState);

  useEffect(() => {
    const raw = window.sessionStorage.getItem("latest-survey-summary");
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as StoredSummary;
      setSummary(parsed);
    } catch {
      setSummary(emptyState);
    }
  }, []);

  return (
    <div className="thank-you-card">
      <span className="eyebrow">Onerilen Kapsam</span>
      <h2 className="panel-title">{summary.suggestedPackage}</h2>
      <p>{summary.narrative}</p>
      <div className="tag-list">
        {summary.summaryTags.map((tag) => (
          <span className="tag" key={tag}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

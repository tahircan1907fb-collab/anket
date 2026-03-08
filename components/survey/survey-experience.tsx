"use client";

import { useDeferredValue, useEffect, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { trackEvent } from "@/lib/analytics";
import { getSurveySections } from "@/lib/survey/logic";
import {
  deriveSurveySummary,
  getSectionCompletion,
  getSectionQuestions,
  getValidationErrors,
  sanitizeAnswers
} from "@/lib/survey/logic";
import type { SurveyAnswers, SurveyQuestion, SurveyValue } from "@/lib/survey/types";
import { joinClasses } from "@/lib/utils";

const STORAGE_KEY = "premium-ambar-survey-state";

function getStringValue(value: SurveyValue) {
  return typeof value === "string" ? value : "";
}

function renderQuestionField(args: {
  question: SurveyQuestion;
  value: SurveyValue;
  error?: string;
  onChange: (questionId: string, value: SurveyValue) => void;
}) {
  const { question, value, error, onChange } = args;

  if (question.type === "text" || question.type === "email" || question.type === "tel") {
    return (
      <>
        <input
          className="field-input"
          type={question.type}
          placeholder={question.placeholder}
          value={getStringValue(value)}
          onChange={(event) => onChange(question.id, event.target.value)}
        />
        {error ? <div className="error-text">{error}</div> : null}
      </>
    );
  }

  if (question.type === "textarea") {
    return (
      <>
        <textarea
          className="field-textarea"
          placeholder={question.placeholder}
          value={getStringValue(value)}
          onChange={(event) => onChange(question.id, event.target.value)}
        />
        {error ? <div className="error-text">{error}</div> : null}
      </>
    );
  }

  if (question.type === "select") {
    return (
      <>
        <select
          className="field-select"
          value={getStringValue(value)}
          onChange={(event) => onChange(question.id, event.target.value)}
        >
          <option value="">Secim yapin</option>
          {question.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error ? <div className="error-text">{error}</div> : null}
      </>
    );
  }

  if (question.type === "radio") {
    return (
      <>
        <div className="choice-grid">
          {question.options?.map((option) => {
            const checked = value === option.value;
            return (
              <label className={joinClasses("choice-card", checked && "is-selected")} key={option.value}>
                <input
                  type="radio"
                  checked={checked}
                  onChange={() => onChange(question.id, option.value)}
                />
                <span className="choice-copy">
                  <strong>{option.label}</strong>
                  {option.hint ? <span>{option.hint}</span> : null}
                </span>
              </label>
            );
          })}
        </div>
        {error ? <div className="error-text">{error}</div> : null}
      </>
    );
  }

  if (question.type === "multi-select") {
    const selectedValues = Array.isArray(value) ? value.map(String) : [];

    return (
      <>
        <div className="choice-grid">
          {question.options?.map((option) => {
            const checked = selectedValues.includes(option.value);
            return (
              <label className={joinClasses("choice-card", checked && "is-selected")} key={option.value}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const nextValue = checked
                      ? selectedValues.filter((item) => item !== option.value)
                      : [...selectedValues, option.value];
                    onChange(question.id, nextValue);
                  }}
                />
                <span className="choice-copy">
                  <strong>{option.label}</strong>
                  {option.hint ? <span>{option.hint}</span> : null}
                </span>
              </label>
            );
          })}
        </div>
        {error ? <div className="error-text">{error}</div> : null}
      </>
    );
  }

  return null;
}

export function SurveyExperience() {
  const router = useRouter();
  const sections = getSurveySections();
  const [answers, setAnswers] = useState<SurveyAnswers>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [startedAt, setStartedAt] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [isPending, startTransition] = useTransition();

  const currentSection = sections[currentStep];
  const currentQuestions = getSectionQuestions(currentSection.id, answers);
  const summary = deriveSurveySummary(answers);
  const deferredSummary = useDeferredValue(summary);
  const progress = ((currentStep + 1) / sections.length) * 100;

  useEffect(() => {
    trackEvent("survey_viewed", { flow: "premium-ambar" });

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as {
          answers: SurveyAnswers;
          currentStep: number;
          startedAt: string;
        };
        setAnswers(parsed.answers ?? {});
        setCurrentStep(parsed.currentStep ?? 0);
        setStartedAt(parsed.startedAt ?? new Date().toISOString());
      } catch {
        setStartedAt(new Date().toISOString());
      }
    } else {
      setStartedAt(new Date().toISOString());
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        answers,
        currentStep,
        startedAt
      })
    );
  }, [answers, currentStep, hydrated, startedAt]);

  const updateAnswer = (questionId: string, value: SurveyValue) => {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: value
    }));

    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[questionId];
      return nextErrors;
    });
  };

  const validateCurrentStep = () => {
    const stepErrors = getValidationErrors(currentSection.id, answers);
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const goNext = () => {
    if (!validateCurrentStep()) {
      return;
    }

    startTransition(() => {
      const nextStep = Math.min(currentStep + 1, sections.length - 1);
      setCurrentStep(nextStep);
      trackEvent("survey_step_completed", {
        section: currentSection.id,
        nextSection: sections[nextStep]?.id
      });
    });
  };

  const goBack = () => {
    startTransition(() => {
      setCurrentStep((step) => Math.max(step - 1, 0));
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateCurrentStep()) {
      return;
    }

    setStatusMessage(null);

    const sanitizedAnswers = sanitizeAnswers(answers);
    const payload = {
      answers: sanitizedAnswers,
      summaryTags: deferredSummary.summaryTags,
      suggestedPackage: deferredSummary.suggestedPackage,
      analytics: {
        startedAt,
        submittedAt: new Date().toISOString()
      }
    };

    startTransition(async () => {
      try {
        const response = await fetch("/api/survey", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        const result = (await response.json()) as { error?: string };

        if (!response.ok) {
          setStatusMessage(result.error ?? "Basvuru gonderilirken bir hata olustu.");
          return;
        }

        trackEvent("survey_submitted", {
          package: deferredSummary.suggestedPackage,
          tags: deferredSummary.summaryTags
        });

        window.sessionStorage.setItem(
          "latest-survey-summary",
          JSON.stringify({
            suggestedPackage: deferredSummary.suggestedPackage,
            summaryTags: deferredSummary.summaryTags,
            narrative: deferredSummary.narrative
          })
        );
        window.localStorage.removeItem(STORAGE_KEY);
        router.push("/tesekkurler");
      } catch {
        setStatusMessage("Sunucu ile baglanti kurulamadi. Lutfen tekrar deneyin.");
      }
    });
  };

  return (
    <section className="survey-section" id="anket">
      <div className="container survey-grid">
        <form className="panel" onSubmit={handleSubmit}>
          <div className="panel-header">
            <div>
              <div className="panel-kicker">
                <span>{currentSection.eyebrow}</span>
                <strong>AmbarScope Analyzer</strong>
              </div>
              <h2 className="panel-title">{currentSection.title}</h2>
              <p className="muted">{currentSection.description}</p>
            </div>
            <span className="muted">{currentStep + 1} / {sections.length}</span>
          </div>

          <div className="progress-track">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>

          <div className="steps">
            {sections.map((section, index) => {
              const completion = getSectionCompletion(section.id, answers);
              return (
                <div
                  className={joinClasses(
                    "step-card",
                    index === currentStep && "active",
                    index < currentStep && completion >= 1 && "complete"
                  )}
                  key={section.id}
                >
                  <small className="step-number">Adım 0{index + 1}</small>
                  <div className="step-title">{section.title}</div>
                  <div className="step-status">
                    <div className="status-indicator" style={{ "--progress": completion } as any}></div>
                    <span>%{Math.round(completion * 100)} Tamamlandı</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="question-list">
            {currentQuestions.length === 0 ? (
              <div className="question-card">
                <strong>Bu bolum sizin secimlerinize gore otomatik gecti.</strong>
                <p className="field-description">Devam ettiginizde bir sonraki ilgili sorulara gececeksiniz.</p>
              </div>
            ) : null}
            {currentQuestions.map((question) => (
              <div className="question-card" key={question.id}>
                <label className="field-label" htmlFor={question.id}>
                  {question.label}
                </label>
                {question.description ? <p className="field-description">{question.description}</p> : null}
                {renderQuestionField({
                  question,
                  value: answers[question.id],
                  error: errors[question.id],
                  onChange: updateAnswer
                })}
              </div>
            ))}
          </div>

          {statusMessage ? <div className="error-text">{statusMessage}</div> : null}

          <div className="panel-footer">
            <button className="button-ghost" disabled={currentStep === 0 || isPending} onClick={goBack} type="button">
              Geri don
            </button>
            {currentStep === sections.length - 1 ? (
              <button className="button" disabled={isPending} type="submit">
                {isPending ? "Gonderiliyor..." : "Ozeti onayla ve kesif talebi gonder"}
              </button>
            ) : (
              <button className="button" disabled={isPending} onClick={goNext} type="button">
                Devam et
              </button>
            )}
          </div>
        </form>

        <aside className="summary-rail">
          <div className="summary-card">
            <span className="eyebrow">Canli Ozet</span>
            <h3 className="panel-title">{deferredSummary.suggestedPackage}</h3>
            <p className="muted">{deferredSummary.narrative}</p>
            <div className="summary-chip-list">
              {deferredSummary.summaryTags.length > 0 ? (
                deferredSummary.summaryTags.map((tag) => (
                  <span className="summary-chip" key={tag}>
                    {tag}
                  </span>
                ))
              ) : (
                <span className="summary-chip">Secim yaptikca kapsam etiketleri burada olusur.</span>
              )}
            </div>
            <div className="summary-score">
              <strong>Kapsam yogunlugu</strong>
              <div className="score-meter">
                <span style={{ width: `${Math.min(deferredSummary.complexityScore * 6, 100)}%` }} />
              </div>
            </div>
          </div>

          <div className="summary-card">
            <span className="eyebrow">Nasil Calisir</span>
            <div className="summary-list">
              <div>
                <strong>1. Operasyonu okur</strong>
                <span className="muted">Depo sayisi, urun cesidi ve ekip yapisini anlamlandirir.</span>
              </div>
              <div>
                <strong>2. Derinligi belirler</strong>
                <span className="muted">Barkod, lot, sayim ve entegrasyon ihtiyaci secimlere gore acilir.</span>
              </div>
              <div>
                <strong>3. Demo sinyali uretir</strong>
                <span className="muted">Son adimda size uygun kapsam ve kesif CTA'si netlesir.</span>
              </div>
            </div>
            <div className="summary-actions">
              <a className="button-secondary" href="#anket">
                Bu akisi paylas
              </a>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

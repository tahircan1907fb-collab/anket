"use client";

import { useDeferredValue, useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { trackEvent } from "@/lib/analytics";
import {
  deriveSurveySummary,
  getInlineOtherFieldId,
  getSectionCompletion,
  getSectionQuestions,
  getSurveySections,
  getValidationErrors,
  sanitizeAnswers
} from "@/lib/survey/logic";
import type { SurveyAnswers, SurveyQuestion, SurveyValue } from "@/lib/survey/types";
import { joinClasses } from "@/lib/utils";

const STORAGE_KEY = "premium-ambar-survey-state";

function getStringValue(value: SurveyValue) {
  return typeof value === "string" ? value : "";
}

function formatPhoneInput(rawValue: string) {
  const digits = rawValue.replace(/\D/g, "").slice(0, 12);

  if (digits.length === 0) {
    return "";
  }

  let normalized = digits;

  if (normalized.startsWith("0")) {
    normalized = `90${normalized.slice(1)}`;
  } else if (!normalized.startsWith("90")) {
    normalized = `90${normalized}`;
  }

  normalized = normalized.slice(0, 12);

  const country = normalized.slice(0, 2);
  const parts = [
    normalized.slice(2, 5),
    normalized.slice(5, 8),
    normalized.slice(8, 10),
    normalized.slice(10, 12)
  ].filter(Boolean);

  return `+${country}${parts.length > 0 ? ` ${parts.join(" ")}` : ""}`;
}

function getFieldChip(question: SurveyQuestion) {
  switch (question.type) {
    case "email":
      return "E-posta";
    case "tel":
      return "Telefon";
    case "textarea":
      return "Aciklama";
    case "select":
      return "Secim";
    default:
      return "Bilgi";
  }
}

function getFieldHint(question: SurveyQuestion) {
  if (question.type === "tel") {
    return "Format: +90 5xx xxx xx xx";
  }

  if (question.type === "email") {
    return "Kurumsal e-posta kullanmaniz oneriilir.";
  }

  if (question.type === "textarea") {
    return "Kritik beklentileri, mevcut sistemi veya saha notlarini yazabilirsiniz.";
  }

  return question.placeholder ?? "";
}

function getAutoComplete(question: SurveyQuestion) {
  if (question.id === "companyName") {
    return "organization";
  }

  if (question.id === "contactName") {
    return "name";
  }

  if (question.id === "contactEmail") {
    return "email";
  }

  if (question.id === "contactPhone") {
    return "tel";
  }

  return "off";
}

function questionNeedsCommaHelp(questionId: string) {
  return ["modules", "painPoints", "trackingNeeds"].includes(questionId);
}

function getOtherFieldHint(question: SurveyQuestion) {
  if (questionNeedsCommaHelp(question.id)) {
    return "Birden fazla madde ekleyecekseniz aralarina ',' koyun.";
  }

  return "Buraya kisaca ek detay yazabilirsiniz.";
}

function isOtherSelected(question: SurveyQuestion, value: SurveyValue) {
  if (Array.isArray(value)) {
    return value.includes("diger");
  }

  return value === "diger";
}

function renderQuestionField(args: {
  question: SurveyQuestion;
  value: SurveyValue;
  answers: SurveyAnswers;
  error?: string;
  onChange: (questionId: string, value: SurveyValue) => void;
}) {
  const { question, value, answers, error, onChange } = args;
  const inputValue = getStringValue(value);

  if (question.type === "text" || question.type === "email" || question.type === "tel") {
    const normalizedValue = question.type === "tel" ? formatPhoneInput(inputValue) : inputValue;

    return (
      <div className="field-stack">
        <div className={joinClasses("field-frame", error && "has-error")}>
          <span className="field-chip">{getFieldChip(question)}</span>
          <input
            aria-invalid={Boolean(error)}
            autoComplete={getAutoComplete(question)}
            className="field-input field-input--framed"
            id={question.id}
            inputMode={question.type === "tel" ? "tel" : question.type === "email" ? "email" : "text"}
            placeholder={question.placeholder}
            type={question.type === "tel" ? "text" : question.type}
            value={normalizedValue}
            onChange={(event) =>
              onChange(question.id, question.type === "tel" ? formatPhoneInput(event.target.value) : event.target.value)
            }
          />
        </div>
        <div className="field-note">{getFieldHint(question)}</div>
        {error ? <div className="error-text">{error}</div> : null}
      </div>
    );
  }

  if (question.type === "textarea") {
    return (
      <div className="field-stack">
        <div className={joinClasses("field-frame field-frame--textarea", error && "has-error")}>
          <span className="field-chip">{getFieldChip(question)}</span>
          <textarea
            aria-invalid={Boolean(error)}
            autoComplete={getAutoComplete(question)}
            className="field-textarea field-textarea--framed"
            id={question.id}
            placeholder={question.placeholder}
            value={inputValue}
            onChange={(event) => onChange(question.id, event.target.value)}
          />
        </div>
        <div className="field-note">{getFieldHint(question)}</div>
        {error ? <div className="error-text">{error}</div> : null}
      </div>
    );
  }

  if (question.type === "select") {
    return (
      <div className="field-stack">
        <div className={joinClasses("field-frame", error && "has-error")}>
          <span className="field-chip">{getFieldChip(question)}</span>
          <select
            aria-invalid={Boolean(error)}
            className="field-select field-select--framed"
            id={question.id}
            value={inputValue}
            onChange={(event) => onChange(question.id, event.target.value)}
          >
            <option value="">Secim yapin</option>
            {question.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field-note">Acilir listeden size en yakin secenegi secin.</div>
        {error ? <div className="error-text">{error}</div> : null}
      </div>
    );
  }

  if (question.type === "radio") {
    const otherFieldId = getInlineOtherFieldId(question.id);

    return (
      <>
        <div className="choice-grid">
          {question.options?.map((option) => {
            const checked = value === option.value;
            const isOtherOption = option.value === "diger";
            const optionId = `${question.id}-${option.value}`;

            return (
              <div className={joinClasses("choice-card", checked && "is-selected", isOtherOption && checked && "choice-card--stacked")} key={option.value}>
                <input id={optionId} type="radio" checked={checked} onChange={() => onChange(question.id, option.value)} />
                <label className="choice-copy" htmlFor={optionId}>
                  <strong>{option.label}</strong>
                  {option.hint ? <span>{option.hint}</span> : null}
                </label>
                {isOtherOption && checked ? (
                  <div className="choice-other">
                    <input
                      className="field-input field-input--inline-other"
                      id={otherFieldId}
                      placeholder="Diger secenegi icin aciklama yazin"
                      type="text"
                      value={getStringValue(answers[otherFieldId])}
                      onChange={(event) => onChange(otherFieldId, event.target.value)}
                    />
                    <span className="field-note">{getOtherFieldHint(question)}</span>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        {error ? <div className="error-text">{error}</div> : null}
      </>
    );
  }

  if (question.type === "multi-select") {
    const selectedValues = Array.isArray(value) ? value.map(String) : [];
    const otherFieldId = getInlineOtherFieldId(question.id);
    const showOtherField = selectedValues.includes("diger");

    return (
      <>
        <div className="choice-grid">
          {question.options?.map((option) => {
            const checked = selectedValues.includes(option.value);

            return (
              <label className={joinClasses("choice-card", checked && "is-selected")} key={option.value}>
                <input
                  id={`${question.id}-${option.value}`}
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
        {showOtherField ? (
          <div className="choice-other-panel">
            <input
              className="field-input field-input--inline-other"
              id={otherFieldId}
              placeholder={questionNeedsCommaHelp(question.id) ? "Ornek: kalite kontrol, iade sureci" : "Eklemek istediginiz detayi yazin"}
              type="text"
              value={getStringValue(answers[otherFieldId])}
              onChange={(event) => onChange(otherFieldId, event.target.value)}
            />
            <div className="field-note">{getOtherFieldHint(question)}</div>
          </div>
        ) : null}
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
  const questionListRef = useRef<HTMLDivElement | null>(null);
  const hasStepMountedRef = useRef(false);

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


  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!hasStepMountedRef.current) {
      hasStepMountedRef.current = true;
      return;
    }

    const questionTop = questionListRef.current?.getBoundingClientRect().top;
    if (questionTop === undefined) {
      return;
    }

    window.scrollTo({
      top: Math.max(window.scrollY + questionTop - 24, 0),
      behavior: "smooth"
    });
  }, [currentStep, hydrated]);
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

    if (Object.keys(stepErrors).length > 0) {
      setStatusMessage("Lütfen kırmızı ile işaretlenmiş zorunlu alanları kontrol edin.");
      return false;
    }

    setStatusMessage(null);
    return true;
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
      setStatusMessage(null);
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

        const result = (await response.json()) as { error?: string; fieldErrors?: Record<string, string> };

        if (!response.ok) {
          if (result.fieldErrors) {
            setErrors(result.fieldErrors);
          }
          setStatusMessage(result.error ?? "Bașvuru gönderilirken bir hata oluștu.");
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
        <form className="panel" onSubmit={handleSubmit} noValidate>
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

          <div className="question-list" key={currentStep} ref={questionListRef}>
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
                  answers,
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










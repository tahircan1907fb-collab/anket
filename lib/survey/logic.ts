import { surveyQuestions, surveySections } from "@/lib/survey/config";
import type {
  SubmissionStatus,
  SurveyAnswers,
  SurveyQuestion,
  SurveySection,
  SurveySummary,
  SurveyValue,
  VisibilityRule
} from "@/lib/survey/types";

const statusLabels: Record<SubmissionStatus, string> = {
  new: "Yeni",
  contacted: "Iletisim kuruldu",
  qualified: "Nitelikli",
  closed: "Kapandi"
};

export function getStatusLabel(status: SubmissionStatus) {
  return statusLabels[status];
}

export function getSurveySections(): SurveySection[] {
  return surveySections;
}

export function getQuestionById(questionId: string) {
  return surveyQuestions.find((question) => question.id === questionId);
}

function normalizeArrayValue(value: SurveyValue) {
  if (Array.isArray(value)) {
    return value.map(String);
  }

  if (typeof value === "string" && value.length > 0) {
    return [value];
  }

  return [];
}

function isRuleSatisfied(rule: VisibilityRule, answers: SurveyAnswers) {
  const value = answers[rule.field];
  const valueAsString = typeof value === "string" ? value : value != null ? String(value) : "";
  const valueAsArray = normalizeArrayValue(value);

  if (rule.equals && valueAsString !== rule.equals) {
    return false;
  }

  if (rule.notEquals && valueAsString === rule.notEquals) {
    return false;
  }

  if (rule.includes && !valueAsArray.includes(rule.includes)) {
    return false;
  }

  if (rule.isOneOf && !rule.isOneOf.includes(valueAsString)) {
    return false;
  }

  return true;
}

export function isQuestionVisible(question: SurveyQuestion, answers: SurveyAnswers) {
  if (!question.visibleWhen || question.visibleWhen.length === 0) {
    return true;
  }

  return question.visibleWhen.every((rule) => isRuleSatisfied(rule, answers));
}

export function getSectionQuestions(sectionId: string, answers: SurveyAnswers) {
  return surveyQuestions.filter((question) => question.sectionId === sectionId && isQuestionVisible(question, answers));
}

function hasValue(value: SurveyValue) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return value !== undefined;
}

export function getValidationErrors(sectionId: string, answers: SurveyAnswers) {
  const questions = getSectionQuestions(sectionId, answers);
  const errors: Record<string, string> = {};

  for (const question of questions) {
    const value = answers[question.id];

    if (question.required && !hasValue(value)) {
      errors[question.id] = "Bu alan zorunludur.";
      continue;
    }

    if (question.type === "email" && typeof value === "string" && value.trim().length > 0) {
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (!isValidEmail) {
        errors[question.id] = "Gecerli bir e-posta girin.";
      }
    }
  }

  return errors;
}

export function sanitizeAnswers(answers: SurveyAnswers) {
  const sanitized: SurveyAnswers = {};

  for (const question of surveyQuestions) {
    if (!isQuestionVisible(question, answers)) {
      continue;
    }

    const value = answers[question.id];

    if (Array.isArray(value)) {
      if (value.length > 0) {
        sanitized[question.id] = value;
      }
      continue;
    }

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        sanitized[question.id] = trimmed;
      }
      continue;
    }

    if (value !== undefined) {
      sanitized[question.id] = value;
    }
  }

  return sanitized;
}

function includesAnswer(answers: SurveyAnswers, field: string, target: string) {
  return normalizeArrayValue(answers[field]).includes(target);
}

function complexityFromRange(value: SurveyValue, map: Record<string, number>) {
  const key = typeof value === "string" ? value : "";
  return map[key] ?? 0;
}

export function deriveSurveySummary(answers: SurveyAnswers): SurveySummary {
  const tags: string[] = [];

  if (includesAnswer(answers, "modules", "stok")) {
    tags.push("Temel stok takibi");
  }

  if (
    includesAnswer(answers, "modules", "lokasyon") ||
    ["2-3", "4+"].includes(String(answers.warehouseCount ?? ""))
  ) {
    tags.push("Cok lokasyonlu depo");
  }

  if (
    includesAnswer(answers, "modules", "barkod") ||
    includesAnswer(answers, "integrations", "barcode_reader")
  ) {
    tags.push("Barkod destekli operasyon");
  }

  if (includesAnswer(answers, "modules", "raporlama")) {
    tags.push("Raporlama oncelikli");
  }

  if (
    includesAnswer(answers, "trackingNeeds", "lot") ||
    includesAnswer(answers, "trackingNeeds", "seri") ||
    includesAnswer(answers, "trackingNeeds", "skt")
  ) {
    tags.push("Ileri izlenebilirlik");
  }

  if (["11-25", "25+"].includes(String(answers.userCount ?? ""))) {
    tags.push("Cok kullanicili yapi");
  }

  if (
    includesAnswer(answers, "integrations", "erp") ||
    includesAnswer(answers, "integrations", "accounting") ||
    includesAnswer(answers, "integrations", "excel")
  ) {
    tags.push("Entegrasyon odakli");
  }

  if (answers.priority === "speed" || answers.launchWindow === "0-1") {
    tags.push("Hizli devreye alma");
  }

  const complexityScore =
    complexityFromRange(answers.warehouseCount, { "1": 1, "2-3": 2, "4+": 3 }) +
    complexityFromRange(answers.skuRange, { "0-200": 1, "200-1000": 2, "1000-5000": 3, "5000+": 4 }) +
    complexityFromRange(answers.userCount, { "1-3": 1, "4-10": 2, "11-25": 3, "25+": 4 }) +
    normalizeArrayValue(answers.modules).length +
    normalizeArrayValue(answers.integrations).length +
    normalizeArrayValue(answers.trackingNeeds).length;

  let suggestedPackage = "MVP Stok Takip Paketi";
  if (complexityScore >= 12) {
    suggestedPackage = "Kurumsal Depo Platformu";
  } else if (complexityScore >= 8) {
    suggestedPackage = "Operasyon Plus Paketi";
  }

  const narrative = `${String(answers.companyName ?? "Firmaniz")} icin ${suggestedPackage.toLowerCase()} kurgusu, secilen moduller ve operasyon derinligi ile uyumlu gorunuyor.`;

  return {
    summaryTags: [...new Set(tags)],
    suggestedPackage,
    narrative,
    complexityScore
  };
}

export function getAnswerLabel(questionId: string, rawValue: SurveyValue) {
  const question = getQuestionById(questionId);
  if (!question) {
    return Array.isArray(rawValue) ? rawValue.join(", ") : String(rawValue ?? "-");
  }

  if (!question.options || question.options.length === 0) {
    return Array.isArray(rawValue) ? rawValue.join(", ") : String(rawValue ?? "-");
  }

  if (Array.isArray(rawValue)) {
    return rawValue
      .map((value) => question.options?.find((option) => option.value === value)?.label ?? value)
      .join(", ");
  }

  return question.options.find((option) => option.value === rawValue)?.label ?? String(rawValue ?? "-");
}

export function getSectionCompletion(sectionId: string, answers: SurveyAnswers) {
  const questions = getSectionQuestions(sectionId, answers);
  if (questions.length === 0) {
    return 1;
  }

  const answered = questions.filter((question) => hasValue(answers[question.id])).length;
  return answered / questions.length;
}

export function getSubmissionPreview(answers: SurveyAnswers) {
  const summary = deriveSurveySummary(answers);
  return {
    title: summary.suggestedPackage,
    description: summary.narrative,
    tags: summary.summaryTags
  };
}

export function getAllVisibleQuestionIds(answers: SurveyAnswers) {
  return surveyQuestions.filter((question) => isQuestionVisible(question, answers)).map((question) => question.id);
}

export function getSurveyQuestions() {
  return surveyQuestions;
}

export function getStatusOptions() {
  return Object.keys(statusLabels) as SubmissionStatus[];
}

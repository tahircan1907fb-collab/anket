import { surveyQuestions, surveySections } from "@/lib/survey/config";
import type {
  AdminSubmissionAnswerSection,
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

const statusToneMap: Record<SubmissionStatus, string> = {
  new: "fresh",
  contacted: "warm",
  qualified: "success",
  closed: "muted"
};

const INLINE_OTHER_SUFFIX = "__other";

export function getStatusLabel(status: SubmissionStatus) {
  return statusLabels[status];
}

export function getStatusTone(status: SubmissionStatus) {
  return statusToneMap[status];
}

export function getSurveySections(): SurveySection[] {
  return surveySections;
}

export function getInlineOtherFieldId(questionId: string) {
  return `${questionId}${INLINE_OTHER_SUFFIX}`;
}

export function isInlineOtherFieldId(questionId: string) {
  return questionId.endsWith(INLINE_OTHER_SUFFIX);
}

function normalizeQuestionId(questionId: string) {
  return isInlineOtherFieldId(questionId)
    ? questionId.slice(0, -INLINE_OTHER_SUFFIX.length)
    : questionId;
}

export function getQuestionById(questionId: string) {
  const normalizedId = normalizeQuestionId(questionId);
  return surveyQuestions.find((question) => question.id === normalizedId);
}

export function getQuestionLabel(questionId: string) {
  const question = getQuestionById(questionId);

  if (!question) {
    return questionId;
  }

  if (isInlineOtherFieldId(questionId)) {
    return `${question.label} - Diger`;
  }

  return question.label;
}

export function questionHasInlineOther(question: SurveyQuestion) {
  return Boolean(question.options?.some((option) => option.value === "diger"));
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

export function isInlineOtherSelected(question: SurveyQuestion, answers: SurveyAnswers) {
  const value = answers[question.id];

  if (Array.isArray(value)) {
    return value.includes("diger");
  }

  return value === "diger";
}

export function getInlineOtherError(question: SurveyQuestion, answers: SurveyAnswers) {
  if (!questionHasInlineOther(question) || !isInlineOtherSelected(question, answers)) {
    return null;
  }

  const otherValue = answers[getInlineOtherFieldId(question.id)];
  const hasOtherValue = typeof otherValue === "string" && otherValue.trim().length > 0;

  if (!hasOtherValue) {
    return "Diger secenegi icin aciklama yazin.";
  }

  return null;
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

    const inlineOtherError = getInlineOtherError(question, answers);
    if (inlineOtherError) {
      errors[question.id] = inlineOtherError;
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
    } else if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        sanitized[question.id] = trimmed;
      }
    } else if (value !== undefined) {
      sanitized[question.id] = value;
    }

    if (questionHasInlineOther(question) && isInlineOtherSelected(question, answers)) {
      const inlineOtherValue = answers[getInlineOtherFieldId(question.id)];
      if (typeof inlineOtherValue === "string") {
        const trimmedOther = inlineOtherValue.trim();
        if (trimmedOther.length > 0) {
          sanitized[getInlineOtherFieldId(question.id)] = trimmedOther;
        }
      }
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
  if (!question || isInlineOtherFieldId(questionId)) {
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
  const visibleQuestionIds = surveyQuestions
    .filter((question) => isQuestionVisible(question, answers))
    .map((question) => question.id);

  for (const question of surveyQuestions) {
    if (isQuestionVisible(question, answers) && questionHasInlineOther(question)) {
      visibleQuestionIds.push(getInlineOtherFieldId(question.id));
    }
  }

  return visibleQuestionIds;
}

export function getSubmissionAnswerSections(answers: SurveyAnswers): AdminSubmissionAnswerSection[] {
  const sections: AdminSubmissionAnswerSection[] = [];

  for (const section of surveySections) {
    const items = surveyQuestions
      .filter((question) => question.sectionId === section.id)
      .flatMap((question) => {
        const value = answers[question.id];

        if (!hasValue(value)) {
          return [];
        }

        const otherFieldId = getInlineOtherFieldId(question.id);
        const otherValue = answers[otherFieldId];
        const otherNote = typeof otherValue === "string" && otherValue.trim().length > 0 ? otherValue.trim() : undefined;

        return [
          {
            questionId: question.id,
            label: question.label,
            value: getAnswerLabel(question.id, value),
            otherNote
          }
        ];
      });

    if (items.length === 0) {
      continue;
    }

    sections.push({
      id: section.id,
      title: section.title,
      description: section.description,
      items
    });
  }

  return sections;
}

export function getSurveyQuestions() {
  return surveyQuestions;
}

export function getStatusOptions() {
  return Object.keys(statusLabels) as SubmissionStatus[];
}



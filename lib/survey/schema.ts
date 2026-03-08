import { z } from "zod";

import { getAllVisibleQuestionIds, getInlineOtherError, getQuestionById, isInlineOtherFieldId, sanitizeAnswers } from "@/lib/survey/logic";
import type { SurveyAnswers } from "@/lib/survey/types";

export const surveySubmissionSchema = z.object({
  answers: z.record(z.string(), z.any()),
  summaryTags: z.array(z.string()).max(12),
  suggestedPackage: z.string().min(3).max(120),
  analytics: z
    .object({
      startedAt: z.string().optional(),
      submittedAt: z.string().optional()
    })
    .optional()
});

export function validateSubmissionAnswers(rawAnswers: SurveyAnswers) {
  const answers = sanitizeAnswers(rawAnswers);
  const visibleIds = getAllVisibleQuestionIds(answers);
  const fieldErrors: Record<string, string> = {};

  for (const questionId of visibleIds) {
    if (isInlineOtherFieldId(questionId)) {
      continue;
    }

    const question = getQuestionById(questionId);
    const value = answers[questionId];

    if (!question) {
      continue;
    }

    const isEmpty =
      value === undefined ||
      (typeof value === "string" && value.trim().length === 0) ||
      (Array.isArray(value) && value.length === 0);

    if (question.required && isEmpty) {
      fieldErrors[question.id] = "Bu alan zorunludur.";
      continue;
    }

    const inlineOtherError = getInlineOtherError(question, answers);
    if (inlineOtherError) {
      fieldErrors[question.id] = inlineOtherError;
      continue;
    }

    if (question.type === "email" && typeof value === "string") {
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (!isValidEmail) {
        fieldErrors[question.id] = "Gecerli bir e-posta girin.";
      }
    }
  }

  return {
    answers,
    fieldErrors
  };
}


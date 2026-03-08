export type SurveyPrimitive = string | number | boolean;
export type SurveyValue = SurveyPrimitive | SurveyPrimitive[] | undefined;
export type SurveyAnswers = Record<string, SurveyValue>;

export type SurveyQuestionType =
  | "text"
  | "textarea"
  | "email"
  | "tel"
  | "radio"
  | "select"
  | "multi-select";

export type SurveyOption = {
  value: string;
  label: string;
  hint?: string;
};

export type VisibilityRule = {
  field: string;
  equals?: string;
  notEquals?: string;
  includes?: string;
  isOneOf?: string[];
};

export type SurveySection = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
};

export type SurveyQuestion = {
  id: string;
  sectionId: string;
  label: string;
  description?: string;
  placeholder?: string;
  type: SurveyQuestionType;
  required?: boolean;
  options?: SurveyOption[];
  visibleWhen?: VisibilityRule[];
};

export type SubmissionStatus = "new" | "contacted" | "qualified" | "closed";

export type SurveySummary = {
  summaryTags: string[];
  suggestedPackage: string;
  narrative: string;
  complexityScore: number;
};

export type SurveySubmissionRecord = {
  id: string;
  created_at: string;
  status: SubmissionStatus;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  industry: string;
  warehouse_count: string;
  priority: string;
  launch_window: string;
  suggested_package: string;
  summary_tags: string[];
  answers: SurveyAnswers;
};

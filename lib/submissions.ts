import { randomUUID } from "node:crypto";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { deriveSurveySummary } from "@/lib/survey/logic";
import type { SubmissionStatus, SurveyAnswers, SurveySubmissionRecord } from "@/lib/survey/types";

const SURVEY_TABLE = "survey_submissions";

declare global {
  // eslint-disable-next-line no-var
  var __demoSurveyStore: SurveySubmissionRecord[] | undefined;
}

function createSeedSubmission(): SurveySubmissionRecord {
  const answers: SurveyAnswers = {
    companyName: "Ornek Depo Cozumleri",
    industry: "e-ticaret",
    warehouseCount: "2-3",
    skuRange: "1000-5000",
    userCount: "11-25",
    modules: ["stok", "lokasyon", "barkod", "raporlama"],
    trackingNeeds: ["miktar", "lot"],
    integrations: ["excel", "barcode_reader", "erp"],
    priority: "control",
    launchWindow: "1-3",
    contactName: "Operasyon Ekibi",
    contactEmail: "demo@example.com",
    contactPhone: "+90 555 000 00 00"
  };

  const summary = deriveSurveySummary(answers);

  return {
    id: randomUUID(),
    created_at: new Date().toISOString(),
    status: "new",
    company_name: String(answers.companyName),
    contact_name: String(answers.contactName),
    contact_email: String(answers.contactEmail),
    contact_phone: String(answers.contactPhone),
    industry: String(answers.industry),
    warehouse_count: String(answers.warehouseCount),
    priority: String(answers.priority),
    launch_window: String(answers.launchWindow),
    suggested_package: summary.suggestedPackage,
    summary_tags: summary.summaryTags,
    answers
  };
}

function getDemoStore() {
  if (!global.__demoSurveyStore) {
    global.__demoSurveyStore = [createSeedSubmission()];
  }

  return global.__demoSurveyStore;
}

function normalizeSubmissionRow(row: Record<string, unknown>): SurveySubmissionRecord {
  return {
    id: String(row.id),
    created_at: String(row.created_at),
    status: (row.status as SubmissionStatus) ?? "new",
    company_name: String(row.company_name ?? ""),
    contact_name: String(row.contact_name ?? ""),
    contact_email: String(row.contact_email ?? ""),
    contact_phone: String(row.contact_phone ?? ""),
    industry: String(row.industry ?? ""),
    warehouse_count: String(row.warehouse_count ?? ""),
    priority: String(row.priority ?? ""),
    launch_window: String(row.launch_window ?? ""),
    suggested_package: String(row.suggested_package ?? ""),
    summary_tags: Array.isArray(row.summary_tags) ? (row.summary_tags as string[]) : [],
    answers: (row.answers as SurveyAnswers) ?? {}
  };
}

export async function listSubmissions(filters?: { q?: string; status?: string }) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    const store = [...getDemoStore()].sort((left, right) => right.created_at.localeCompare(left.created_at));

    return store.filter((submission) => {
      const matchesStatus = !filters?.status || filters.status === "all" || submission.status === filters.status;
      const query = filters?.q?.trim().toLowerCase();
      const matchesQuery =
        !query ||
        submission.company_name.toLowerCase().includes(query) ||
        submission.contact_name.toLowerCase().includes(query) ||
        submission.contact_email.toLowerCase().includes(query);

      return matchesStatus && matchesQuery;
    });
  }

  let query = supabase
    .from(SURVEY_TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters?.q && filters.q.trim().length > 0) {
    query = query.or(
      `company_name.ilike.%${filters.q.trim()}%,contact_name.ilike.%${filters.q.trim()}%,contact_email.ilike.%${filters.q.trim()}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => normalizeSubmissionRow(row as Record<string, unknown>));
}

export async function getSubmissionById(id: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return getDemoStore().find((submission) => submission.id === id) ?? null;
  }

  const { data, error } = await supabase.from(SURVEY_TABLE).select("*").eq("id", id).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? normalizeSubmissionRow(data as Record<string, unknown>) : null;
}

export async function createSubmission(input: {
  answers: SurveyAnswers;
  summaryTags: string[];
  suggestedPackage: string;
}) {
  const record: SurveySubmissionRecord = {
    id: randomUUID(),
    created_at: new Date().toISOString(),
    status: "new",
    company_name: String(input.answers.companyName ?? ""),
    contact_name: String(input.answers.contactName ?? ""),
    contact_email: String(input.answers.contactEmail ?? ""),
    contact_phone: String(input.answers.contactPhone ?? ""),
    industry: String(input.answers.industry ?? ""),
    warehouse_count: String(input.answers.warehouseCount ?? ""),
    priority: String(input.answers.priority ?? ""),
    launch_window: String(input.answers.launchWindow ?? ""),
    suggested_package: input.suggestedPackage,
    summary_tags: input.summaryTags,
    answers: input.answers
  };

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    getDemoStore().unshift(record);
    return record;
  }

  const { data, error } = await supabase
    .from(SURVEY_TABLE)
    .insert({
      company_name: record.company_name,
      contact_name: record.contact_name,
      contact_email: record.contact_email,
      contact_phone: record.contact_phone,
      industry: record.industry,
      warehouse_count: record.warehouse_count,
      priority: record.priority,
      launch_window: record.launch_window,
      suggested_package: record.suggested_package,
      summary_tags: record.summary_tags,
      answers: record.answers,
      status: record.status
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return normalizeSubmissionRow(data as Record<string, unknown>);
}

export async function updateSubmissionStatus(id: string, status: SubmissionStatus) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    const store = getDemoStore();
    const target = store.find((submission) => submission.id === id);
    if (!target) {
      return null;
    }
    target.status = status;
    return target;
  }

  const { data, error } = await supabase
    .from(SURVEY_TABLE)
    .update({ status })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return normalizeSubmissionRow(data as Record<string, unknown>);
}

export async function getCurrentAdminUser() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
}

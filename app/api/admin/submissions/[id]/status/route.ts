import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateSubmissionStatus } from "@/lib/submissions";
import type { SubmissionStatus } from "@/lib/survey/types";

const statusSchema = z.object({
  status: z.enum(["new", "contacted", "qualified", "closed"])
});

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const parsed = statusSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Gecersiz durum degeri." }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "Yetkisiz erisim." }, { status: 401 });
      }
    }

    const { id } = await context.params;
    const updated = await updateSubmissionStatus(id, parsed.data.status as SubmissionStatus);

    if (!updated) {
      return NextResponse.json({ error: "Kayit bulunamadi." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sunucu hatasi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

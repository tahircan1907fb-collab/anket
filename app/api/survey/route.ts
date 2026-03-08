import { NextResponse } from "next/server";

import { createSubmission } from "@/lib/submissions";
import { validateSubmissionAnswers, surveySubmissionSchema } from "@/lib/survey/schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = surveySubmissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Gonderilen veri beklenen formatta degil." }, { status: 400 });
    }

    const validation = validateSubmissionAnswers(parsed.data.answers);

    if (Object.keys(validation.fieldErrors).length > 0) {
      return NextResponse.json(
        {
          error: "Bazı zorunlu alanlar eksik veya hatali.",
          fieldErrors: validation.fieldErrors
        },
        { status: 422 }
      );
    }

    const submission = await createSubmission({
      answers: validation.answers,
      summaryTags: parsed.data.summaryTags,
      suggestedPackage: parsed.data.suggestedPackage
    });

    return NextResponse.json({ id: submission.id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sunucu hatasi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

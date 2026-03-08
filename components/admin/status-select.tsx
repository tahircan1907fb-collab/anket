"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { SubmissionStatus } from "@/lib/survey/types";

type SubmissionStatusSelectProps = {
  id: string;
  value: SubmissionStatus;
};

const options: Array<{ value: SubmissionStatus; label: string }> = [
  { value: "new", label: "Yeni" },
  { value: "contacted", label: "Iletisim kuruldu" },
  { value: "qualified", label: "Nitelikli" },
  { value: "closed", label: "Kapandi" }
];

export function SubmissionStatusSelect({ id, value }: SubmissionStatusSelectProps) {
  const router = useRouter();
  const [currentValue, setCurrentValue] = useState<SubmissionStatus>(value);
  const [isPending, startTransition] = useTransition();

  return (
    <select
      className="status-select"
      disabled={isPending}
      value={currentValue}
      onChange={(event) => {
        const nextValue = event.target.value as SubmissionStatus;
        setCurrentValue(nextValue);

        startTransition(async () => {
          await fetch(`/api/admin/submissions/${id}/status`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ status: nextValue })
          });

          router.refresh();
        });
      }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

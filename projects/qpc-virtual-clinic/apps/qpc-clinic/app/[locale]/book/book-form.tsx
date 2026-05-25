"use client";

import type { ClinicalLanguage } from "@core/capabilities/types";
import { useState } from "react";

type Slot = {
  slotId: string;
  startsAt: string;
  endsAt: string;
};

type Labels = {
  submit: string;
  success: string;
};

export function BookForm({
  locale,
  providerId,
  slots,
  labels,
}: {
  locale: ClinicalLanguage;
  providerId: string;
  slots: Slot[];
  labels: Labels;
}) {
  const [done, setDone] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDone(true);
  }

  if (done) {
    return <p role="status">{labels.success}</p>;
  }

  const first = slots[0];

  return (
    <form className="book-form" onSubmit={onSubmit}>
      <input type="hidden" name="patientId" value="patient-anon" />
      <label>
        Time slot
        <select name="slotId" defaultValue={first?.slotId} required>
          {slots.map((s) => (
            <option key={s.slotId} value={s.slotId}>
              {providerId} — {new Date(s.startsAt).toLocaleString(locale)}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className="btn-primary">
        {labels.submit}
      </button>
    </form>
  );
}

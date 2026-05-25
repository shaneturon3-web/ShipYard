import type { ClinicalLanguage } from "@core/capabilities/types";
import { getSchedulingCapability } from "./registry";

export async function listClinicAvailability(providerId = "default-provider") {
  const scheduling = getSchedulingCapability();
  const now = new Date();
  const later = new Date(now.getTime() + 14 * 24 * 3_600_000);
  return scheduling.getAvailability(
    providerId,
    now.toISOString(),
    later.toISOString()
  );
}

export async function requestAppointment(input: {
  patientId: string;
  dateTime: string;
  durationMinutes: number;
  type: string;
}) {
  const scheduling = getSchedulingCapability();
  return scheduling.createAppointment({
    patientId: input.patientId,
    dateTime: input.dateTime,
    durationMinutes: input.durationMinutes,
    type: input.type,
  });
}

export type { ClinicalLanguage };

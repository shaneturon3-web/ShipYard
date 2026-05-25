/** Machine — immutable capability payloads (compiler-enforced). */

export type ClinicalLanguage = "en" | "fr" | "es";

export interface PatientMetadata {
  id: string;
  preferredLanguage: ClinicalLanguage;
  specialtyFocus: string;
}

export interface AppointmentPayload {
  patientId: string;
  dateTime: string;
  durationMinutes: number;
  type: string;
}

export interface InvoicePayload {
  appointmentId: string;
  amountCents: number;
  currency: "CAD";
  description: string;
}

export interface AvailabilityResult {
  providerId: string;
  availableSlots: Array<{
    slotId: string;
    startsAt: string;
    endsAt: string;
  }>;
}

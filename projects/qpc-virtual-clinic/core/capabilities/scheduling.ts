/**
 * Clinical scheduling capability — vendor-agnostic contract.
 * Implementations live only under /adapters/ (e.g. scheduling-jane.ts).
 */

export type ClinicalLocale = "en" | "fr" | "es";

export interface AvailabilitySlot {
  slotId: string;
  clinicianId: string;
  startsAt: string;
  endsAt: string;
  modality: "in_person" | "telehealth";
}

export interface ListAvailabilityInput {
  clinicianId?: string;
  specialtyCode?: string;
  locale: ClinicalLocale;
  from: string;
  to: string;
}

export interface CreateAppointmentInput {
  patientId: string;
  clinicianId: string;
  slotId: string;
  locale: ClinicalLocale;
  notes?: string;
}

export interface ClinicalAppointment {
  appointmentId: string;
  patientId: string;
  clinicianId: string;
  startsAt: string;
  endsAt: string;
  status: "requested" | "confirmed" | "cancelled";
  schedulingReference?: string;
}

export interface SchedulingProvider {
  readonly providerId: string;
  listAvailability(input: ListAvailabilityInput): Promise<AvailabilitySlot[]>;
  createAppointment(input: CreateAppointmentInput): Promise<ClinicalAppointment>;
  cancelAppointment(appointmentId: string, locale: ClinicalLocale): Promise<void>;
}

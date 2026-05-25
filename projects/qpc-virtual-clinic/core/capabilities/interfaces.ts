/** Machine — vendor-agnostic capability contracts. Implementations only in /adapters/. */

import type {
  AppointmentPayload,
  AvailabilityResult,
  InvoicePayload,
  PatientMetadata,
  ClinicalLanguage,
} from "./types";

export interface SchedulingCapability {
  getAvailability(
    providerId: string,
    rangeStart: string,
    rangeEnd: string
  ): Promise<AvailabilityResult>;
  createAppointment(
    payload: AppointmentPayload
  ): Promise<{ appointmentId: string; joinUrl: string }>;
  cancelAppointment(appointmentId: string): Promise<boolean>;
}

export interface BillingCapability {
  createInvoice(
    payload: InvoicePayload
  ): Promise<{ invoiceId: string; paymentUrl: string }>;
  verifyPaymentStatus(invoiceId: string): Promise<boolean>;
}

export interface TriageCapability {
  evaluateIntake(rawText: string, lang: ClinicalLanguage): Promise<PatientMetadata>;
}

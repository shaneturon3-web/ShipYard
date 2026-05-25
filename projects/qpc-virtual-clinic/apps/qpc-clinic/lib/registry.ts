/**
 * Machine — composition root. Sole importer of /adapters/ in the app layer.
 */

import type {
  BillingCapability,
  MessagingProvider,
  SchedulingCapability,
  SchedulingProvider,
  TriageCapability,
} from "@core/capabilities";

import {
  createJaneSchedulingAdapter,
  createRulesTriageAdapter,
  createStripeBillingAdapter,
  createTwilioMessagingProvider,
  createTwilioMessagingStub,
} from "../../../adapters";

import type { AppointmentPayload } from "@core/capabilities/types";

let scheduling: SchedulingCapability | null = null;
let billing: BillingCapability | null = null;
let triage: TriageCapability | null = null;
let messaging: MessagingProvider | null = null;

export function getSchedulingCapability(): SchedulingCapability {
  if (!scheduling) scheduling = createJaneSchedulingAdapter();
  return scheduling;
}

export function getBillingCapability(): BillingCapability {
  if (!billing) billing = createStripeBillingAdapter();
  return billing;
}

export function getTriageCapability(): TriageCapability {
  if (!triage) triage = createRulesTriageAdapter();
  return triage;
}

export function getMessagingProvider(): MessagingProvider {
  if (!messaging) {
    messaging =
      process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
        ? createTwilioMessagingProvider()
        : createTwilioMessagingStub();
  }
  return messaging;
}

/** Bridge legacy SchedulingProvider consumers → SchedulingCapability. */
export function getSchedulingProvider(): SchedulingProvider {
  const cap = getSchedulingCapability();
  return {
    providerId: "jane",
    async listAvailability(input) {
      const result = await cap.getAvailability(
        input.clinicianId ?? "default-provider",
        input.from,
        input.to
      );
      return result.availableSlots.map((s) => ({
        slotId: s.slotId,
        clinicianId: result.providerId,
        startsAt: s.startsAt,
        endsAt: s.endsAt,
        modality: "telehealth" as const,
      }));
    },
    async createAppointment(input) {
      const payload: AppointmentPayload = {
        patientId: input.patientId,
        dateTime: new Date().toISOString(),
        durationMinutes: 50,
        type: input.notes ?? "initial",
      };
      const created = await cap.createAppointment(payload);
      return {
        appointmentId: created.appointmentId,
        patientId: input.patientId,
        clinicianId: input.clinicianId,
        startsAt: payload.dateTime,
        endsAt: payload.dateTime,
        status: "requested" as const,
        schedulingReference: created.joinUrl,
      };
    },
    async cancelAppointment(appointmentId) {
      await cap.cancelAppointment(appointmentId);
    },
  };
}

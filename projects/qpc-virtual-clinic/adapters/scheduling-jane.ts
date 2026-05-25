/**
 * Machine — Jane App disposable adapter. API surface only here.
 * Target: https://api.janeapp.com/v1/ (and v3 paths when configured)
 */

import type { SchedulingCapability } from "../core/capabilities/interfaces";
import type { AppointmentPayload, AvailabilityResult } from "../core/capabilities/types";

const JANE_V1 = "https://api.janeapp.com/v1";
const JANE_V3_AVAILABILITY = "/api/v3/appointments/available_times";
const JANE_V3_CREATE = "/api/v3/appointments";

export class JaneSchedulingAdapter implements SchedulingCapability {
  async getAvailability(
    providerId: string,
    rangeStart: string,
    rangeEnd: string
  ): Promise<AvailabilityResult> {
    const key = process.env.JANE_API_KEY;
    const base = process.env.JANE_API_BASE ?? "https://api.janeapp.com";

    if (key) {
      try {
        const params = new URLSearchParams({
          start_at: rangeStart,
          end_at: rangeEnd,
          staff_member_id: providerId,
        });
        const res = await fetch(`${base}${JANE_V3_AVAILABILITY}?${params}`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${key}`,
          },
        });
        if (res.ok) {
          const data = (await res.json()) as {
            available_times?: Array<Record<string, unknown>>;
          };
          const availableSlots = (data.available_times ?? []).map((raw) => ({
            slotId: String(raw.id ?? ""),
            startsAt: String(raw.start_at ?? ""),
            endsAt: String(raw.end_at ?? ""),
          }));
          return { providerId, availableSlots };
        }
      } catch {
        /* fall through to stub */
      }
    }

    return {
      providerId,
      availableSlots: [
        {
          slotId: "jane-stub-1",
          startsAt: rangeStart,
          endsAt: rangeEnd,
        },
      ],
    };
  }

  async createAppointment(
    payload: AppointmentPayload
  ): Promise<{ appointmentId: string; joinUrl: string }> {
    const key = process.env.JANE_API_KEY;
    const base = process.env.JANE_API_BASE ?? JANE_V1;

    if (key) {
      try {
        const res = await fetch(`${base}${JANE_V3_CREATE}`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            patient_id: payload.patientId,
            start_at: payload.dateTime,
            duration: payload.durationMinutes,
            treatment_name: payload.type,
          }),
        });
        if (res.ok) {
          const raw = (await res.json()) as { id?: string; join_url?: string };
          return {
            appointmentId: String(raw.id ?? `JANE_${Date.now()}`),
            joinUrl:
              String(raw.join_url ?? "") ||
              "https://zoom.us/j/session-pending",
          };
        }
      } catch {
        /* stub */
      }
    }

    return {
      appointmentId: `JANE_${Date.now()}`,
      joinUrl: "https://zoom.us/mock-session-id",
    };
  }

  async cancelAppointment(appointmentId: string): Promise<boolean> {
    const key = process.env.JANE_API_KEY;
    const base = process.env.JANE_API_BASE ?? "https://api.janeapp.com";
    if (!key) return true;

    try {
      const res = await fetch(
        `${base}/api/v3/appointments/${appointmentId}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: "{}",
        }
      );
      return res.ok;
    } catch {
      return false;
    }
  }
}

export function createJaneSchedulingAdapter(): SchedulingCapability {
  return new JaneSchedulingAdapter();
}

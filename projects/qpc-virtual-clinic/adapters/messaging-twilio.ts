/**
 * Twilio adapter — SMS + WhatsApp disposable messaging engine.
 * Twilio REST mapping here only. No twilio npm package outside /adapters/.
 */

import type {
  MessagingProvider,
  OutboundMessageInput,
  OutboundMessageResult,
} from "../core/capabilities/messaging";

const TWILIO_API = "https://api.twilio.com/2010-04-01";

function twilioAuth(): string {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) throw new Error("TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN not configured");
  return Buffer.from(`${sid}:${token}`).toString("base64");
}

function fromAddress(channel: OutboundMessageInput["channel"]): string {
  if (channel === "whatsapp") {
    return process.env.TWILIO_WHATSAPP_FROM ?? "whatsapp:+10000000000";
  }
  return process.env.TWILIO_SMS_FROM ?? "+10000000000";
}

function formatTo(channel: OutboundMessageInput["channel"], to: string): string {
  if (channel === "whatsapp" && !to.startsWith("whatsapp:")) {
    return `whatsapp:${to}`;
  }
  return to;
}

/** Template bodies keyed for EN/FR/ES — clinical, no AI references. */
const TEMPLATE_BODIES: Record<string, Record<"en" | "fr" | "es", string>> = {
  appointment_reminder: {
    en: "Reminder: your appointment at Quebec Psychology Clinic is coming up. Reply if you need to reschedule.",
    fr: "Rappel : votre rendez-vous à la Clinique de psychologie du Québec approche. Répondez pour reporter.",
    es: "Recordatorio: su cita en la Clínica de Psicología de Quebec se acerca. Responda para reprogramar.",
  },
  intake_continue: {
    en: "You can continue your intake here when ready. We are here to help.",
    fr: "Vous pouvez poursuivre votre admission ici quand vous êtes prêt(e). Nous sommes là pour vous.",
    es: "Puede continuar su admisión aquí cuando esté listo/a. Estamos aquí para ayudarle.",
  },
};

function resolveBody(input: OutboundMessageInput): string {
  const pack = TEMPLATE_BODIES[input.templateKey];
  if (!pack) return input.templateKey;
  let text = pack[input.locale] ?? pack.en;
  if (input.variables) {
    for (const [k, v] of Object.entries(input.variables)) {
      text = text.replace(`{{${k}}}`, v);
    }
  }
  return text;
}

export function createTwilioMessagingProvider(): MessagingProvider {
  const sid = process.env.TWILIO_ACCOUNT_SID!;

  return {
    providerId: "twilio",

    async sendMessage(input: OutboundMessageInput): Promise<OutboundMessageResult> {
      const body = encodeForm({
        To: formatTo(input.channel, input.to),
        From: fromAddress(input.channel),
        Body: resolveBody(input),
      });
      const res = await fetch(`${TWILIO_API}/Accounts/${sid}/Messages.json`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${twilioAuth()}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      });
      if (!res.ok) {
        return { messageId: "", status: "failed" };
      }
      const raw = (await res.json()) as { sid?: string; status?: string };
      return {
        messageId: raw.sid ?? "",
        status: raw.status === "queued" || raw.status === "sent" ? "sent" : "queued",
      };
    },
  };
}

function encodeForm(data: Record<string, string>): string {
  return new URLSearchParams(data).toString();
}

export function createTwilioMessagingStub(): MessagingProvider {
  return {
    providerId: "twilio-stub",
    async sendMessage(input: OutboundMessageInput): Promise<OutboundMessageResult> {
      return { messageId: `SM_stub_${Date.now()}`, status: "queued" };
    },
  };
}

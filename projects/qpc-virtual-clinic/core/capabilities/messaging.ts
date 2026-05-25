/**
 * Clinical messaging capability — SMS / WhatsApp — vendor-agnostic contract.
 */

import type { ClinicalLocale } from "./scheduling";

export type MessageChannel = "sms" | "whatsapp";

export interface OutboundMessageInput {
  to: string;
  channel: MessageChannel;
  templateKey: string;
  locale: ClinicalLocale;
  variables?: Record<string, string>;
}

export interface OutboundMessageResult {
  messageId: string;
  status: "queued" | "sent" | "failed";
}

export interface MessagingProvider {
  readonly providerId: string;
  sendMessage(input: OutboundMessageInput): Promise<OutboundMessageResult>;
}

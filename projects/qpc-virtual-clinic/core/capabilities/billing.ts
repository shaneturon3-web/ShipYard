/**
 * Clinical billing capability — vendor-agnostic contract.
 */

import type { ClinicalLocale } from "./scheduling";

export interface PaymentIntentInput {
  patientId: string;
  amountCents: number;
  currency: "CAD";
  locale: ClinicalLocale;
  description: string;
}

export interface PaymentIntentResult {
  intentId: string;
  clientSecret?: string;
  status: "requires_payment_method" | "succeeded" | "failed";
}

export interface BillingProvider {
  readonly providerId: string;
  createPaymentIntent(input: PaymentIntentInput): Promise<PaymentIntentResult>;
  refundPayment(intentId: string, locale: ClinicalLocale): Promise<void>;
}

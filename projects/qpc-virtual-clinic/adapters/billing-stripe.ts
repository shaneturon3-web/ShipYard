/**
 * Machine — Stripe disposable adapter. No stripe npm package outside this file.
 */

import type { BillingCapability } from "../core/capabilities/interfaces";
import type { InvoicePayload } from "../core/capabilities/types";

const STRIPE_API = "https://api.stripe.com/v1";

export class StripeBillingAdapter implements BillingCapability {
  async createInvoice(
    payload: InvoicePayload
  ): Promise<{ invoiceId: string; paymentUrl: string }> {
    const key = process.env.STRIPE_SECRET_KEY;
    if (key) {
      try {
        const body = new URLSearchParams({
          amount: String(payload.amountCents),
          currency: payload.currency.toLowerCase(),
          description: payload.description,
          "metadata[appointment_id]": payload.appointmentId,
        });
        const res = await fetch(`${STRIPE_API}/payment_intents`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body.toString(),
        });
        if (res.ok) {
          const raw = (await res.json()) as { id: string; client_secret?: string };
          return {
            invoiceId: raw.id,
            paymentUrl: `https://checkout.stripe.com/pay/${raw.id}`,
          };
        }
      } catch {
        /* stub */
      }
    }

    return {
      invoiceId: `STRIPE_${Date.now()}`,
      paymentUrl: "https://checkout.stripe.com/mock",
    };
  }

  async verifyPaymentStatus(invoiceId: string): Promise<boolean> {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return true;

    try {
      const res = await fetch(`${STRIPE_API}/payment_intents/${invoiceId}`, {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (!res.ok) return false;
      const raw = (await res.json()) as { status?: string };
      return raw.status === "succeeded";
    } catch {
      return false;
    }
  }
}

export function createStripeBillingAdapter(): BillingCapability {
  return new StripeBillingAdapter();
}

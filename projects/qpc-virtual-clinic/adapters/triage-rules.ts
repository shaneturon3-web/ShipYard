/**
 * Machine — Rule-based triage adapter (no LLM in public path). PsyNova may replace internally later.
 */

import type { TriageCapability } from "../core/capabilities/interfaces";
import type { ClinicalLanguage, PatientMetadata } from "../core/capabilities/types";

const SPECIALTY_HINTS: Record<string, string[]> = {
  anxiety: ["anxiety", "anxiété", "ansiedad", "worry", "inquiet"],
  trauma: ["trauma", "ptsd", "abus"],
  adhd: ["adhd", "tdah", "attention"],
  burnout: ["burnout", "épuisement", "agotamiento"],
};

export class RulesTriageAdapter implements TriageCapability {
  async evaluateIntake(
    rawText: string,
    lang: ClinicalLanguage
  ): Promise<PatientMetadata> {
    const lower = rawText.toLowerCase();
    let specialtyFocus = "general";

    for (const [code, hints] of Object.entries(SPECIALTY_HINTS)) {
      if (hints.some((h) => lower.includes(h))) {
        specialtyFocus = code;
        break;
      }
    }

    return {
      id: `patient_${Date.now()}`,
      preferredLanguage: lang,
      specialtyFocus,
    };
  }
}

export function createRulesTriageAdapter(): TriageCapability {
  return new RulesTriageAdapter();
}

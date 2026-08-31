/**
 * SafeSignal AI Classification Engine
 *
 * Two-pass SIF classification:
 * 1. Rule-based: Energy → Kill Threshold → Barrier decision tree
 * 2. AI-based: Gemini extracts fields and classifies independently
 * 3. Consensus: Both must agree. Disagreement → human review.
 *
 * If barrier state is UNKNOWN → generate a one-question coach prompt.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// ─── Types ─────────────────────────────────────────────────────────

export interface ExtractedFields {
  energyType: string | null;
  killThreshold: "Yes" | "No" | null;
  workerProximity: "Hands-on" | "Adjacent" | "Remote" | null;
  barrierRequired: string | null;
  barrierState: "PRESENT" | "ABSENT" | "UNKNOWN";
  iogpRule: string | null;
  anyoneHurt: "Yes" | "No" | null;
  evidenceQuotes: string[];
}

export interface ClassificationResult {
  classification: "PSIF" | "SIF" | "CAPACITY" | "ROUTINE";
  priority: number;
  fields: ExtractedFields;
  ruleVerdict: string;
  aiVerdict: string;
  finalVerdict: string;
  confidence: number;
  coachQuestion: string | null;
}

// ─── IOGP Life-Saving Rules mapping ───────────────────────────────

const IOGP_RULES: Record<string, string[]> = {
  "Work Authorisation": ["permit", "authorisation", "authorization", "work order", "no permit", "without permit"],
  "Energy Isolation":   ["isolation", "lockout", "lock out", "loto", "tag out", "tagout", "energized", "de-energize"],
  "Confined Space":     ["confined space", "enclosed space", "tank entry", "vessel entry"],
  "Working at Height":  ["height", "scaffold", "ladder", "platform", "fall", "harness", "railing"],
  "Hot Work":           ["hot work", "welding", "grinding", "cutting", "spark", "flame", "fire"],
  "Line of Fire":       ["line of fire", "suspended load", "crane", "lifting", "dropped object", "falling object"],
  "Driving":            ["driving", "vehicle", "transport", "speeding"],
  "Ground Disturbance": ["excavation", "digging", "trench", "ground disturbance"],
  "Lifting Operations": ["lifting", "crane", "hoist", "rigging", "sling", "load"],
};

// ─── Energy types that can kill ───────────────────────────────────

const LETHAL_ENERGIES = [
  "pressurised gas", "pressure", "high voltage", "electrical",
  "gravity", "falling", "chemical", "toxic", "h2s",
  "fire", "explosion", "radiation", "hydraulic",
  "steam", "thermal", "kinetic", "moving vehicle",
];

// ─── Rule-Based Classifier ───────────────────────────────────────

export function classifyByRules(fields: ExtractedFields): {
  classification: string;
  priority: number;
  verdict: string;
} {
  const { killThreshold, barrierState, anyoneHurt } = fields;

  // Decision tree from PPT:
  // Energy? | Hurt? | Barrier? | Verdict
  // Yes     | Yes   | Yes      | SIF
  // Yes     | Yes   | No       | PSIF (Priority 1)
  // Yes     | No    | No       | PSIF (Priority 1)
  // No      | Any   | Any      | ROUTINE
  // Any     | Any   | UNKNOWN  | ESCALATE (ask 1Q)
  // Yes     | No    | Yes      | CAPACITY (barrier held)

  if (barrierState === "UNKNOWN") {
    return {
      classification: "ESCALATE",
      priority: 2,
      verdict: "Barrier state unknown — escalate for one-question coach",
    };
  }

  if (killThreshold === "No") {
    return {
      classification: "ROUTINE",
      priority: 4,
      verdict: "Energy below kill threshold — routine observation",
    };
  }

  // Energy is lethal (killThreshold === "Yes")
  if (barrierState === "ABSENT") {
    return {
      classification: "PSIF",
      priority: 1,
      verdict: `Lethal energy present, barrier ABSENT — PSIF. ${anyoneHurt === "Yes" ? "Injury occurred." : "No injury but credible fatal outcome."}`,
    };
  }

  if (barrierState === "PRESENT" && anyoneHurt === "Yes") {
    return {
      classification: "SIF",
      priority: 1,
      verdict: "Lethal energy present, barrier present but injury occurred — SIF",
    };
  }

  if (barrierState === "PRESENT" && anyoneHurt !== "Yes") {
    return {
      classification: "CAPACITY",
      priority: 3,
      verdict: "Lethal energy present, barrier held, no injury — capacity event (barrier working)",
    };
  }

  // Default fallback
  return {
    classification: "CAPACITY",
    priority: 3,
    verdict: "Could not determine full context — classified as capacity",
  };
}

// ─── IOGP Rule Matcher ──────────────────────────────────────────

export function matchIOGPRule(text: string): string | null {
  const lower = text.toLowerCase();
  for (const [rule, keywords] of Object.entries(IOGP_RULES)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return rule;
    }
  }
  return null;
}

// ─── Check if energy can kill ────────────────────────────────────

export function isLethalEnergy(energyType: string | null): boolean {
  if (!energyType) return false;
  return LETHAL_ENERGIES.some((e) => energyType.toLowerCase().includes(e));
}

// ─── AI Field Extraction via Gemini ─────────────────────────────

export async function extractFieldsWithAI(
  rawText: string
): Promise<ExtractedFields> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const prompt = `You are an industrial safety analyst for Oil India Limited. Analyze this safety report and extract structured fields.

SAFETY REPORT:
"${rawText}"

Extract these fields as JSON (no markdown, just raw JSON):
{
  "energyType": "Type of hazardous energy (e.g., Pressurised gas, Electrical, Gravity, Chemical, Thermal, Kinetic) or null",
  "killThreshold": "Yes if this energy type could credibly kill someone, No otherwise",
  "workerProximity": "Hands-on if worker was directly handling/touching, Adjacent if nearby, Remote if far away",
  "barrierRequired": "The safety barrier that should have been in place (e.g., Work permit, Energy isolation, Fall protection) or null",
  "barrierState": "PRESENT if the barrier was in place and working, ABSENT if the barrier was missing or failed, UNKNOWN if the report doesn't mention it",
  "iogpRule": "Which IOGP Life-Saving Rule applies (Work Authorisation, Energy Isolation, Confined Space, Working at Height, Hot Work, Line of Fire, Driving, Ground Disturbance, Lifting Operations) or null",
  "anyoneHurt": "Yes if someone was injured, No otherwise",
  "evidenceQuotes": ["exact phrases from the report that support each field"]
}

Rules:
- Barrier state must be THREE-VALUED: PRESENT, ABSENT, or UNKNOWN. Absence of mention is NEVER absence of proof — use UNKNOWN.
- If the report says "no permit", "without permit", "no harness" etc., barrier is ABSENT.
- Be conservative: when in doubt, use UNKNOWN.
- Support English, Hindi, Assamese, and code-mixed text.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse JSON from response (handle markdown code blocks)
    const jsonStr = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(jsonStr);

    return {
      energyType: parsed.energyType || null,
      killThreshold: parsed.killThreshold === "Yes" ? "Yes" : parsed.killThreshold === "No" ? "No" : null,
      workerProximity: parsed.workerProximity || null,
      barrierRequired: parsed.barrierRequired || null,
      barrierState: ["PRESENT", "ABSENT", "UNKNOWN"].includes(parsed.barrierState)
        ? parsed.barrierState
        : "UNKNOWN",
      iogpRule: parsed.iogpRule || null,
      anyoneHurt: parsed.anyoneHurt === "Yes" ? "Yes" : "No",
      evidenceQuotes: Array.isArray(parsed.evidenceQuotes) ? parsed.evidenceQuotes : [],
    };
  } catch (error) {
    console.error("AI extraction failed, using fallback:", error);
    return fallbackExtraction(rawText);
  }
}

// ─── Fallback extraction (no AI) ────────────────────────────────

function fallbackExtraction(rawText: string): ExtractedFields {
  const lower = rawText.toLowerCase();

  // Simple keyword-based extraction
  let energyType: string | null = null;
  if (lower.includes("gas") || lower.includes("pressure")) energyType = "Pressurised gas";
  else if (lower.includes("electric") || lower.includes("voltage")) energyType = "Electrical";
  else if (lower.includes("fall") || lower.includes("height") || lower.includes("drop")) energyType = "Gravity";
  else if (lower.includes("fire") || lower.includes("hot work") || lower.includes("weld")) energyType = "Fire/Thermal";
  else if (lower.includes("vehicle") || lower.includes("driv")) energyType = "Kinetic (vehicle)";
  else if (lower.includes("chemical") || lower.includes("spill")) energyType = "Chemical";

  const killThreshold = isLethalEnergy(energyType) ? "Yes" as const : "No" as const;

  // Barrier detection
  let barrierState: "PRESENT" | "ABSENT" | "UNKNOWN" = "UNKNOWN";
  if (lower.includes("no permit") || lower.includes("without permit") ||
      lower.includes("no harness") || lower.includes("no guard") ||
      lower.includes("missing") || lower.includes("absent") ||
      lower.includes("not locked") || lower.includes("not isolated")) {
    barrierState = "ABSENT";
  } else if (lower.includes("permit taken") || lower.includes("locked out") ||
             lower.includes("barricaded") || lower.includes("harness on") ||
             lower.includes("barrier in place")) {
    barrierState = "PRESENT";
  }

  const iogpRule = matchIOGPRule(rawText);
  const barrierRequired = iogpRule ? `${iogpRule} controls` : null;

  const proximityKeywords = ["changed", "handled", "touched", "operated", "opened", "closed", "lifted", "carried"];
  const workerProximity = proximityKeywords.some((kw) => lower.includes(kw))
    ? "Hands-on" as const
    : "Adjacent" as const;

  const anyoneHurt = (lower.includes("injur") || lower.includes("hurt") || lower.includes("hospital"))
    ? "Yes" as const
    : "No" as const;

  return {
    energyType,
    killThreshold,
    workerProximity,
    barrierRequired,
    barrierState,
    iogpRule,
    anyoneHurt,
    evidenceQuotes: [],
  };
}

// ─── Generate Coach Question ────────────────────────────────────

export async function generateCoachQuestion(
  rawText: string,
  fields: ExtractedFields
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const prompt = `You are a safety coach for Oil India Limited. A worker submitted this safety report:

"${rawText}"

We extracted these facts but the barrier state is UNKNOWN (we can't tell if the safety barrier was in place or not).

The barrier we need to know about: ${fields.barrierRequired || "the applicable safety control"}

Generate EXACTLY ONE short, clear, yes/no question to determine if the safety barrier was in place. 
- The question must be answerable with Yes, No, or "Don't know"
- Keep it under 15 words
- Use simple language a field worker would understand
- Do not explain why you're asking

Respond with ONLY the question, nothing else.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch {
    // Fallback question
    const barrier = fields.barrierRequired || "safety control";
    return `Was the ${barrier} in place before work started?`;
  }
}

// ─── Main Classification Pipeline ───────────────────────────────

export async function classifyReport(rawText: string): Promise<ClassificationResult> {
  // Step 1: Extract fields using AI (with fallback)
  const fields = await extractFieldsWithAI(rawText);

  // Step 2: Apply rule-based classification
  const ruleResult = classifyByRules(fields);

  // Step 3: Determine final classification
  let finalClassification = ruleResult.classification as ClassificationResult["classification"];
  let finalPriority = ruleResult.priority;
  let coachQuestion: string | null = null;

  // If barrier state is unknown, generate coach question
  if (ruleResult.classification === "ESCALATE") {
    coachQuestion = await generateCoachQuestion(rawText, fields);
    finalClassification = "CAPACITY"; // Temporary — will be reclassified after coach answer
    finalPriority = 2;
  }

  // Step 4: Build result
  return {
    classification: finalClassification,
    priority: finalPriority,
    fields,
    ruleVerdict: ruleResult.verdict,
    aiVerdict: `AI extracted: energy=${fields.energyType}, barrier=${fields.barrierState}, rule=${fields.iogpRule}`,
    finalVerdict:
      ruleResult.classification === "ESCALATE"
        ? "Barrier state unknown — one-question coach triggered"
        : `Rules and AI agreed: ${ruleResult.classification}`,
    confidence: fields.barrierState === "UNKNOWN" ? 0.5 : 0.9,
    coachQuestion,
  };
}

// ─── Reclassify after coach answer ──────────────────────────────

export function reclassifyWithCoachAnswer(
  fields: ExtractedFields,
  answer: "Yes" | "No" | "Unknown"
): { classification: string; priority: number; verdict: string } {
  const updatedFields = { ...fields };

  if (answer === "Yes") {
    updatedFields.barrierState = "PRESENT";
  } else if (answer === "No") {
    updatedFields.barrierState = "ABSENT";
  } else {
    // Still unknown — escalate to human review
    return {
      classification: "PSIF",
      priority: 1,
      verdict: "Worker unsure about barrier — fail-safe: escalate as PSIF for human review",
    };
  }

  return classifyByRules(updatedFields);
}

import type { AgentDecision, Policy, DriftResult } from "./types";

// Drift = the agent's actual action doesn't match the rules it was
// configured with. This is a plain rules check, deliberately simple and
// auditable - a merchant should be able to read this logic and trust it,
// not have to trust a black box.

export function checkDrift(
  decision: AgentDecision,
  policy: Policy
): DriftResult {
  const violations: string[] = [];

  if (decision.amount > policy.maxAmount) {
    violations.push(
      `Amount ₹${decision.amount} exceeds the configured max of ₹${policy.maxAmount}`
    );
  }

  const categoryAllowed = policy.allowedCategories.some(
    (c) => c.toLowerCase().trim() === decision.category
  );
  if (!categoryAllowed) {
    violations.push(
      `Category "${decision.category}" is not in the allowed list (${policy.allowedCategories.join(", ")})`
    );
  }

  return {
    driftDetected: violations.length > 0,
    violations,
  };
}

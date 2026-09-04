import type { AgentDecision, Policy, DriftResult, RiskResult, RiskLevel } from "./types";

// Risk scoring combines three signals into one explainable number:
// 1. how far the amount is from what's "normal" for this policy
// 2. how confident the agent itself was in the decision
// 3. whether a policy rule was actually broken (drift)
//
// This is a transparent weighted formula, not a black-box model - every
// point of the score can be traced back to a reason. That traceability is
// the whole point of the tool.

export function scoreRisk(
  decision: AgentDecision,
  policy: Policy,
  drift: DriftResult
): RiskResult {
  const factors: string[] = [];
  let score = 0;

  // Signal 1: amount as a fraction of the max allowed - the closer to or
  // over the limit, the riskier.
  const amountRatio = policy.maxAmount > 0 ? decision.amount / policy.maxAmount : 1;
  if (amountRatio > 1) {
    score += 40;
    factors.push("Amount exceeds the configured limit");
  } else if (amountRatio > 0.8) {
    score += 20;
    factors.push("Amount is close to the configured limit");
  }

  // Signal 2: low agent confidence is itself a risk signal - the agent is
  // telling us it isn't sure.
  if (decision.confidence < 0.5) {
    score += 25;
    factors.push(`Agent confidence is low (${Math.round(decision.confidence * 100)}%)`);
  } else if (decision.confidence < 0.75) {
    score += 10;
    factors.push(`Agent confidence is moderate (${Math.round(decision.confidence * 100)}%)`);
  }

  // Signal 3: any actual policy violation is weighted heavily.
  if (drift.driftDetected) {
    score += 35;
    factors.push("Policy violation detected (see drift check)");
  }

  // Signal 4: crossing the human-approval threshold on its own is a signal,
  // even if within the hard max.
  if (decision.amount > policy.requireApprovalAbove) {
    score += 15;
    factors.push(`Amount is above the human-approval threshold of ₹${policy.requireApprovalAbove}`);
  }

  score = Math.min(100, score);

  let level: RiskLevel = "low";
  if (score >= 60) level = "high";
  else if (score >= 30) level = "medium";

  if (factors.length === 0) {
    factors.push("No risk signals - decision matches expected pattern");
  }

  return { score, level, factors };
}

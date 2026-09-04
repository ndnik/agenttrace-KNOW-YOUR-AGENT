import { nanoid } from "nanoid";
import type { AgentRequest, AgentDecision, DriftResult, RiskResult, Receipt } from "./types";

// The receipt is the artifact a merchant hands over if a customer disputes
// a transaction ("I never authorized this"). It has to stand on its own -
// readable by a non-technical person - and explain what the agent did and why.

export function buildReceipt(
  request: AgentRequest,
  decision: AgentDecision,
  drift: DriftResult,
  risk: RiskResult
): Receipt {
  const requiresHumanApproval = decision.amount > request.policy.requireApprovalAbove;

  const driftLine = drift.driftDetected
    ? `This purchase broke policy rules: ${drift.violations.join("; ")}.`
    : "This purchase followed the configured policy.";

  const summary =
    `On this transaction, the agent was instructed to "${request.instruction}". ` +
    `It decided to purchase "${decision.itemsPurchased}" (category: ${decision.category}) ` +
    `for ₹${decision.amount}, stating: "${decision.reasoning}" ` +
    `Its own confidence in this decision was ${Math.round(decision.confidence * 100)}%. ` +
    `${driftLine} Risk was assessed as ${risk.level} (score ${risk.score}/100), ` +
    `based on: ${risk.factors.join("; ")}.` +
    (requiresHumanApproval
      ? " Because this amount is above the human-approval threshold, it should have been held for review."
      : "");

  return {
    id: nanoid(10),
    timestamp: new Date().toISOString(),
    request,
    decision,
    drift,
    risk,
    requiresHumanApproval,
    summary,
  };
}

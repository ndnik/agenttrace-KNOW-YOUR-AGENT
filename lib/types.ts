// Core data shapes for AgentTrace.
// A "Policy" is the rulebook a merchant/developer gives their AI purchasing agent.
// Every transaction the agent makes is checked against this policy.

export interface Policy {
  maxAmount: number; // upper limit per transaction, in INR
  allowedCategories: string[]; // e.g. ["groceries", "household"]
  requireApprovalAbove: number; // amount above which a human must sign off
}

// What we ask the simulated agent to do: a natural-language goal plus
// a small "situation" so the LLM has something concrete to decide against.
export interface AgentRequest {
  instruction: string; // e.g. "Order this week's groceries, budget conscious"
  situation: string; // free-text context: what's in the cart, what's on offer, etc.
  policy: Policy;
}

// The agent's raw decision, as returned by the LLM. This is NOT scripted -
// it comes back different depending on instruction/situation/policy each time.
export interface AgentDecision {
  itemsPurchased: string;
  category: string;
  amount: number;
  confidence: number; // 0-1, the agent's own stated confidence
  reasoning: string; // why the agent made this call, in its own words
}

export interface DriftResult {
  driftDetected: boolean;
  violations: string[]; // human-readable list of policy rules broken, if any
}

export type RiskLevel = "low" | "medium" | "high";

export interface RiskResult {
  score: number; // 0-100
  level: RiskLevel;
  factors: string[]; // human-readable contributing factors
}

export interface Receipt {
  id: string;
  timestamp: string;
  request: AgentRequest;
  decision: AgentDecision;
  drift: DriftResult;
  risk: RiskResult;
  requiresHumanApproval: boolean;
  summary: string; // one paragraph, plain-language explanation for disputes
}

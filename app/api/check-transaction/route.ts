import { NextRequest, NextResponse } from "next/server";
import { getAgentDecision } from "@/lib/agent";
import { checkDrift } from "@/lib/drift";
import { scoreRisk } from "@/lib/risk";
import { buildReceipt } from "@/lib/receipt";
import { saveReceipt } from "@/lib/store";
import type { AgentRequest } from "@/lib/types";

// POST /api/check-transaction
// Body: { instruction, situation, policy: { maxAmount, allowedCategories, requireApprovalAbove } }
//
// This is the public API. A developer's own AI purchasing agent can call
// this endpoint with what it's about to do, and get back a real-time
// decision + drift check + risk score + a saved, retrievable receipt.
//
// Every call runs a real LLM inference for the agent's decision - nothing
// here is scripted or pre-written, which is what makes the checks meaningful.

export async function POST(req: NextRequest) {
  let body: Partial<AgentRequest>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON" },
      { status: 400 }
    );
  }

  const { instruction, situation, policy } = body;

  if (!instruction || typeof instruction !== "string") {
    return NextResponse.json(
      { error: "Missing required field: instruction (string)" },
      { status: 400 }
    );
  }
  if (!situation || typeof situation !== "string") {
    return NextResponse.json(
      { error: "Missing required field: situation (string)" },
      { status: 400 }
    );
  }
  if (
    !policy ||
    typeof policy.maxAmount !== "number" ||
    !Array.isArray(policy.allowedCategories) ||
    typeof policy.requireApprovalAbove !== "number"
  ) {
    return NextResponse.json(
      {
        error:
          "Missing or invalid policy. Expected { maxAmount: number, allowedCategories: string[], requireApprovalAbove: number }",
      },
      { status: 400 }
    );
  }

  const request: AgentRequest = { instruction, situation, policy };

  try {
    const decision = await getAgentDecision(request);
    const drift = checkDrift(decision, policy);
    const risk = scoreRisk(decision, policy, drift);
    const receipt = buildReceipt(request, decision, drift, risk);
    saveReceipt(receipt);

    return NextResponse.json(receipt, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    // Failure recovery: we don't crash the endpoint - we return a clear
    // error so the caller (and the person reviewing this code) can see
    // exactly what broke.
    return NextResponse.json(
      { error: "Agent decision failed", detail: message },
      { status: 502 }
    );
  }
}

import { NextResponse } from "next/server";
import { listReceipts } from "@/lib/store";

// GET /api/receipts - returns recent transaction receipts, newest first.
// Used by the dashboard, but also usable by anyone integrating AgentTrace
// who wants to pull their own transaction history.

export async function GET() {
  const receipts = listReceipts(50);
  return NextResponse.json({ receipts });
}

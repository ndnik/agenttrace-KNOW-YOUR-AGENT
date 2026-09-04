import type { Receipt } from "./types";

// NOTE ON PERSISTENCE:
// This is an in-memory store. It works reliably for local dev and for a
// single warm serverless instance on Vercel, but is NOT durable - a cold
// start or redeploy clears it. That's an intentional, honest tradeoff for
// an MVP: it keeps the project free-tier and dependency-free to run.
//
// To make this durable for real production use, swap this file's
// implementation for a real database (e.g. Supabase/Postgres, or Vercel KV)
// behind the same three functions below - nothing else in the app needs to
// change, since every caller only ever imports from this file.

const receipts: Receipt[] = [];

export function saveReceipt(receipt: Receipt): void {
  receipts.unshift(receipt);
}

export function getReceipt(id: string): Receipt | undefined {
  return receipts.find((r) => r.id === id);
}

export function listReceipts(limit = 50): Receipt[] {
  return receipts.slice(0, limit);
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentTrace — a trust ledger for AI purchasing agents",
  description:
    "Real-time policy drift detection, risk scoring, and dispute-ready receipts for AI agents that make purchases on your behalf.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ colorScheme: "dark" }}>
      <body>{children}</body>
    </html>
  );
}

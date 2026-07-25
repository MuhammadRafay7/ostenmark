"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/Button";

/**
 * Opens the browser print dialog for the credentials sheet.
 *
 * Isolated into its own client component so the CV page itself can stay a server
 * component — `window.print()` is the only thing on that page that needs the
 * browser.
 */
export default function PrintButton() {
  return (
    <Button type="button" size="sm" onClick={() => window.print()}>
      <Printer size={14} aria-hidden />
      Print / Save as PDF
    </Button>
  );
}

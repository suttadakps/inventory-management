"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-9 items-center rounded-sm bg-primary-600 px-4 text-body-sm font-medium text-white hover:bg-primary-700 print:hidden"
    >
      Print / Save as PDF
    </button>
  );
}

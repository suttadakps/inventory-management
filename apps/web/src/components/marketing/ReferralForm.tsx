"use client";

import { useState, useTransition } from "react";
import { Send, CheckCircle2 } from "lucide-react";

import { submitPublicReferralAction } from "@/lib/referrals/actions";
import { useTranslation } from "@/lib/marketing/translations";

const inputCls =
  "h-12 w-full rounded-sm border border-border bg-white/5 px-4 text-body text-text-primary placeholder:text-text-disabled transition-colors duration-200 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/30";

export function ReferralForm() {
  const t = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [referrerName, setReferrerName] = useState("");
  const [referrerContact, setReferrerContact] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [prospectName, setProspectName] = useState("");
  const [budget, setBudget] = useState("");
  const [details, setDetails] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const submit = () => {
    if (!referrerName.trim()) return setError(t.referralForm.errorReferrerName);
    if (!projectTitle.trim()) return setError(t.referralForm.errorProjectTitle);
    setError(null);
    startTransition(async () => {
      const res = await submitPublicReferralAction({
        referrerName: referrerName.trim(),
        referrerContact: referrerContact.trim() || undefined,
        projectTitle: projectTitle.trim(),
        prospectName: prospectName.trim() || undefined,
        budget: budget ? Number(budget) : undefined,
        details: details.trim() || undefined,
        honeypot: honeypot.trim() || undefined,
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(res.error);
      }
    });
  };

  if (submitted) {
    return (
      <div className="rounded-md border border-border bg-surface p-10 text-center shadow-1">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="h-7 w-7" strokeWidth={1.75} />
        </div>
        <h3 className="mt-4 text-h1 font-bold text-text-primary">
          {t.referralForm.successTitle}
        </h3>
        <p className="mt-3 text-body text-text-secondary">
          {t.referralForm.successBody}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-surface p-6 shadow-1 sm:p-10">
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          value={referrerName}
          onChange={(e) => setReferrerName(e.target.value)}
          placeholder={t.referralForm.referrerName}
          className={inputCls}
        />
        <input
          value={referrerContact}
          onChange={(e) => setReferrerContact(e.target.value)}
          placeholder={t.referralForm.referrerContact}
          className={inputCls}
        />
        <input
          value={projectTitle}
          onChange={(e) => setProjectTitle(e.target.value)}
          placeholder={t.referralForm.projectTitle}
          className={inputCls}
        />
        <input
          value={prospectName}
          onChange={(e) => setProspectName(e.target.value)}
          placeholder={t.referralForm.prospectName}
          className={inputCls}
        />
        <input
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder={t.referralForm.budget}
          className={inputCls}
        />
        <input
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder={t.referralForm.details}
          className={inputCls}
        />
      </div>

      {/* Honeypot: hidden from real users via off-screen positioning, not display:none, so basic bots that skip hidden fields still fall for it. */}
      <input
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      {error && <p className="mt-3 text-body-sm text-danger">{error}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={isPending}
        className="mt-6 inline-flex h-12 items-center gap-2 rounded-sm bg-accent-600 px-8 text-body font-medium text-white shadow-1 transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-600/90 hover:shadow-2 disabled:pointer-events-none disabled:opacity-60"
      >
        {isPending ? t.referralForm.submitting : t.referralForm.submit}
        {!isPending && <Send className="h-4 w-4" strokeWidth={2} />}
      </button>
    </div>
  );
}

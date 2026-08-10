"use client";

import { FormEvent, useState } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

const CONTACT_SUBJECTS = [
  "General enquiry",
  "Request a quote",
  "Existing client support",
  "New site / onboarding",
  "Supplier / partnership",
  "Careers / join the team",
  "Feedback or complaint",
  "Other",
] as const;

type SiteContactFormProps = {
  source?: string;
  variant?: "cta" | "hero";
  messagePlaceholder?: string;
  referrerLabel?: string;
};

export function SiteContactForm({
  source = "homepage",
  variant = "cta",
  messagePlaceholder = "Tell us about your facilities and requirements...",
  referrerLabel,
}: SiteContactFormProps) {
  const [state, setState] = useState<FormState>("idle");
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setFeedback("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(formData.get("name") ?? ""),
          email: String(formData.get("email") ?? ""),
          phone: String(formData.get("phone") ?? ""),
          company: String(formData.get("company") ?? ""),
          subject: String(formData.get("subject") ?? ""),
          message: String(formData.get("message") ?? ""),
          referrer: referrerLabel,
          source,
        }),
      });

      const payload = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to send your enquiry.");
      }

      form.reset();
      setState("success");
      setFeedback(
        payload.message ??
          "Thank you. Our team will respond within one business day.",
      );
    } catch (error) {
      setState("error");
      setFeedback(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    }
  }

  const isHero = variant === "hero";

  return (
    <form
      className={isHero ? "m1-contact-form" : "sl-form m1-reveal"}
      onSubmit={handleSubmit}
    >
      <div className={isHero ? "m1-contact-form__row" : "sl-form__row"}>
        <label className={isHero ? "m1-contact-form__field" : "sl-field"}>
          <span>Full name</span>
          <input
            required
            type="text"
            name="name"
            placeholder="Your name"
            autoComplete="name"
          />
        </label>
        <label className={isHero ? "m1-contact-form__field" : "sl-field"}>
          <span>Organisation</span>
          <input type="text" name="company" placeholder="Organisation" />
        </label>
      </div>
      <div className={isHero ? "m1-contact-form__row" : "sl-form__row"}>
        <label className={isHero ? "m1-contact-form__field" : "sl-field"}>
          <span>Email</span>
          <input
            required
            type="email"
            name="email"
            placeholder="you@company.com"
            autoComplete="email"
          />
        </label>
        <label className={isHero ? "m1-contact-form__field" : "sl-field"}>
          <span>Phone</span>
          <input
            required
            type="tel"
            name="phone"
            placeholder="04xx xxx xxx"
            autoComplete="tel"
          />
        </label>
      </div>
      <div className={isHero ? "m1-contact-form__row" : "sl-form__row"}>
        <label className={isHero ? "m1-contact-form__field" : "sl-field"}>
          <span>Subject</span>
          <select name="subject" defaultValue="" required>
            <option value="" disabled>
              Select a subject
            </option>
            {CONTACT_SUBJECTS.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className={isHero ? "m1-contact-form__field" : "sl-field"}>
        <span>How can we help?</span>
        <textarea
          required
          name="message"
          rows={4}
          placeholder={messagePlaceholder}
        />
      </label>
      <button
        type="submit"
        disabled={state === "submitting"}
        className={
          isHero
            ? "m1-btn m1-btn--ink m1-btn--lg m1-contact-form__submit"
            : "sl-btn sl-btn--primary sl-btn--lg sl-form__submit"
        }
      >
        {state === "submitting" ? "Sending..." : "Submit enquiry"}
        {!isHero ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </button>
      <p
        className={
          isHero
            ? `m1-contact-form__note${
                state === "error" ? " m1-contact-form__note--error" : ""
              }`
            : `sl-form__note ${state === "error" ? "sl-form__note--error" : ""}`
        }
        role="status"
      >
        {feedback ||
          "Submit your enquiry and our team will respond within one business day."}
      </p>
    </form>
  );
}

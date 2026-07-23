"use client";

import { FormEvent, useState } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

type NewsletterSignupProps = {
  source?: string;
  className?: string;
};

export function NewsletterSignup({
  source = "footer",
  className = "",
}: NewsletterSignupProps) {
  const [state, setState] = useState<FormState>("idle");
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setFeedback("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(formData.get("email") ?? ""),
          source,
        }),
      });

      const payload = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to subscribe.");
      }

      form.reset();
      setState("success");
      setFeedback(payload.message ?? "You are subscribed.");
    } catch (error) {
      setState("error");
      setFeedback(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    }
  }

  return (
    <form
      className={`sl-newsletter ${className}`.trim()}
      onSubmit={handleSubmit}
      aria-label="Subscribe to updates"
    >
      <p className="sl-newsletter__label">Stay updated</p>
      <p className="sl-newsletter__text">
        News and updates about Servicelink facilities services.
      </p>
      <div className="sl-newsletter__row">
        <input
          required
          type="email"
          name="email"
          placeholder="you@company.com"
          autoComplete="email"
          className="sl-newsletter__input"
        />
        <button
          type="submit"
          disabled={state === "submitting"}
          className="sl-btn sl-btn--primary sl-newsletter__btn"
        >
          {state === "submitting" ? "..." : "Subscribe"}
        </button>
      </div>
      {feedback ? (
        <p
          role="status"
          className={`sl-newsletter__feedback ${
            state === "error" ? "sl-newsletter__feedback--error" : ""
          }`}
        >
          {feedback}
        </p>
      ) : null}
    </form>
  );
}

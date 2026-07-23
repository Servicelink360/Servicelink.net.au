"use client";

import { FormEvent, useState } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setMessage("");

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
          message: String(formData.get("message") ?? ""),
        }),
      });

      const payload = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to send your message.");
      }

      form.reset();
      setState("success");
      setMessage(payload.message ?? "Thank you. We will be in touch shortly.");
    } catch (error) {
      setState("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Name
          <input
            required
            name="name"
            type="text"
            autoComplete="name"
            className="rounded-md border border-slate-300 px-3 py-2 text-base text-slate-900"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Email
          <input
            required
            name="email"
            type="email"
            autoComplete="email"
            className="rounded-md border border-slate-300 px-3 py-2 text-base text-slate-900"
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Phone
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          className="rounded-md border border-slate-300 px-3 py-2 text-base text-slate-900"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Message
        <textarea
          required
          name="message"
          rows={5}
          className="rounded-md border border-slate-300 px-3 py-2 text-base text-slate-900"
        />
      </label>

      <button
        type="submit"
        disabled={state === "submitting"}
        className="inline-flex w-full items-center justify-center rounded-md bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70 md:w-auto"
      >
        {state === "submitting" ? "Sending..." : "Submit enquiry"}
      </button>

      {message ? (
        <p
          role="status"
          className={`text-sm ${
            state === "error" ? "text-red-700" : "text-emerald-700"
          }`}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}

"use client";

import { FormEvent, useState } from "react";
import { getAttribution } from "@/lib/attribution";

type FormState = "idle" | "submitting" | "success" | "error";

export function AtlasContactForm() {
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
          source: "atlas",
          ...getAttribution(),
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

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-[#e7e0d4] bg-[#f6f3ee] px-4 py-2.5 text-sm text-[#1c1917] outline-none transition focus:border-[#3f5c47] focus:ring-2 focus:ring-[#3f5c47]/15";

  return (
    <form className="flex flex-col justify-center space-y-4 p-8 md:p-10" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-[#57534e]">Name</label>
          <input required name="name" type="text" autoComplete="name" className={inputClass} />
        </div>
        <div>
          <label className="text-xs font-medium text-[#57534e]">Email</label>
          <input
            required
            name="email"
            type="email"
            autoComplete="email"
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-[#57534e]">Phone</label>
        <input name="phone" type="tel" autoComplete="tel" className={inputClass} />
      </div>
      <div>
        <label className="text-xs font-medium text-[#57534e]">Message</label>
        <textarea
          required
          name="message"
          rows={4}
          className={`${inputClass} resize-none`}
        />
      </div>
      <button
        type="submit"
        disabled={state === "submitting"}
        className="atlas-btn-primary w-full rounded-full py-3 text-sm font-semibold disabled:opacity-70"
      >
        {state === "submitting" ? "Sending..." : "Submit enquiry"}
      </button>
      {message ? (
        <p
          role="status"
          className={`text-sm ${state === "error" ? "text-red-700" : "text-[#3f5c47]"}`}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}

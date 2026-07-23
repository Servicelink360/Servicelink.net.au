"use client";

import { FormEvent, useState } from "react";

type ServiceOption = {
  slug: string;
  title: string;
};

type FormState = "idle" | "submitting" | "success" | "error";

type SiteQuoteFormProps = {
  services: ServiceOption[];
  defaultService?: string;
  defaultLocation?: string;
  locationPath?: string;
  source?: string;
};

export function SiteQuoteForm({
  services,
  defaultService = "",
  defaultLocation = "",
  locationPath = "",
  source = "quote-page",
}: SiteQuoteFormProps) {
  const [state, setState] = useState<FormState>("idle");
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setFeedback("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const serviceSlug = String(formData.get("service") ?? "");
    const serviceTitle =
      serviceSlug === "multiple"
        ? "Multiple services"
        : (services.find((item) => item.slug === serviceSlug)?.title ?? serviceSlug);

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(formData.get("name") ?? ""),
          email: String(formData.get("email") ?? ""),
          phone: String(formData.get("phone") ?? ""),
          company: String(formData.get("company") ?? ""),
          service: serviceTitle,
          location: String(formData.get("location") ?? ""),
          portfolioSize: String(formData.get("size") ?? ""),
          timeframe: String(formData.get("timeframe") ?? ""),
          message: String(formData.get("message") ?? ""),
          locationPage: locationPath || undefined,
          source,
        }),
      });

      const payload = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to send your quote request.");
      }

      form.reset();
      setState("success");
      setFeedback(
        payload.message ??
          "Thank you. Our team will be in touch with a tailored quote.",
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

  return (
    <form className="m1-contact-form" onSubmit={handleSubmit}>
      <div className="m1-contact-form__row">
        <label className="m1-contact-form__field">
          <span>Full name</span>
          <input
            required
            type="text"
            name="name"
            placeholder="Your name"
            autoComplete="name"
          />
        </label>
        <label className="m1-contact-form__field">
          <span>Organisation</span>
          <input type="text" name="company" placeholder="Organisation" />
        </label>
      </div>

      <div className="m1-contact-form__row">
        <label className="m1-contact-form__field">
          <span>Email</span>
          <input
            required
            type="email"
            name="email"
            placeholder="you@company.com"
            autoComplete="email"
          />
        </label>
        <label className="m1-contact-form__field">
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

      <div className="m1-contact-form__row">
        <label className="m1-contact-form__field">
          <span>Service</span>
          <select name="service" defaultValue={defaultService} required>
            <option value="" disabled>
              Select a service
            </option>
            {services.map((service) => (
              <option key={service.slug} value={service.slug}>
                {service.title}
              </option>
            ))}
            <option value="multiple">Multiple services</option>
          </select>
        </label>
        <label className="m1-contact-form__field">
          <span>Site location</span>
          <input
            required
            type="text"
            name="location"
            placeholder="Suburb or address"
            defaultValue={defaultLocation}
          />
        </label>
      </div>

      <div className="m1-contact-form__row">
        <label className="m1-contact-form__field">
          <span>Portfolio size</span>
          <select name="size" defaultValue="">
            <option value="">Select range</option>
            <option value="1 site">1 site</option>
            <option value="2-5 sites">2–5 sites</option>
            <option value="6-20 sites">6–20 sites</option>
            <option value="21-50 sites">21–50 sites</option>
            <option value="50+ sites">50+ sites</option>
          </select>
        </label>
        <label className="m1-contact-form__field">
          <span>When do you need to start?</span>
          <select name="timeframe" defaultValue="">
            <option value="">Select timeframe</option>
            <option value="ASAP">ASAP</option>
            <option value="Within 1 month">Within 1 month</option>
            <option value="1–3 months">1–3 months</option>
            <option value="3–6 months">3–6 months</option>
            <option value="Planning only">Planning only</option>
          </select>
        </label>
      </div>

      <label className="m1-contact-form__field">
        <span>Project details</span>
        <textarea
          required
          name="message"
          rows={4}
          placeholder="Tell us about your site, scope, and any specific requirements..."
        />
      </label>

      <button
        type="submit"
        disabled={state === "submitting"}
        className="m1-btn m1-btn--ink m1-btn--lg m1-contact-form__submit"
      >
        {state === "submitting" ? "Sending..." : "Request quote"}
      </button>
      <p
        className={`m1-contact-form__note${
          state === "error" ? " m1-contact-form__note--error" : ""
        }`}
        role="status"
      >
        {feedback ||
          "Submit your request and our team will follow up with a tailored quote."}
      </p>
    </form>
  );
}

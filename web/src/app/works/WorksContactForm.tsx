"use client";

import { FormEvent, useState } from "react";

export function WorksContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="works-card p-8 text-center">
        <p className="text-lg font-semibold text-[#0f172a]">Thanks for your interest!</p>
        <p className="mt-2 text-sm text-[#5b6472]">
          This is a demo form — no data has been sent.
        </p>
      </div>
    );
  }

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-[#e2e8f0] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#1a5cff] focus:ring-2 focus:ring-[#1a5cff]/15";

  return (
    <form className="works-card space-y-4 p-8" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-[#5b6472]">First name</label>
          <input required type="text" className={inputClass} />
        </div>
        <div>
          <label className="text-xs font-medium text-[#5b6472]">Last name</label>
          <input required type="text" className={inputClass} />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-[#5b6472]">Work email</label>
        <input required type="email" className={inputClass} />
      </div>
      <div>
        <label className="text-xs font-medium text-[#5b6472]">Organisation</label>
        <input required type="text" className={inputClass} />
      </div>
      <div>
        <label className="text-xs font-medium text-[#5b6472]">How can we help?</label>
        <textarea rows={4} className={`${inputClass} resize-none`} />
      </div>
      <button type="submit" className="works-btn-primary w-full justify-center py-3 text-sm">
        Book a demo →
      </button>
    </form>
  );
}

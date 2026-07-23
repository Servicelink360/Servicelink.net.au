"use client";

import { siteFaqs } from "@/lib/faq";

export function SiteFAQ() {
  return (
    <div className="m1-faq">
      {siteFaqs.map((item) => (
        <details key={item.question} className="m1-faq__item">
          <summary className="m1-faq__q">
            <span>{item.question}</span>
            <span className="m1-faq__icon" aria-hidden />
          </summary>
          <p className="m1-faq__a">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

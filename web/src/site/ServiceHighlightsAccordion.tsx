"use client";

import { useState } from "react";
import type { ServiceHighlight } from "@/lib/services";

type ServiceHighlightsAccordionProps = {
  items: ServiceHighlight[];
};

export function ServiceHighlightsAccordion({ items }: ServiceHighlightsAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(index: number) {
    setOpenIndex((current) => (current === index ? null : index));
  }

  return (
    <ul className="m1-service-highlights">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `service-highlight-panel-${index}`;

        return (
          <li
            key={item.title}
            className={`m1-service-highlight${isOpen ? " m1-service-highlight--open" : ""}`}
          >
            <button
              type="button"
              className="m1-service-highlight__trigger"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(index)}
            >
              <span className="m1-service-highlight__id">{String(index + 1).padStart(2, "0")}</span>
              <span className="m1-service-highlight__title">{item.title}</span>
              <span className="m1-service-highlight__chevron" aria-hidden>
                {isOpen ? "−" : "+"}
              </span>
            </button>
            <div
              id={panelId}
              className="m1-service-highlight__panel"
              hidden={!isOpen}
            >
              <p className="m1-service-highlight__detail">{item.detail}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

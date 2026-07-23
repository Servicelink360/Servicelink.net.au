"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ClientFeedbackItem } from "@/lib/client-feedback";

type ClientFeedbackCarouselProps = {
  items: ClientFeedbackItem[];
};

export function ClientFeedbackCarousel({ items }: ClientFeedbackCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateNav = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(max > 4 && el.scrollLeft < max - 4);
  }, []);

  useEffect(() => {
    updateNav();
    const el = scrollerRef.current;
    if (!el) return;

    const onResize = () => updateNav();
    window.addEventListener("resize", onResize);

    const observer = new ResizeObserver(updateNav);
    observer.observe(el);

    return () => {
      window.removeEventListener("resize", onResize);
      observer.disconnect();
    };
  }, [items, updateNav]);

  function scrollByCard(direction: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".m1-feedback__item");
    const styles = getComputedStyle(el);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || "0") || 0;
    const amount = card ? card.offsetWidth + gap : el.clientWidth * 0.8;
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  }

  const showNav = items.length > 1;

  return (
    <div className="m1-feedback-shell">
      {showNav ? (
        <div className="m1-feedback__nav" aria-label="Feedback navigation">
          <button
            type="button"
            className="m1-feedback__arrow"
            aria-label="Previous feedback"
            disabled={!canPrev}
            onClick={() => scrollByCard(-1)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path
                d="M12.5 4.5 7 10l5.5 5.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className="m1-feedback__arrow"
            aria-label="Next feedback"
            disabled={!canNext}
            onClick={() => scrollByCard(1)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path
                d="M7.5 4.5 13 10l-5.5 5.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      ) : null}

      <div
        ref={scrollerRef}
        className={`m1-feedback${items.length > 4 ? " m1-feedback--scroll" : ""}`}
        onScroll={updateNav}
      >
        {items.map((item) => (
          <blockquote key={item.id} className="m1-feedback__item">
            <p className="m1-feedback__quote">&ldquo;{item.quote}&rdquo;</p>
            <footer className="m1-feedback__meta">
              {item.name ? <cite className="m1-feedback__name">{item.name}</cite> : null}
              {item.org ? <span className="m1-feedback__org">{item.org}</span> : null}
            </footer>
          </blockquote>
        ))}
      </div>
    </div>
  );
}

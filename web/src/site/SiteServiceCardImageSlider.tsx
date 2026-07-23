"use client";

import Image from "next/image";
import { useState } from "react";

type SiteServiceCardImageSliderProps = {
  images: string[];
  alt: string;
};

export function SiteServiceCardImageSlider({
  images,
  alt,
}: SiteServiceCardImageSliderProps) {
  const [index, setIndex] = useState(0);
  const count = images.length;
  const showControls = count > 1;

  function goPrev(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIndex((current) => (current - 1 + count) % count);
  }

  function goNext(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIndex((current) => (current + 1) % count);
  }

  function goToDot(
    dotIndex: number,
    event: React.MouseEvent<HTMLButtonElement>,
  ) {
    event.preventDefault();
    event.stopPropagation();
    setIndex(dotIndex);
  }

  return (
    <div className="m1-case__img m1-case__slider">
      <div
        className="m1-case__slider-track"
        style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}
      >
        {images.map((src, imageIndex) => (
          <div key={`${src}-${imageIndex}`} className="m1-case__slide">
            <Image
              src={src}
              alt={imageIndex === index ? alt : ""}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              priority={imageIndex === 0}
            />
          </div>
        ))}
      </div>

      {showControls ? (
        <>
          <button
            type="button"
            className="m1-case__slider-btn m1-case__slider-btn--prev"
            onClick={goPrev}
            aria-label="Previous image"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M10 3L5 8l5 5"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className="m1-case__slider-btn m1-case__slider-btn--next"
            onClick={goNext}
            aria-label="Next image"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M6 3l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="m1-case__slider-dots">
            {images.map((src, dotIndex) => (
              <button
                key={`dot-${src}-${dotIndex}`}
                type="button"
                className={dotIndex === index ? "is-active" : ""}
                onClick={(event) => goToDot(dotIndex, event)}
                aria-label={`Show image ${dotIndex + 1}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

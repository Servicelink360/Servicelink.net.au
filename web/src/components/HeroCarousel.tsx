"use client";

import Image from "@/components/SiteImage";
import Link from "next/link";
import { useEffect, useState } from "react";
import { heroSlides } from "@/lib/site";

export function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % heroSlides.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, []);

  const slide = heroSlides[index];

  return (
    <section className="relative isolate min-h-[28rem] overflow-hidden bg-slate-900 text-white md:min-h-[34rem]">
      {heroSlides.map((item, slideIndex) => {
        const active = slideIndex === index;

        return (
          <div
            key={item.title}
            className={`absolute inset-0 transition-opacity duration-700 ${
              active ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={!active}
          >
            {"image" in item ? (
              <Image
                src={item.image}
                alt=""
                fill
                priority={slideIndex === 0}
                className="object-cover"
                sizes="100vw"
              />
            ) : (
              <div
                className={`absolute inset-0 bg-gradient-to-br ${item.gradient}`}
              />
            )}
            <div className="absolute inset-0 bg-slate-950/55" />
          </div>
        );
      })}

      <div className="relative mx-auto flex min-h-[28rem] max-w-6xl flex-col justify-center px-4 py-20 md:min-h-[34rem] md:px-6">
        <p className="max-w-2xl text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">
          {siteTagline}
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
          {slide.title}
        </h1>
        <p className="mt-4 max-w-xl text-lg text-slate-200">{slide.subtitle}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/services"
            className="rounded-md bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            Explore services
          </Link>
          <Link
            href="/contact"
            className="rounded-md border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Contact us
          </Link>
        </div>

        <div className="mt-10 flex items-center gap-2">
          {heroSlides.map((item, slideIndex) => (
            <button
              key={item.title}
              type="button"
              aria-label={`Show slide ${slideIndex + 1}`}
              onClick={() => setIndex(slideIndex)}
              className={`h-2.5 rounded-full transition-all ${
                slideIndex === index
                  ? "w-8 bg-emerald-400"
                  : "w-2.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

const siteTagline =
  "Partner in facilities management — excellence in service with care and passion";

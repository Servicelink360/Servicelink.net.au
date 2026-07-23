import Image from "next/image";
import Link from "next/link";
import { services } from "@/lib/services";
import { serviceImages } from "./data";

export function AtlasServiceGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service, index) => (
        <article
          key={service.slug}
          className="atlas-card group flex h-full flex-col overflow-hidden rounded-2xl"
        >
          <div className="relative h-44 shrink-0 overflow-hidden">
            <Image
              src={serviceImages[service.slug] ?? "/images/figure1.png"}
              alt=""
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1c1917]/40 to-transparent" />
            <span className="atlas-service-index absolute left-4 top-4">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
          <div className="flex flex-1 flex-col p-6">
            <h3 className="text-lg font-semibold text-[#1c1917]">{service.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-[#57534e]">
              {service.summary}
            </p>
            <Link
              href={`/atlas/services/${service.slug}`}
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#3f5c47] transition group-hover:text-[#b85c38]"
            >
              Read more
              <span aria-hidden className="transition group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}

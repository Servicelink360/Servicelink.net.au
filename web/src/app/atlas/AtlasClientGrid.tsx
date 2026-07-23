import Image from "next/image";
import Link from "next/link";
import { clients } from "@/lib/clients";

export function AtlasClientGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {clients.map((client) => (
        <Link
          key={client.slug}
          href={`/atlas/clients/${client.slug}`}
          className="atlas-card atlas-media-card group flex h-full flex-col overflow-hidden rounded-2xl"
        >
          <div className="relative h-48 shrink-0 overflow-hidden">
            {client.image ? (
              <Image
                src={client.image}
                alt={client.title}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-[#e8efe9]">
                <span className="text-4xl font-bold text-[#3f5c47]/25">S</span>
              </div>
            )}
            <div className="atlas-media-overlay" aria-hidden />
            <p className="absolute bottom-4 left-4 right-4 text-sm font-semibold text-white">
              {client.title}
            </p>
          </div>
          <div className="flex flex-1 flex-col p-6">
            <p className="flex-1 text-sm leading-relaxed text-[#57534e]">{client.summary}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#3f5c47] transition group-hover:text-[#b85c38]">
              View profile
              <span aria-hidden className="transition group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

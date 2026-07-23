import Link from "next/link";
import type { Service } from "@/lib/services";

type ServiceCardProps = {
  service: Service;
};

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <h3 className="text-xl font-semibold text-slate-900">{service.title}</h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
        {service.summary}
      </p>
      <Link
        href={`/services/${service.slug}`}
        className="mt-6 inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-600"
      >
        Read more →
      </Link>
    </article>
  );
}

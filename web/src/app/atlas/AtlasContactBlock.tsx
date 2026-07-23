import { site } from "@/lib/site";
import { AtlasContactForm } from "./AtlasContactForm";

export function AtlasContactBlock() {
  return (
    <div className="atlas-contact-shell mx-auto max-w-4xl md:grid md:grid-cols-2">
      <div className="border-b border-[#e7e0d4] bg-[#e8efe9] p-8 md:border-b-0 md:border-r md:p-10">
        <div className="space-y-3">
          <div className="atlas-contact-detail">
            <span className="atlas-contact-icon" aria-hidden>
              ◎
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#3f5c47]">
                {site.contact.officeLabel}
              </p>
              <p className="mt-0.5 text-sm text-[#57534e]">{site.contact.location}</p>
            </div>
          </div>
          <div className="atlas-contact-detail">
            <span className="atlas-contact-icon" aria-hidden>
              ☎
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#3f5c47]">
                Phone
              </p>
              <a
                href={`tel:${site.contact.phone}`}
                className="mt-0.5 block text-sm text-[#57534e] hover:text-[#1c1917]"
              >
                {site.contact.phone}
              </a>
            </div>
          </div>
          <div className="atlas-contact-detail">
            <span className="atlas-contact-icon" aria-hidden>
              ✉
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#3f5c47]">
                Email
              </p>
              <a
                href={`mailto:${site.contact.email}`}
                className="mt-0.5 block text-sm text-[#57534e] hover:text-[#1c1917]"
              >
                {site.contact.email}
              </a>
            </div>
          </div>
        </div>
      </div>
      <AtlasContactForm />
    </div>
  );
}

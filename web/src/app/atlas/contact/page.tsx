import type { Metadata } from "next";
import { AtlasContactBlock } from "../AtlasContactBlock";
import { AtlasPageHero } from "../AtlasPageHero";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Servicelink Facilities Management in Sydney for quotes, support, and facilities management enquiries.",
};

export default function AtlasContactPage() {
  return (
    <>
      <AtlasPageHero
        eyebrow="Contact"
        title="Have a question? Get in touch"
        lead="Our support office is based in Sydney. Send an enquiry and our team will respond promptly."
      />

      <section className="atlas-section bg-[#e8efe9]/50">
        <div className="atlas-container">
          <AtlasContactBlock />
        </div>
      </section>
    </>
  );
}

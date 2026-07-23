import type { Metadata } from "next";
import { AtlasPageHero } from "../AtlasPageHero";
import { AtlasSectionHeader } from "../AtlasSectionHeader";
import { AtlasServiceGrid } from "../AtlasServiceGrid";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Explore Servicelink facilities management services including cleaning, maintenance, grounds care, and tree management.",
};

export default function AtlasServicesPage() {
  return (
    <>
      <AtlasPageHero
        eyebrow="Our services"
        title="Integrated facilities management across Sydney"
        lead="Gardening, building maintenance, facilities management, general cleaning, tree management, and refurbishment — all under one accountable partner."
      />

      <section className="atlas-section">
        <div className="atlas-container">
          <AtlasSectionHeader
            eyebrow="What we deliver"
            title="Six core service areas"
            lead="Each service is delivered by experienced, qualified teams with a focus on safety, compliance, and client satisfaction."
          />
          <div className="mt-14">
            <AtlasServiceGrid />
          </div>
        </div>
      </section>
    </>
  );
}

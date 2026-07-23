import type { Metadata } from "next";
import { clientsOverview } from "@/lib/clients";
import { AtlasClientGrid } from "../AtlasClientGrid";
import { AtlasPageHero } from "../AtlasPageHero";

export const metadata: Metadata = {
  title: clientsOverview.title,
  description: clientsOverview.description,
};

export default function AtlasClientsPage() {
  return (
    <>
      <AtlasPageHero
        eyebrow={clientsOverview.title}
        title="Government and council partners"
        lead={clientsOverview.description}
      />

      <section className="atlas-section">
        <div className="atlas-container">
          <AtlasClientGrid />
        </div>
      </section>
    </>
  );
}

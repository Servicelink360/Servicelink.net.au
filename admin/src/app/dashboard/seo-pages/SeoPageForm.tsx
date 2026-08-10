"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { saveSeoPage } from "@/lib/actions";
import { CardImagesField } from "@/components/CardImagesField";
import { ImageUploadField } from "@/components/ImageUploadField";
import { IMAGE_SPECS } from "@/lib/image-specs";
import type { SeoPageType } from "@/lib/seo-templates";

export type SeoPageCityOption = {
  id: string;
  name: string;
  state: string;
};

export type SeoPageMetroOption = {
  id: string;
  name: string;
  parentId: string | null;
};

export type SeoPageServiceOption = {
  id: string;
  name: string;
};

type SeoPageFormProps = {
  cities: SeoPageCityOption[];
  metros: SeoPageMetroOption[];
  services: SeoPageServiceOption[];
  pageId?: string;
  defaultCityId?: string;
  defaultMetroId?: string;
  defaultServiceId?: string;
  defaultMetaTitle?: string;
  defaultMetaDescription?: string;
  defaultH1?: string;
  defaultIntro?: string;
  defaultBody?: string;
  defaultHeroImage?: string;
  defaultCardImages?: string;
  defaultPublished?: boolean;
  defaultNoIndex?: boolean;
  defaultPageType?: SeoPageType;
  publicPath?: string;
  mode: "create" | "edit";
};

export function SeoPageForm({
  cities,
  metros,
  services,
  pageId,
  defaultCityId = "",
  defaultMetroId = "",
  defaultServiceId = "",
  defaultMetaTitle = "",
  defaultMetaDescription = "",
  defaultH1 = "",
  defaultIntro = "",
  defaultBody = "",
  defaultHeroImage = "",
  defaultCardImages = "",
  defaultPublished = false,
  defaultNoIndex = false,
  defaultPageType,
  publicPath,
  mode,
}: SeoPageFormProps) {
  const [cityId, setCityId] = useState(defaultCityId);
  const [metroId, setMetroId] = useState(defaultMetroId);

  const imageUploadScope = useMemo(() => {
    if (publicPath) {
      return `pages/${publicPath}`;
    }
    return "pages/general";
  }, [publicPath]);

  const lockPageShape = mode === "edit" && defaultPageType;
  const showMetro = !lockPageShape || defaultPageType === "metro_hub" || defaultPageType === "metro_service";
  const showService = !lockPageShape || defaultPageType === "city_service" || defaultPageType === "metro_service";
  const metroRequired = lockPageShape && (defaultPageType === "metro_hub" || defaultPageType === "metro_service");
  const serviceRequired = lockPageShape && (defaultPageType === "city_service" || defaultPageType === "metro_service");

  const pageTypeHint =
    defaultPageType === "city_hub"
      ? "City hub page — location overview only. Service pages are edited separately."
      : defaultPageType === "metro_hub"
        ? "Metro hub page — overview for this metro area only."
        : defaultPageType === "city_service"
          ? "City + service page — one service across the whole city."
          : defaultPageType === "metro_service"
            ? "Metro + service page — one service for this metro area."
            : null;

  const metrosForCity = useMemo(
    () => metros.filter((metro) => metro.parentId === cityId),
    [metros, cityId],
  );

  function handleCityChange(nextCityId: string) {
    setCityId(nextCityId);
    const validMetro = metros.some(
      (metro) => metro.id === metroId && metro.parentId === nextCityId,
    );
    if (!validMetro) {
      setMetroId("");
    }
  }

  return (
    <>
      <div className="admin-header">
        <h1 style={{ margin: 0 }}>{mode === "create" ? "Add SEO page" : "Edit SEO page"}</h1>
        <Link className="admin-btn admin-btn--ghost" href="/dashboard/seo-pages">
          Back
        </Link>
      </div>

      {publicPath ? (
        <p style={{ color: "#64748b" }}>
          Public URL: <strong>/locations/{publicPath}</strong>
        </p>
      ) : null}

      {pageTypeHint ? (
        <p style={{ color: "#64748b", fontSize: "0.875rem", marginTop: 0 }}>{pageTypeHint}</p>
      ) : null}

      <form className="admin-form admin-panel" style={{ padding: "1.5rem" }} action={saveSeoPage}>
        {pageId ? <input type="hidden" name="id" value={pageId} /> : null}

        <div className="admin-field">
          <label htmlFor="cityId">City</label>
          <select
            id="cityId"
            name="cityId"
            required
            value={cityId}
            onChange={(event) => handleCityChange(event.target.value)}
          >
            {mode === "create" ? (
              <option value="" disabled>
                Select city
              </option>
            ) : null}
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name} ({city.state})
              </option>
            ))}
          </select>
        </div>

        {showMetro ? (
          <div className="admin-field">
            <label htmlFor="metroId">Metro area{metroRequired ? "" : " (optional)"}</label>
            <select
              id="metroId"
              name="metroId"
              value={metroId}
              onChange={(event) => setMetroId(event.target.value)}
              disabled={!cityId}
              required={metroRequired}
            >
              <option value="">
                {cityId
                  ? metroRequired
                    ? "Select metro"
                    : "None (city-level page)"
                  : "Select a city first"}
              </option>
              {metrosForCity.map((metro) => (
                <option key={metro.id} value={metro.id}>
                  {metro.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <input type="hidden" name="metroId" value="" />
        )}

        {showService ? (
          <div className="admin-field">
            <label htmlFor="seoServiceId">SEO service{serviceRequired ? "" : " (optional)"}</label>
            <select
              id="seoServiceId"
              name="seoServiceId"
              defaultValue={defaultServiceId}
              required={serviceRequired}
            >
              <option value="">
                {serviceRequired ? "Select service" : "None (location hub)"}
              </option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <input type="hidden" name="seoServiceId" value="" />
        )}

        <label>
          <input type="checkbox" name="useTemplate" defaultChecked={mode === "create"} />
          {mode === "create" ? " Auto-fill content from SEO templates" : " Re-apply SEO template on save"}
        </label>

        <div className="admin-field">
          <label htmlFor="metaTitle">Meta title</label>
          <input
            id="metaTitle"
            name="metaTitle"
            defaultValue={defaultMetaTitle}
            placeholder={mode === "create" ? "Leave blank to use template" : undefined}
            required={mode === "edit"}
          />
        </div>

        <div className="admin-field">
          <label htmlFor="metaDescription">Meta description</label>
          <textarea
            id="metaDescription"
            name="metaDescription"
            rows={3}
            defaultValue={defaultMetaDescription}
            required={mode === "edit"}
          />
        </div>

        <div className="admin-field">
          <label htmlFor="h1">H1</label>
          <input id="h1" name="h1" defaultValue={defaultH1} required={mode === "edit"} />
        </div>

        <div className="admin-field">
          <label htmlFor="intro">Intro</label>
          <textarea id="intro" name="intro" rows={3} defaultValue={defaultIntro} required={mode === "edit"} />
        </div>

        <div className="admin-field">
          <label htmlFor="body">Body</label>
          <textarea id="body" name="body" rows={8} defaultValue={defaultBody} required={mode === "edit"} />
        </div>

        <section
          className="admin-panel"
          style={{ padding: "1rem", marginBottom: "1rem", background: "#f8fafc" }}
        >
          <h3 style={{ marginTop: 0 }}>Optional image override</h3>
          <p style={{ margin: "0 0 1rem", color: "#64748b", fontSize: "0.875rem" }}>
            Leave blank to inherit from location or SEO service defaults.
          </p>
          <div className="admin-field">
            <ImageUploadField
              name="heroImage"
              label="Hero image"
              defaultValue={defaultHeroImage}
              uploadScope={imageUploadScope}
              preferredName="hero"
              recommendedSize={IMAGE_SPECS.seoPageHero}
            />
          </div>
          <div className="admin-field">
            <CardImagesField
              name="cardImages"
              label="Card images"
              defaultValue={defaultCardImages}
              uploadScope={imageUploadScope}
              recommendedSize={IMAGE_SPECS.serviceCard}
            />
          </div>
        </section>

        <label>
          <input type="checkbox" name="published" defaultChecked={defaultPublished} />
          {mode === "create" ? " Publish now" : " Published"}
        </label>

        <label>
          <input type="checkbox" name="noIndex" defaultChecked={defaultNoIndex} />
          {mode === "create" ? " No index (hide from Google)" : " No index"}
        </label>

        <button className="admin-btn" type="submit">
          {mode === "create" ? "Save SEO page" : "Save changes"}
        </button>
      </form>
    </>
  );
}

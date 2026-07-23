"use client";

import { persistCityHubHero, persistMetroHubHero } from "@/lib/actions";
import { ImageUploadField } from "@/components/ImageUploadField";
import { IMAGE_SPECS } from "@/lib/image-specs";

type CityHubHeroFieldProps = {
  cityId: string;
  citySlug: string;
  defaultValue?: string | null;
};

export function CityHubHeroField({ cityId, citySlug, defaultValue }: CityHubHeroFieldProps) {
  return (
    <ImageUploadField
      name="cityHeroImage"
      label="Hero image"
      defaultValue={defaultValue}
      uploadScope={`locations/${citySlug}`}
      preferredName="hero"
      recommendedSize={IMAGE_SPECS.locationHero}
      helpText="Used on the city hub page."
      fallbackPreviewUrl={
        defaultValue ? null : "/uploads/images/services/facilities-management/hero.jpg"
      }
      fallbackLabel="Currently on the live site (default facilities image)"
      persistTarget={{
        cityId,
        onPersist: (heroImage) => persistCityHubHero(cityId, heroImage),
      }}
    />
  );
}

type MetroHubHeroFieldProps = {
  cityId: string;
  citySlug: string;
  metroId: string;
  metroSlug: string;
  defaultValue?: string | null;
  /** City hub hero — shown/used when this metro has no override. */
  cityHeroImage?: string | null;
  label?: string;
  fallbackLabel?: string;
};

export function MetroHubHeroField({
  cityId,
  citySlug,
  metroId,
  metroSlug,
  defaultValue,
  cityHeroImage,
  label = "Hero image",
  fallbackLabel,
}: MetroHubHeroFieldProps) {
  const cityHero = cityHeroImage?.trim() || null;
  const hasOwn = Boolean(defaultValue?.trim());
  const fallbackPreviewUrl = hasOwn
    ? null
    : cityHero ?? "/uploads/images/services/facilities-management/hero.jpg";
  const resolvedFallbackLabel =
    fallbackLabel ??
    (cityHero
      ? "Currently on the live site (city hub hero)"
      : "Currently on the live site (default facilities image)");

  return (
    <ImageUploadField
      name="metroHeroImage"
      label={label}
      defaultValue={defaultValue}
      uploadScope={`locations/${citySlug}/metros/${metroSlug}`}
      preferredName="hero"
      recommendedSize={IMAGE_SPECS.locationHero}
      fallbackPreviewUrl={fallbackPreviewUrl}
      fallbackLabel={resolvedFallbackLabel}
      persistTarget={{
        cityId,
        metroId,
        onPersist: (heroImage) => persistMetroHubHero(cityId, metroId, heroImage),
      }}
    />
  );
}

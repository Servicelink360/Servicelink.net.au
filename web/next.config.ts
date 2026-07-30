import type { NextConfig } from "next";
import os from "os";

function isIPv4(family: string | number): boolean {
  return family === "IPv4" || family === 4;
}

function getLocalDevHosts(): string[] {
  const hosts = new Set<string>(["localhost", "127.0.0.1"]);

  for (const iface of Object.values(os.networkInterfaces())) {
    for (const address of iface ?? []) {
      if (isIPv4(address.family) && !address.internal) {
        hosts.add(address.address);
      }
    }
  }

  return [...hosts];
}

const localDevHosts = getLocalDevHosts();
const extraDevOrigins =
  process.env.ALLOWED_DEV_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];

const allowedDevOrigins = [
  ...localDevHosts,
  ...localDevOriginsWithPorts(localDevHosts),
  ...extraDevOrigins,
];

function localDevOriginsWithPorts(hosts: string[]): string[] {
  const port = process.env.PORT ?? "3000";
  return hosts.flatMap((host) => [host, `${host}:${port}`]);
}

const nextConfig: NextConfig = {
  allowedDevOrigins,
  // CMS uploads land in public/ after process start; the optimizer 404-caches those
  // paths and returns 400. Serve upload (and other public) images directly instead.
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      { source: "/about-us", destination: "/about", permanent: true },
      { source: "/our-services-2", destination: "/services", permanent: true },
      {
        source: "/service/:slug",
        destination: "/services/:slug",
        permanent: true,
      },
      { source: "/our-clients", destination: "/about", permanent: true },
      { source: "/clients", destination: "/about", permanent: true },
      { source: "/clients/:slug", destination: "/about", permanent: true },
      { source: "/what-we-do", destination: "/services", permanent: true },
      {
        source: "/school-infrastructure-nsw",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/hunters-hill-council",
        destination: "/about",
        permanent: true,
      },
      { source: "/inner-west", destination: "/about", permanent: true },
      { source: "/bayside", destination: "/about", permanent: true },
      { source: "/mock1", destination: "/", permanent: true },
      { source: "/mock1/about", destination: "/about", permanent: true },
      {
        source: "/mock1/services/:slug",
        destination: "/services/:slug",
        permanent: true,
      },
      { source: "/mock", destination: "/", permanent: true },
      { source: "/mock/:path*", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;

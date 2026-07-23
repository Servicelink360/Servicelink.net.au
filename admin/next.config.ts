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

const devPort = process.env.PORT ?? "3001";
const localDevHosts = getLocalDevHosts();
const extraDevOrigins =
  process.env.ALLOWED_DEV_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];

const allowedDevOrigins = [
  ...localDevHosts,
  ...localDevHosts.flatMap((host) => [host, `${host}:${devPort}`]),
  ...extraDevOrigins,
];

const nextConfig: NextConfig = {
  allowedDevOrigins,
};

export default nextConfig;

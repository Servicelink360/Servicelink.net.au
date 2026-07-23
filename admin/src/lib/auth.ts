import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { Admin } from "@/lib/db/schema";

export const ADMIN_SESSION_COOKIE = "servicelink_admin_session";

export type AdminSession = {
  adminId: string;
  email: string;
  name: string;
  role: string;
};

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured.");
  }
  return new TextEncoder().encode(secret);
}

async function sessionFromToken(token: string | undefined | null): Promise<AdminSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as AdminSession;
  } catch {
    return null;
  }
}

export async function createAdminSession(admin: Admin) {
  const token = await new SignJWT({
    adminId: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  } satisfies AdminSession)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  return sessionFromToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

/** Prefer Next cookies(); fall back to the raw Cookie header (multipart uploads). */
export async function getAdminSessionFromRequest(
  request?: Request,
): Promise<AdminSession | null> {
  const fromStore = await getAdminSession();
  if (fromStore) return fromStore;
  if (!request) return null;

  const header = request.headers.get("cookie") ?? "";
  const match = header.match(
    new RegExp(`(?:^|;\\s*)${ADMIN_SESSION_COOKIE}=([^;]+)`),
  );
  return sessionFromToken(match?.[1] ? decodeURIComponent(match[1]) : null);
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function requireAdminSession(request?: Request) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

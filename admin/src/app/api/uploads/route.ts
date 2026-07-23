import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { saveUploadedImage } from "@/lib/uploads";

export async function POST(request: Request) {
  try {
    await requireAdminSession(request);

    const formData = await request.formData();
    const file = formData.get("file");
    const scope = String(formData.get("scope") ?? "").trim();
    const preferredName = String(formData.get("name") ?? "").trim() || undefined;

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Image file is required." }, { status: 400 });
    }

    const url = await saveUploadedImage(file, scope, preferredName);

    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    const status = message.includes("Unauthorized") ? 401 : 400;
    return NextResponse.json(
      {
        error:
          status === 401
            ? "Session expired. Log in again, then upload the image."
            : message,
      },
      { status },
    );
  }
}

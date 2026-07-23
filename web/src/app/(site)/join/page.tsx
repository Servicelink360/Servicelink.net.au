import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export { default } from "@/site/JoinPage";

export const metadata: Metadata = createPageMetadata({
  title: "Join",
  description:
    "Create a Servicelink account and subscribe to facilities management news and updates.",
  path: "/join",
});

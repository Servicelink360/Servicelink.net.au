import Image, { type ImageProps } from "next/image";

function isCmsUploadSrc(src: ImageProps["src"]): boolean {
  if (typeof src !== "string") return false;
  return src.startsWith("/uploads/") || src.includes("/uploads/");
}

/**
 * next/image wrapper. CMS files under /uploads are served by nginx and must
 * bypass the optimizer (new uploads get 404-cached by /_next/image).
 * Static/bundled images still go through Next optimization (WebP/AVIF + sizes).
 */
export default function SiteImage({ unoptimized, ...props }: ImageProps) {
  return (
    <Image
      {...props}
      unoptimized={unoptimized ?? isCmsUploadSrc(props.src)}
    />
  );
}

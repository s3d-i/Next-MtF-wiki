import path from "node:path";
export function getLocalImagePath(
  language: string | null,
  slug: string | undefined | null,
  imagePath: string,
  isCurrentSlugIndex: boolean
): string | null {
  if (imagePath.startsWith("/images/")) {
    return imagePath.replace(/^\/images\//, "/hugo-static/images/");
  }
  if (
    imagePath?.startsWith("http://") ||
    imagePath?.startsWith("https://") ||
    imagePath?.startsWith("//")
  ) {
    return imagePath;
  }
  if (imagePath?.startsWith("/")) {
    return `/hugo-files${imagePath}`;
  }
  if (slug && language) {
    const pathname = isCurrentSlugIndex ? slug : path.dirname(slug);
    return `/hugo-files/${language}/${pathname}/${imagePath}`;
  }
  return null;
}
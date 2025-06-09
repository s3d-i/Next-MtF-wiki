import { getLocalImagePath } from "@/service/path-utils";
import { MdContextType } from "./types";


export function getLocalImagePathFromMdContext(src: string | undefined, mdContext?: MdContextType): string {
  if(mdContext && src) {
    return getLocalImagePath(mdContext.currentLanguage, mdContext.currentSlug, src, mdContext.isCurrentSlugIndex) || src;
  }
  return src || "";
}
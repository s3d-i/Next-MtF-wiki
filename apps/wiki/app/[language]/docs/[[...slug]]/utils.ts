import path from "node:path";

// 重新导出目录服务中的功能，保持向后兼容
export { getLanguagesInfo } from "../directory-service";

export function getContentDir() {
  return path.join(process.cwd(), "../../source", "content");
}

export function getIndexPageSlugs(){
  return ["index.md","_index.md"];
}

export function getIndexPageSlugsWithOutExtensionName(){
  return ["index","_index"];
}

export function getNonSelfClosingElements() {
  return [
    "ref",  
    "mtf-wiki",
    "telephone",
    "wiki",
    "shields/qq",
    "shields/wechat",
    "shields/github-issue",
    "shields/twitter",
    "shields/telegram",
    "hiddenphoto",
    "watermark",
    "currency",
    "doctor-image",
    "figure",
    "shields/line",
    "tag/pos",
    "tag/neg",
    "shields/discord",
    "shields/matrix",
    "meme/onimai-zh",
    "meme/baidu-hrt",
    "ruby",
    "gallery",
    "meme/hybl",
    "meme/onimai-ja",
  ];
}

export function getNavigationPath(slug: string, language: string, basePath: string = "docs"): string {
  return `/${language}/${basePath}/${slug}`;
}
import path from "node:path";
import fs from "node:fs/promises";
import { getFrontmatter } from "next-mdx-remote-client/utils";
import {
  getContentDir,
  getIndexPageSlugs,
  getIndexPageSlugsWithOutExtensionName,
} from "./[[...slug]]/utils";
import { cache } from "react";
import { Frontmatter } from "./[[...slug]]/types";

// 文档项接口
export interface DocItem {
  slug: string;
  originalSlug: string;
  displayPath: string;
  realPath: string; // 真实文件系统路径
  children?: DocItem[];
  isIndex?: boolean;
  metadata: DocMetadata;
  parentDisplayPath?: string;
}

// 语言信息接口
export interface LanguageInfo {
  code: string;
  hasDocsDir: boolean;
  docsPaths: string[]; // 该语言下所有文档路径
}

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
    return `/hugo-files/${language}/docs/${pathname}/${imagePath}`;
  }
  return null;
}

export function getDirPath(slug: string): string {
  return path.dirname(slug);
}

async function getDocFrontmatter(
  filePath: string
): Promise<Frontmatter | null> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    const { frontmatter } = getFrontmatter<Frontmatter>(content);
    return frontmatter;
  } catch (error) {
    return null;
  }
}

async function getDocTitleFromFrontmatter(
  filePath: string,
  frontmatter: Frontmatter | null
): Promise<string> {
  return frontmatter?.title || path.basename(filePath, path.extname(filePath));
}

interface DocMetadata {
  title: string;
  draft?: boolean;
  order?: number | null;
  preferredSlug?: string | null;
}

async function getDocMetadata(
  filePath: string,
  frontmatter: Frontmatter | null
): Promise<DocMetadata> {
  const preferredSlug = frontmatter?.slug;
  return {
    title: await getDocTitleFromFrontmatter(filePath, frontmatter),
    draft: Boolean(frontmatter?.draft),
    order: Number(frontmatter?.weight) || null,
    preferredSlug: preferredSlug?.toString() || null,
  };
}

// 获取文档标题的辅助函数
async function getDocTitle(filePath: string): Promise<string> {
  return getDocTitleFromFrontmatter(
    filePath,
    await getDocFrontmatter(filePath)
  );
}

// 递归获取目录结构
async function getDirectoryStructure(
  dirPath: string,
  basePath = "",
  parentPath = "",
  contentDirPath = "",
): Promise<DocItem> {
  const contentDir = contentDirPath || getContentDir();
  const children: DocItem[] = [];

  {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    // 处理文件和目录
    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry.name);
      const relativePath = path.join(basePath, entry.name);
      const currentDisplayPath = parentPath
        ? `${parentPath}/${entry.name}`
        : entry.name;

      if (entry.isDirectory()) {
        // 递归处理子目录
        const subDirItem = await getDirectoryStructure(
          entryPath,
          relativePath,
          currentDisplayPath,
          contentDir,
        );

        if (subDirItem.isIndex) {
          // 如果有 _index.md 文件，创建目录项，包含子项
          subDirItem.slug = subDirItem.metadata.preferredSlug || entry.name;
          subDirItem.originalSlug = entry.name;
          subDirItem.parentDisplayPath = parentPath;
          // console.log("parentPath: ", parentPath, "currentDisplayPath: ", currentDisplayPath);
          children.push(subDirItem);
        } else {
          // 只有文件，没有子目录，跳过当前目录，将文件提升到上一级
          for (const child of subDirItem.children ?? []) {
            children.push({
              ...child,
              parentDisplayPath: currentDisplayPath,
              // fullPath 保持不变，因为实际文件路径包含这个目录
            });
          }
        }
      } else if (
        entry.name.endsWith(".md") &&
        !getIndexPageSlugs().includes(entry.name)
      ) {
        // 处理 Markdown 文件
        const metadata = await getDocMetadata(
          entryPath,
          await getDocFrontmatter(entryPath)
        );
        const slug = entry.name.replace(/\.md$/, "");

        const preferredSlug = metadata.preferredSlug || slug;

        const fileFullPath = parentPath
          ? `${parentPath}/${preferredSlug}`
          : preferredSlug;
        const fileRealPath = entryPath;

        const toPush = {
          metadata,
          slug: preferredSlug,
          originalSlug: slug,
          displayPath: fileFullPath,
          realPath: fileRealPath,
          parentDisplayPath: parentPath,
        };

        children.push(toPush);

      }
    }
  }

  // 确定当前目录的元数据
  let dirHasIndex = false;
  let dirIndexPath = "";
  for (const indexPageSlug of getIndexPageSlugs()) {
    const p = path.join(dirPath, indexPageSlug);
    try {
      await fs.access(p);
      dirIndexPath = p;
      dirHasIndex = true;
      break;
    } catch (error) {
      // 未找到，继续
    }
  }

  let dirMetadata: DocMetadata;
  if (dirHasIndex) {
    dirMetadata = await getDocMetadata(
      dirIndexPath,
      await getDocFrontmatter(dirIndexPath)
    );
  } else {
    dirMetadata = { title: path.basename(parentPath || dirPath) };
  }

  // 按顺序和标题排序
  const sortedChildren = children
    .filter((item) => {
      return !item.metadata.draft;
    })
    .sort((a, b) => {
      const orderA = a.metadata?.order || Number.MAX_SAFE_INTEGER;
      const orderB = b.metadata?.order || Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return a.metadata.title.localeCompare(b.metadata.title);
    });

  const realP = dirHasIndex ? dirIndexPath : dirPath;

  const result: DocItem = {
    metadata: dirMetadata,
    slug: "",
    originalSlug: "",
    displayPath: parentPath,
    realPath: realP,
    children: sortedChildren,
    isIndex: dirHasIndex,
  };

  return result;
}

// 获取所有可用的语言信息
export const getLanguagesInfo = cache(async (): Promise<LanguageInfo[]> => {
  const contentDir = getContentDir();
  const languagesInfo: LanguageInfo[] = [];

  try {
    const entries = await fs.readdir(contentDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const langDir = path.join(contentDir, entry.name);
        const docsDir = path.join(langDir, "docs");

        // 检查是否有 docs 目录
        let hasDocsDir = false;
        try {
          const docsStat = await fs.stat(docsDir);
          hasDocsDir = docsStat.isDirectory();
        } catch (error) {
          hasDocsDir = false;
        }

        // 获取该语言下的所有文档路径
        let docsPaths: string[] = [];
        if (hasDocsDir) {
          const allFiles = await getDocsNavigationRoot(entry.name);

          docsPaths =
            allFiles.children?.reduce((acc: string[], child) => {
              const collectPaths = (item: DocItem): string[] => {
                const paths = [];
                if (item.slug) {
                  paths.push(item.displayPath);
                }
                if (item.children) {
                  item.children.forEach((c) => paths.push(...collectPaths(c)));
                }
                return paths;
              };
              return [...acc, ...collectPaths(child)];
            }, []) || [];

          // for (const docPath of docsPaths) {
          //   console.log("docPath: ", docPath);
          // }
        }

        languagesInfo.push({
          code: entry.name,
          hasDocsDir,
          docsPaths,
        });
      }
    }

    return languagesInfo;
  } catch (error) {
    console.error("Error getting languages info:", error);
    // 返回默认语言列表
    const defaultLanguages: LanguageInfo[] = [
      { code: "zh-cn", hasDocsDir: false, docsPaths: [] },
      { code: "zh-hant", hasDocsDir: false, docsPaths: [] },
      { code: "ja", hasDocsDir: false, docsPaths: [] },
      { code: "es", hasDocsDir: false, docsPaths: [] },
      { code: "en", hasDocsDir: false, docsPaths: [] },
    ];

    return defaultLanguages;
  }
});

// 获取所有可用的语言代码（向后兼容）
export async function getAvailableLanguages(): Promise<string[]> {
  const languagesInfo = await getLanguagesInfo();
  return languagesInfo.map((info) => info.code);
}

const getDocsNavigationRootInner = cache(
  async (language: string): Promise<DocItem> => {
  const contentDir = path.join(getContentDir(), language, "docs");

  const rootItem = await getDirectoryStructure(
    contentDir,
    "",
    "",
    getContentDir(),
  );

  return rootItem;
});

export async function getDocsNavigationRoot(
  language: string
): Promise<DocItem> {
  return await getDocsNavigationRootInner(language);
}

const getDocsNavigationRootWithMapInner = cache(
  async (language: string): Promise<{root: DocItem, map: Map<string, DocItem>}> => {
    const rootItem = await getDocsNavigationRootInner(language);
    const map = new Map<string, DocItem>();
    map.set(rootItem.displayPath, rootItem);
    function collectPaths(item: DocItem): void {
      if (item.slug) {
        map.set(item.displayPath, item);
      }
      if (item.children) {
        item.children.forEach((c) => collectPaths(c));
      }
    }
    collectPaths(rootItem);
    return {root: rootItem, map: map};
  }
);

export async function getDocsNavigationMap(
  language: string
): Promise<{root: DocItem, map: Map<string, DocItem>}> {
  const {root, map} = await getDocsNavigationRootWithMapInner(language);
  return {root, map};
}

const getDocsNavigationForClientInner = cache(
  async (language: string): Promise<DocItem[]> => {
    const rootItems = await getDocsNavigation(language);
    return rootItems.map(item => clearServerLocalInfo(item));
  }
);

/**
 * 递归清空DocItem及其子项的realPath字段
 * @param item 要处理的DocItem对象
 * @returns 新的DocItem对象，realPath字段为空字符串
 */
export function clearServerLocalInfo(item: DocItem): DocItem {
  // 创建新的DocItem对象，realPath为空字符串
  const newItem: DocItem = {
    ...item,
    realPath: "",
    children: item.children ? item.children.map(child => clearServerLocalInfo(child)) : undefined
  };

  return newItem;
}

export async function getDocsNavigationForClient(language: string): Promise<DocItem[]> {
  return await getDocsNavigationForClientInner(language);
}


// 获取特定语言的文档导航
export async function getDocsNavigation(language: string): Promise<DocItem[]> {
  try {
    const rootItem = await getDocsNavigationRoot(language);
    return rootItem.children ?? [];
  } catch (error) {
    console.error(`Error getting docs navigation for ${language}:`, error);
    const emptyResult: DocItem[] = [];
    return emptyResult;
  }
}

export async function getDocFullPathByTrying(
  language: string,
  slugPath: string,
  contentRootDir: string
): Promise<string | null> {
  let fullPath = "";
  let fileExists = false;

  // 如果 slugPath 为空（访问 /docs/），直接查找 _index.md
  if (slugPath === "") {
    fullPath = path.join(contentRootDir, language, "docs", "_index.md");
    fileExists = await fs
      .access(fullPath)
      .then(() => true)
      .catch(() => false);
    if (fileExists) {
      return fullPath;
    }
  } else {
    // 首先尝试 .md 后缀
    fullPath = path.join(contentRootDir, language, "docs", `${slugPath}.md`);
    fileExists = await fs
      .access(fullPath)
      .then(() => true)
      .catch(() => false);

    if (fileExists) {
      return fullPath;
    }

    for (const indexPageSlug of getIndexPageSlugs()) {
      fullPath = path.join(
        contentRootDir,
        language,
        "docs",
        slugPath,
        indexPageSlug
      );

      fileExists = await fs
        .access(fullPath)
        .then(() => true)
        .catch(() => false);

      if (fileExists) {
        return fullPath;
      }
    }
  }

  return null;
}

export function getDocItemByNavigationMap(
  navigationItemMap: Map<string, DocItem>,
  displayPath: string
): DocItem | null {
  return navigationItemMap.get(displayPath) || null;
}

export function getDocItemByNavigationInfo(
  slugs: string[],
  navigationItemRoot: DocItem,
): DocItem | null {
  if (slugs.length === 0) {
    return navigationItemRoot;
  }

  let currentItems = navigationItemRoot.children;
  for (let i = 0; i < slugs.length; i++) {
    const foundItem = currentItems?.find((item) => item.slug === slugs[i]);

    if (foundItem) {
      if (i === slugs.length - 1) {
        return foundItem;
      } else if (foundItem.children) {
        currentItems = foundItem.children;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
  return null;
}

// 检查特定路径在各语言中是否存在
export async function getAvailablePaths(
  languages: string[],
  currentPath: string,
  currentLanguage: string
): Promise<Record<string, boolean>> {
  const result: Record<string, boolean> = {};
  const pathWithoutLang = currentPath.replace(`/${currentLanguage}`, "");

  for (const lang of languages) {
    const targetPath = `/${lang}${pathWithoutLang}`;

    // 将路径转换为文件系统路径
    let filePath = "";
    if (pathWithoutLang === "") {
      // 首页
      filePath = path.join(getContentDir(), lang, "_index.md");
    } else {
      // 其他页面
      filePath = path.join(getContentDir(), lang, `${pathWithoutLang}.md`);
    }

    try {
      await fs.access(filePath);
      result[targetPath] = true;
    } catch (error) {
      result[targetPath] = false;
    }
  }

  return result;
}

export function getNavigationForOriginalSlug(
  languageCode: string,
  slug: string,
  navigationItems: DocItem[]
): DocItem | null {
  function findItem(items: DocItem[], slug: string): DocItem | null {
    for (const item of items) {
      if (item.originalSlug === slug) {
        return item;
      }
      if (item.children) {
        const child = findItem(item.children, slug);
        if (child) {
          return child;
        }
      }
    }
    return null;
  }

  const item = findItem(navigationItems, slug);

  return item || null;
}

// 生成静态参数（用于 generateStaticParams）
export async function generateAllStaticParams(): Promise<
  Array<{ language: string; slug?: string[] }>
> {
  const languagesInfo = await getLanguagesInfo();
  const allParams: Array<{ language: string; slug?: string[] }> = [];

  for (const langInfo of languagesInfo) {
    // 添加语言首页参数
    allParams.push({ language: langInfo.code });

    if (langInfo.hasDocsDir) {
      // 添加文档根路径
      allParams.push({ language: langInfo.code, slug: [] });

      // 添加所有文档页面路径
      for (const docPath of langInfo.docsPaths) {
        const slugParts = docPath.split("/"); // 按路径分隔符拆分
        const toPush = { language: langInfo.code, slug: slugParts };
        allParams.push(toPush);
        //console.log("toPush: ", JSON.stringify(toPush));
      }
    }
  }

  return allParams;
}

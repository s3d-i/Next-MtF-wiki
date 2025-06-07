import { getFrontmatter } from "next-mdx-remote-client/utils";
import fs from "node:fs/promises";
import path from "node:path";
import type { Frontmatter } from "./[[...slug]]/types";
import {
  getContentDir,
  getIndexPageSlugs,
  getIndexPageSlugsWithOutExtensionName,
} from "./[[...slug]]/utils";
import { cache } from "react";
import { Milestone } from "lucide-react";

// 文档项接口
export interface DocItem {
  slug: string;
  fullPath: string;
  realPath: string; // 相对于contentDir的真实路径
  children?: DocItem[];
  isIndex?: boolean;
  metadata: DocMetadata;
}

// 目录映射接口
export interface DirectoryMapping {
  displayPath: string; // 展示路径
  realPath: string; // 真实文件系统路径
  isDirectory: boolean;
  hasIndex: boolean;
  metadata: DocMetadata;
}

// 语言信息接口
export interface LanguageInfo {
  code: string;
  hasDocsDir: boolean;
  docsPaths: string[]; // 该语言下所有文档路径
}

export function getLocalImagePath(
  language: string,
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
  if (slug) {
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
}

async function getDocMetadata(
  filePath: string,
  frontmatter: Frontmatter | null
): Promise<DocMetadata> {
  return {
    title: await getDocTitleFromFrontmatter(filePath, frontmatter),
    draft: Boolean(frontmatter?.draft),
    order: Number(frontmatter?.weight) || null,
  };
}

// 获取文档标题的辅助函数
async function getDocTitle(filePath: string): Promise<string> {
  return getDocTitleFromFrontmatter(
    filePath,
    await getDocFrontmatter(filePath)
  );
}

// 递归获取目录下的所有文件路径
async function getFilesRecursive(dir: string): Promise<string[]> {
  try {
    const dirents = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      dirents.map((dirent) => {
        const res = path.resolve(dir, dirent.name);
        return dirent.isDirectory() ? getFilesRecursive(res) : [res];
      })
    );
    const result = Array.prototype.concat(...files);

    return result;
  } catch (error) {
    // 如果目录不存在，返回空数组
    if (
      error instanceof Error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      const emptyResult: string[] = [];

      return emptyResult;
    }
    throw error;
  }
}

// 递归获取目录结构，同时构建展示路径和真实路径的映射
const getDirectoryStructure = cache(
  async (
    dirPath: string,
    basePath = "",
    parentPath = "",
    contentDirPath = ""
  ): Promise<{ items: DocItem[]; mappings: DirectoryMapping[] }> => {
    const items: DocItem[] = [];
    const mappings: DirectoryMapping[] = [];

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      // 处理文件和目录
      for (const entry of entries) {
        const entryPath = path.join(dirPath, entry.name);
        const relativePath = path.join(basePath, entry.name);
        const currentFullPath = parentPath
          ? `${parentPath}/${entry.name}`
          : entry.name;
        const realPath = path.relative(
          contentDirPath || getContentDir(),
          entryPath
        );

        if (entry.isDirectory()) {
          // 递归处理子目录
          const { items: children, mappings: childMappings } =
            await getDirectoryStructure(
              entryPath,
              relativePath,
              currentFullPath,
              contentDirPath || getContentDir()
            );

          mappings.push(...childMappings);

          {
            let dirHasIndex = false;
            let dirIndexPath = "";

            // 检查当前目录是否有 _index.md 文件
            for (const indexPageSlug of getIndexPageSlugs()) {
              dirIndexPath = path.join(entryPath, indexPageSlug);
              try {
                await fs.access(dirIndexPath);
                dirHasIndex = true;
                break;
              } catch (error) {
                dirHasIndex = false;
              }
            }

            // 添加目录映射
            mappings.push({
              displayPath: currentFullPath,
              realPath: path.relative(
                contentDirPath || getContentDir(),
                entryPath
              ),
              metadata: await getDocMetadata(
                dirIndexPath,
                await getDocFrontmatter(dirIndexPath)
              ),
              isDirectory: true,
              hasIndex: dirHasIndex,
            });

            if (dirHasIndex) {
              // 如果有 _index.md 文件，创建目录项，包含子项
              const metadata = await getDocMetadata(
                dirIndexPath,
                await getDocFrontmatter(dirIndexPath)
              );
              items.push({
                metadata,
                slug: entry.name,
                fullPath: currentFullPath,
                realPath: path.relative(
                  contentDirPath || getContentDir(),
                  dirIndexPath
                ),
                children,
                isIndex: true,
              });
            } else {
              // 如果没有 _index.md 文件，检查是否应该跳过这个目录
              const hasSubDirectories = children.some(
                (child) => child.children && child.children.length > 0
              );

              if (
                !hasSubDirectories &&
                children.every((child) => !child.children)
              ) {
                // 只有文件，没有子目录，跳过当前目录，将文件提升到上一级
                for (const child of children) {
                  items.push({
                    ...child,
                    // fullPath 保持不变，因为实际文件路径包含这个目录
                  });
                }
              } else {
                // 有子目录或其他复杂结构，保留目录层级
                const dirTitle = entry.name;
                items.push({
                  metadata: { title: dirTitle },
                  slug: entry.name,
                  fullPath: currentFullPath,
                  realPath: path.relative(
                    contentDirPath || getContentDir(),
                    entryPath
                  ),
                  children,
                });
              }
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
          const fileFullPath = parentPath ? `${parentPath}/${slug}` : slug;
          const fileRealPath = path.relative(
            contentDirPath || getContentDir(),
            entryPath
          );

          // 添加文件映射
          mappings.push({
            displayPath: fileFullPath,
            realPath: fileRealPath,
            metadata,
            isDirectory: false,
            hasIndex: false,
          });

          items.push({
            metadata,
            slug,
            fullPath: fileFullPath,
            realPath: fileRealPath,
          });
        }
      }

      // 按标题排序
      const sortedItems = items
        .filter((item) => {
          // console.log("item.metadata.draft: ", item.metadata.draft, item.metadata.title);
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

      const result = { items: sortedItems, mappings };

      return result;
    } catch (error) {
      console.error(`Error reading directory ${dirPath}:`, error);
      const emptyResult = { items: [], mappings: [] };

      return emptyResult;
    }
  }
);

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
          const allFiles = await getFilesRecursive(docsDir);
          docsPaths = allFiles
            .filter((filePath) => filePath.endsWith(".md"))
            .map((filePath) => path.relative(docsDir, filePath));
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

// 获取特定语言的文档导航
export async function getDocsNavigation(language: string): Promise<DocItem[]> {
  const contentDir = path.join(getContentDir(), language, "docs");

  try {
    const { items } = await getDirectoryStructure(
      contentDir,
      "",
      "",
      getContentDir()
    );

    return items;
  } catch (error) {
    console.error(`Error getting docs navigation for ${language}:`, error);
    const emptyResult: DocItem[] = [];
    return emptyResult;
  }
}

// 获取特定语言的目录映射
export const getDirectoryMappings = cache(
  async (language: string): Promise<DirectoryMapping[]> => {
    const contentDir = path.join(getContentDir(), language, "docs");

    try {
      const { mappings } = await getDirectoryStructure(
        contentDir,
        "",
        "",
        getContentDir()
      );

      return mappings;
    } catch (error) {
      console.error(`Error getting directory mappings for ${language}:`, error);
      const emptyResult: DirectoryMapping[] = [];

      return emptyResult;
    }
  }
);

export async function getDocFullPath(
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

export function getNavigationForSlug(
  languageCode: string,
  slug: string,
  navigationItems: DocItem[]
): DocItem | null {
  function findItem(items: DocItem[], slug: string): DocItem | null {
    for (const item of items) {
      if (item.slug === slug) {
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
        const slugParts = docPath
          .replace(/\.md$/, "") // 移除 .md 后缀
          .split(path.sep); // 按路径分隔符拆分

        // 如果是 _index.md 文件，跳过，因为它已经通过空 slug 处理了
        if (slugParts.length === 1 && slugParts[0] === "_index") {
          // console.log("slugParts: ", slugParts);
          // console.log("langInfo.code: ", langInfo.code);
          continue;
        }

        // 如果是目录中的 _index.md 文件，使用目录路径作为 slug
        if (
          getIndexPageSlugsWithOutExtensionName().includes(
            slugParts[slugParts.length - 1]
          )
        ) {
          // console.log("slugParts2: ", slugParts);

          slugParts.pop(); // 移除 _index 部分
        }

        allParams.push({ language: langInfo.code, slug: slugParts });
      }
    }
  }

  return allParams;
}

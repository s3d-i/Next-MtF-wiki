import path from "node:path";
import { 
  getDirectoryMappings, 
  getDocsNavigation, 
  getLanguagesInfo,
  type DirectoryMapping,
  type DocItem,
  type LanguageInfo 
} from "./directory-service";


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

/**
 * 根据展示路径查找真实文件路径
 * @param language 语言代码
 * @param displayPath 展示路径（如 "intro/basic"）
 * @returns 真实文件路径（相对于 contentDir）或 null
 */
export async function findRealPath(language: string, displayPath: string): Promise<string | null> {
  const mappings = await getDirectoryMappings(language);
  const mapping = mappings.find(m => m.displayPath === displayPath);
  return mapping ? mapping.realPath : null;
}

/**
 * 根据真实路径查找展示路径
 * @param language 语言代码
 * @param realPath 真实文件路径（相对于 contentDir）
 * @returns 展示路径或 null
 */
export async function findDisplayPath(language: string, realPath: string): Promise<string | null> {
  const mappings = await getDirectoryMappings(language);
  const mapping = mappings.find(m => m.realPath === realPath);
  return mapping ? mapping.displayPath : null;
}

/**
 * 获取所有文档的路径映射表
 * @param language 语言代码
 * @returns 路径映射表 { displayPath: realPath }
 */
export async function getPathMappingTable(language: string): Promise<Record<string, string>> {
  const mappings = await getDirectoryMappings(language);
  const table: Record<string, string> = {};
  
  for (const mapping of mappings) {
    table[mapping.displayPath] = mapping.realPath;
  }
  
  return table;
}

/**
 * 获取目录结构的扁平化列表
 * @param language 语言代码
 * @returns 扁平化的文档项列表
 */
export async function getFlatDocsList(language: string): Promise<Array<DocItem & { level: number }>> {
  const navigation = await getDocsNavigation(language);
  const flatList: Array<DocItem & { level: number }> = [];
  
  function flatten(items: DocItem[], level = 0) {
    for (const item of items) {
      flatList.push({ ...item, level });
      if (item.children) {
        flatten(item.children, level + 1);
      }
    }
  }
  
  flatten(navigation);
  return flatList;
}

/**
 * 搜索文档
 * @param language 语言代码
 * @param query 搜索关键词
 * @returns 匹配的文档项列表
 */
export async function searchDocs(language: string, query: string): Promise<DocItem[]> {
  const flatList = await getFlatDocsList(language);
  const lowerQuery = query.toLowerCase();
  
  return flatList.filter(item => 
    item.metadata.title.toLowerCase().includes(lowerQuery) ||
    item.fullPath.toLowerCase().includes(lowerQuery)
  );
}

/**
 * 获取文档的面包屑导航
 * @param language 语言代码
 * @param fullPath 文档的完整路径
 * @returns 面包屑导航数组
 */
export async function getBreadcrumbs(language: string, fullPath: string): Promise<Array<{ title: string; path: string }>> {
  const navigation = await getDocsNavigation(language);
  const breadcrumbs: Array<{ title: string; path: string }> = [];
  
  function findPath(items: DocItem[], targetPath: string, currentPath: Array<{ title: string; path: string }> = []): boolean {
    for (const item of items) {
      const newPath = [...currentPath, { title: item.metadata.title, path: item.fullPath }];
      
      if (item.fullPath === targetPath) {
        breadcrumbs.push(...newPath);
        return true;
      }
      
      if (item.children && findPath(item.children, targetPath, newPath)) {
        return true;
      }
    }
    return false;
  }
  
  findPath(navigation, fullPath);
  return breadcrumbs;
}

/**
 * 获取相邻的文档（上一个和下一个）
 * @param language 语言代码
 * @param currentPath 当前文档路径
 * @returns 上一个和下一个文档
 */
export async function getAdjacentDocs(language: string, currentPath: string): Promise<{
  prev: DocItem | null;
  next: DocItem | null;
}> {
  const flatList = await getFlatDocsList(language);
  const currentIndex = flatList.findIndex(item => item.fullPath === currentPath);
  
  if (currentIndex === -1) {
    return { prev: null, next: null };
  }
  
  return {
    prev: currentIndex > 0 ? flatList[currentIndex - 1] : null,
    next: currentIndex < flatList.length - 1 ? flatList[currentIndex + 1] : null,
  };
}

/**
 * 获取语言统计信息
 * @returns 每种语言的文档数量统计
 */
export async function getLanguageStats(): Promise<Array<LanguageInfo & { docCount: number }>> {
  const languagesInfo = await getLanguagesInfo();
  
  return languagesInfo.map(info => ({
    ...info,
    docCount: info.docsPaths.length,
  }));
}

/**
 * 验证路径是否存在
 * @param language 语言代码
 * @param displayPath 展示路径
 * @returns 路径是否存在
 */
export async function validatePath(language: string, displayPath: string): Promise<boolean> {
  const realPath = await findRealPath(language, displayPath);
  return realPath !== null;
}

/**
 * 获取目录树（用于调试或管理界面）
 * @param language 语言代码
 * @returns 目录树的JSON表示
 */
export async function getDirectoryTree(language: string): Promise<string> {
  const navigation = await getDocsNavigation(language);
  const mappings = await getDirectoryMappings(language);
  
  return JSON.stringify({
    navigation,
    mappings,
    stats: {
      totalDocs: mappings.filter(m => !m.isDirectory).length,
      totalDirectories: mappings.filter(m => m.isDirectory).length,
    }
  }, null, 2);
} 
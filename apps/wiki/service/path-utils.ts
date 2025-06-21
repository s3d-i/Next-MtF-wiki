import fs from 'node:fs';
import path from 'node:path';
import {
  getContentDir,
  getContentGitRootDir,
  getPublicDir,
} from '@/app/[language]/(documents)/[...slug]/utils';
import { cache } from '@/lib/cache';
import { simpleGit } from 'simple-git';

export function getLocalImagePath(
  language: string | null,
  realCurrentSlug: string | undefined | null,
  imagePath: string,
  isCurrentSlugIndex: boolean,
): string | null {
  return transformFilesLink(
    imagePath,
    realCurrentSlug,
    language,
    isCurrentSlugIndex,
  );
}

export function transformFilesLink(
  link: string,
  currentRealSlug: string | undefined | null,
  language: string | null,
  isCurrentSlugIndex: boolean,
) {
  if (link.startsWith('//') || link.includes(':') || link.includes('#')) {
    return link;
  }
  const contentDir = getPublicDir();
  if (link.startsWith('/')) {
    const filePath = `/hugo-static${link}`;
    if (fs.existsSync(path.join(contentDir, filePath))) {
      return filePath;
    }
  }
  if (currentRealSlug && language) {
    // console.log(
    //   'currentRealSlug: ',
    //   currentRealSlug,
    //   path.dirname(currentRealSlug),
    // );
    function getFilesRelativePath(
      currentRealSlug: string,
      link: string,
    ): string | null {
      const currentPath = `/hugo-files/${language}/${currentRealSlug}`;
      const hugoFilesPath = path.join(path.dirname(currentPath), link);
      // console.log('hugoFilesPath: ', hugoFilesPath);
      const realHugoFilesPath = path.join(contentDir, hugoFilesPath);
      // console.log('realHugoFilesPath: ', realHugoFilesPath);
      if (fs.existsSync(realHugoFilesPath)) {
        return hugoFilesPath.replaceAll('\\', '/');
      }
      return null;
    }
    if (!isCurrentSlugIndex) {
      const relativePath = getFilesRelativePath(
        `${currentRealSlug}/index.md`,
        link,
      );
      if (relativePath) {
        return relativePath;
      }
    }
    const relativePath = getFilesRelativePath(currentRealSlug, link);
    if (relativePath) {
      return relativePath;
    }
  }
  // console.warn(`Link ${link} not found in ${currentRealSlug} ${language}`);
  return link;
}

/**
 * 获取指定文件的最近修改时间
 * @param filePath 文件路径（相对于 git 仓库根目录）
 * @returns Promise<Date | null> 返回文件的最近修改时间，如果获取失败则返回 null
 */
export async function getFileLastModifiedTimeUncached(
  filePath: string,
): Promise<Date | null> {
  try {
    const git = simpleGit(getContentGitRootDir());

    // 使用 git log 获取文件的最近提交信息
    const log = await git.log({
      file: path.relative(getContentGitRootDir(), filePath),
      maxCount: 1, // 只获取最近的一次提交
      format: {
        date: '%ai', // ISO 8601 格式的作者日期
      },
    });

    // console.log("log", log);

    if (log.latest?.date) {
      return new Date(log.latest.date);
    }

    return null;
  } catch (error) {
    console.error('获取文件修改时间失败:', error);
    return null;
  }
}

export const getFileLastModifiedTime = cache(async (filePath: string) => {
  return getFileLastModifiedTimeUncached(filePath);
});

import fs from 'node:fs';
import path from 'node:path';
import {
  getContentDir,
  getContentGitRootDir,
  getPublicDir,
} from '@/app/[language]/(documents)/[...slug]/utils';
import { simpleGit } from 'simple-git';

export function getLocalImagePath(
  language: string | null,
  realCurrentSlug: string | undefined | null,
  imagePath: string,
  isCurrentSlugIndex: boolean,
): string | null {
  if (imagePath.startsWith('/images/')) {
    return imagePath.replace(/^\/images\//, '/hugo-static/images/');
  }
  if (
    imagePath?.startsWith('http://') ||
    imagePath?.startsWith('https://') ||
    imagePath?.startsWith('//')
  ) {
    return imagePath;
  }
  if (imagePath?.startsWith('/')) {
    return `/hugo-files${imagePath}`;
  }
  if (realCurrentSlug && language) {
    // console.log(
    //   'realCurrentSlug: ',
    //   path.dirname(realCurrentSlug),
    //   'isCurrentSlugIndex: ',
    //   isCurrentSlugIndex,
    // );
    const pathname = path.dirname(realCurrentSlug);
    return `/hugo-files/${language}/${pathname}/${imagePath}`;
  }
  return null;
}

export function transformFilesLink(
  link: string,
  currentRealSlug: string | undefined,
  language: string,
) {
  if (
    link.startsWith('https://') ||
    link.startsWith('http://') ||
    link.startsWith('//')
  ) {
    return link;
  }
  const contentDir = getPublicDir();
  if (link.startsWith('/')) {
    const filePath = `/hugo-static${link}`;
    if (fs.existsSync(path.join(contentDir, filePath))) {
      return filePath;
    }
  }
  if (currentRealSlug) {
    // console.log(
    //   'currentRealSlug: ',
    //   currentRealSlug,
    //   path.dirname(currentRealSlug),
    // );
    const hugoFilesPath = path.join(
      `/hugo-files/${language}/${currentRealSlug}/`,
      link,
    );
    // console.log('hugoFilesPath: ', hugoFilesPath);
    const realHugoFilesPath = path.join(contentDir, hugoFilesPath);
    // console.log('realHugoFilesPath: ', realHugoFilesPath);
    if (fs.existsSync(realHugoFilesPath)) {
      return hugoFilesPath.replaceAll('\\', '/');
    }
  }
  return link;
}

/**
 * 获取指定文件的最近修改时间
 * @param filePath 文件路径（相对于 git 仓库根目录）
 * @returns Promise<Date | null> 返回文件的最近修改时间，如果获取失败则返回 null
 */
export async function getFileLastModifiedTime(
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

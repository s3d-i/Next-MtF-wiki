import { getLanguageConfigs, getSEOConfig } from '@/lib/site-config';
import {
  generateAllStaticParams,
  getDocItemByNavigationMap,
  getDocsNavigationMap,
} from '@/service/directory-service';
import { getFileLastModifiedTime } from '@/service/path-utils';
import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const seoConfig = getSEOConfig();
  const languageConfigs = getLanguageConfigs();

  const urls: MetadataRoute.Sitemap = [];

  // 添加首页 (该页会跳转，所以不添加)
  // urls.push({
  //   url: seoConfig.siteUrl,
  //   lastModified: new Date(),
  //   changeFrequency: 'daily',
  //   priority: 1,
  // });

  // 为每种语言添加语言首页
  for (const langConfig of languageConfigs) {
    urls.push({
      url: `${seoConfig.siteUrl}${langConfig.code}`,
    });

    // 为每个子目录生成页面URL
    for (const subfolder of langConfig.subfolders) {
      try {
        const params = await generateAllStaticParams(
          langConfig.code,
          subfolder,
        );

        const { root: navigationItemRoot, map: navigationItemMap } =
          await getDocsNavigationMap(langConfig.code, subfolder);

        for (const param of params) {
          if (param.slug && param.slug.length > 0) {
            const path = param.slug.join('/');
            const url = `${seoConfig.siteUrl}${param.language}/${path}`;
            const docItem = getDocItemByNavigationMap(navigationItemMap, path);

            urls.push({
              url,
              lastModified:
                (docItem &&
                  (await getFileLastModifiedTime(docItem.realPath))) ||
                undefined,
            });
          }
        }
      } catch (error) {
        console.warn(
          `Failed to generate sitemap for ${langConfig.code}/${subfolder}:`,
          error,
        );
      }
    }
  }

  return urls;
}

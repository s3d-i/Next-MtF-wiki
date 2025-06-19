import { getLanguageConfigs, getSEOConfig } from '@/lib/site-config';
import { generateAllStaticParams } from '@/service/directory-service';
import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const seoConfig = getSEOConfig();
  const languageConfigs = getLanguageConfigs();

  const urls: MetadataRoute.Sitemap = [];

  // 添加首页
  urls.push({
    url: seoConfig.siteUrl,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1,
  });

  // 为每种语言添加语言首页
  for (const langConfig of languageConfigs) {
    urls.push({
      url: `${seoConfig.siteUrl}${langConfig.code}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    });

    // 为每个子目录生成页面URL
    for (const subfolder of langConfig.subfolders) {
      try {
        const params = await generateAllStaticParams(
          langConfig.code,
          subfolder,
        );

        for (const param of params) {
          if (param.slug && param.slug.length > 0) {
            const path = param.slug.join('/');
            const url = `${seoConfig.siteUrl}${param.language}/${path}`;

            // 根据页面类型设置不同的优先级
            let priority = 0.7;
            let changeFrequency: MetadataRoute.Sitemap[0]['changeFrequency'] =
              'weekly';

            if (
              path === 'docs' ||
              path === 'converter' ||
              path === 'about' ||
              path === 'cup-calculator'
            ) {
              priority = 0.8;
              changeFrequency = 'daily';
            } else if (path.includes('docs/')) {
              priority = 0.6;
              changeFrequency = 'monthly';
            }

            urls.push({
              url,
              lastModified: new Date(),
              changeFrequency,
              priority,
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

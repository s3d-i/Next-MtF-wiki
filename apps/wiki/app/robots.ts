import { getSEOConfig } from '@/lib/site-config';
import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  const seoConfig = getSEOConfig();

  // console.log('SEO Config:', seoConfig);
  // console.log('Environment variables:', {
  //   NEXT_PUBLIC_ROBOTS_ALLOW: process.env.NEXT_PUBLIC_ROBOTS_ALLOW,
  //   NEXT_PUBLIC_INCLUDE_SITEMAP: process.env.NEXT_PUBLIC_INCLUDE_SITEMAP,
  //   NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  // });

  if (!seoConfig.allowRobots) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  const rules: MetadataRoute.Robots['rules'] = [
    {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/_next/',
        '/favicon/',
        '/hugo-files/',
        '/hugo-static/',
      ],
    },
  ];

  const robots: MetadataRoute.Robots = {
    rules,
  };

  if (seoConfig.includeSitemap) {
    robots.sitemap = `${seoConfig.siteUrl}sitemap.xml`;
  }

  return robots;
}

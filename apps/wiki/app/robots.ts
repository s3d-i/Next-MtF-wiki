import type { MetadataRoute } from 'next'
import { getSEOConfig } from '@/lib/site-config'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  const seoConfig = getSEOConfig()

  // console.log('SEO Config:', seoConfig)
  // console.log('Environment variables:', {
  //   ROBOTS_ALLOW: process.env.ROBOTS_ALLOW,
  //   INCLUDE_SITEMAP: process.env.INCLUDE_SITEMAP,
  //   SITE_URL: process.env.SITE_URL
  // })

  if (!seoConfig.allowRobots) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    }
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
  ]

  const robots: MetadataRoute.Robots = {
    rules,
  }

  if (seoConfig.includeSitemap) {
    robots.sitemap = `${seoConfig.siteUrl}/sitemap.xml`
  }

  return robots
}

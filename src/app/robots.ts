import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/checkout/', '/payment/'],
    },
    sitemap: 'https://www.kidcode.org.il/sitemap.xml',
  };
}

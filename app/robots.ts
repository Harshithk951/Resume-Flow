import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/profile', '/sign-in', '/sign-up', '/ops', '/resume/'],
    },
    sitemap: 'https://resumeflow.harshithkumar.in/sitemap.xml',
  };
}

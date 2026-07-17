import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard',    // Authenticated app pages — no SEO value
        '/profile',      // User profile — private
        '/sign-in',      // Auth pages
        '/sign-up',      // Auth pages
        '/onboarding',   // User onboarding flow
        '/ops',          // Admin/dead-letter ops
      ],
    },
    sitemap: 'https://resumeflow.harshithkumar.in/sitemap.xml',
  };
}

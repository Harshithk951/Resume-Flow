import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://resumeflow.harshithkumar.in';

  // Static pages — highest priority
  const staticPages = [
    { url: baseUrl, priority: 1.0, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/templates`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/free-resume-builder`, priority: 0.9, changeFrequency: 'weekly' as const },
  ] as const;

  // Info pages — company info, blog, contact, etc.
  const infoSlugs = ['about', 'blog', 'contact', 'careers'];

  // Blog posts
  const blogPosts = [
    { url: `${baseUrl}/info/blog/best-free-resume-builders-2026`, priority: 0.85, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/info/blog/how-to-beat-ats-bots-2026`, priority: 0.85, changeFrequency: 'monthly' as const },
  ];
  const infoPages = infoSlugs.map((slug) => ({
    url: `${baseUrl}/info/${slug}` as const,
    priority: slug === 'blog' ? 0.8 : 0.6,
    changeFrequency: slug === 'blog' ? 'weekly' as const : 'monthly' as const,
  }));

  // Resource pages — handbooks, guides, best practices
  const resourceSlugs = ['handbook', 'interview-prep', 'ats-best-practices', 'api-docs'];
  const resourcePages = resourceSlugs.map((slug) => ({
    url: `${baseUrl}/resources/${slug}` as const,
    priority: 0.8,
    changeFrequency: 'monthly' as const,
  }));

  // Legal pages — low priority, rarely changes
  const legalSlugs = ['privacy', 'terms', 'cookies'];
  const legalPages = legalSlugs.map((slug) => ({
    url: `${baseUrl}/legal/${slug}` as const,
    priority: 0.3,
    changeFrequency: 'yearly' as const,
  }));

  const allPages = [
    ...staticPages,
    ...infoPages,
    ...blogPosts,
    ...resourcePages,
    ...legalPages,
  ];

  return allPages.map((page) => ({
    ...page,
    lastModified: new Date(),
  }));
}

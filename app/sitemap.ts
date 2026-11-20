import { MetadataRoute } from 'next';
import { ALL_ROLES_RAW } from '@/lib/roleGuides';
import { getAllGuideSlugs } from '@/lib/blogData';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://resumeflow.harshithkumar.in';

  // Static pages — highest priority
  const staticPages = [
    { url: baseUrl, priority: 1.0, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/blog`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/about`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/features`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/pricing`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/resume-templates`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/free-resume-builder`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/resume-optimizer`, priority: 0.9, changeFrequency: 'weekly' as const },
  ] as const;

  // 203 Role Resume Guides (Programmatic SEO & AdSense Content Engine)
  const rolePages = ALL_ROLES_RAW.map((role) => ({
    url: `${baseUrl}/resume-optimizer/${role.slug}`,
    priority: 0.8,
    changeFrequency: 'weekly' as const,
  }));

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

  // Guides & Career Articles (/blog/[slug])
  const guideSlugs = getAllGuideSlugs();
  const guidePages = guideSlugs.map((slug) => ({
    url: `${baseUrl}/blog/${slug}` as const,
    priority: 0.85,
    changeFrequency: 'weekly' as const,
  }));

  // Legal pages — low priority, rarely changes
  const legalSlugs = ['privacy', 'terms', 'cookies', 'contact'];
  const legalPages = legalSlugs.map((slug) => ({
    url: `${baseUrl}/legal/${slug}` as const,
    priority: 0.4,
    changeFrequency: 'yearly' as const,
  }));

  const allPages = [
    ...staticPages,
    ...rolePages,
    ...infoPages,
    ...blogPosts,
    ...guidePages,
    ...legalPages,
  ];

  return allPages.map((page) => ({
    ...page,
    lastModified: new Date(),
  }));
}

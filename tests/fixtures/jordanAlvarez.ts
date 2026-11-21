import type { StructuredResumeContent } from "@/lib/pdf/types";

export const jordanAlvarezResume: StructuredResumeContent = {
  personalInfo: {
    name: "Jordan Alvarez",
    email: "jordan.alvarez@email.com",
    phone: "(555) 123-4567",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/jordanalvarez",
  },
  summary:
    "Product-focused Software Engineer with 5+ years building and scaling web applications used by millions of users. Specializes in React, Node.js, and cloud infrastructure.",
  experience: [
    {
      role: "Senior Software Engineer",
      company: "Northwind Digital",
      duration: "Jan 2022 – Present",
      bullets: [
        "Led migration of monolith checkout service to microservices, reducing p99 latency from 800ms to 210ms",
        "Built real-time inventory sync system handling 2M+ events/day across 40 regional warehouses",
        "Mentored 4 junior engineers; introduced code review standards that cut production incidents by 35%",
      ],
    },
    {
      role: "Software Engineer",
      company: "Brightline Labs",
      duration: "Jun 2019 – Dec 2021",
      bullets: [
        "Shipped customer-facing dashboard used by 15,000+ monthly active users, improving retention by 18%",
        "Reduced CI pipeline runtime from 22 minutes to 6 minutes through test parallelization and caching",
        "Collaborated with design and product to launch 3 major features on a 6-week release cadence",
      ],
    },
  ],
  projects: [],
  education: [
    {
      degree: "B.S. Computer Science",
      institution: "University of Washington",
      year: "2015 – 2019",
    },
  ],
  skills: {
    languages: ["JavaScript", "TypeScript", "Python", "SQL"],
    frameworks: ["React", "Next.js", "Node.js", "Express"],
    tools: ["AWS", "Docker", "PostgreSQL", "GitHub Actions"],
  },
  categorizedSkills: [
    {
      category: "Languages",
      items: ["JavaScript", "TypeScript", "Python", "SQL"],
    },
    {
      category: "Frameworks",
      items: ["React", "Next.js", "Node.js", "Express"],
    },
    {
      category: "Cloud & Tools",
      items: ["AWS", "Docker", "PostgreSQL", "GitHub Actions"],
    },
  ],
};

import { Document, Page, Text, View, Link, StyleSheet } from "@react-pdf/renderer";
import type { StructuredResumeContent } from "../types";
import {
  A4_PAGE_SIZE,
  PDF_COLORS,
  normalizePdfText,
  cleanUrlDisplay,
  formatHref,
  registerFontsOnce,
} from "../shared";

registerFontsOnce();

const styles = StyleSheet.create({
  page: {
    width: A4_PAGE_SIZE.width,
    height: A4_PAGE_SIZE.height,
    paddingTop: 36,
    paddingBottom: 40,
    backgroundColor: "#FFFFFF",
    fontFamily: "Arimo",
    position: "relative",
  },
  // Full-bleed dark sidebar background, fixed across all pages
  sidebarBackground: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 190.5,
    backgroundColor: PDF_COLORS.sidebarBg,
  },
  // Sidebar Header: Name and Contact (Page 1)
  sidebarHeader: {
    position: "absolute",
    left: 20,
    top: 36,
    width: 150.5,
  },
  name: {
    fontSize: 17,
    fontFamily: "Arimo",
    fontWeight: "bold",
    color: PDF_COLORS.white,
    marginBottom: 6,
    lineHeight: 1.15,
  },
  contactItem: {
    fontSize: 8,
    fontFamily: "Arimo",
    color: PDF_COLORS.sidebarText,
    marginBottom: 4.5,
    textDecoration: "none",
  },
  contactItemMuted: {
    fontSize: 8,
    fontFamily: "Arimo",
    color: PDF_COLORS.sidebarMuted,
    marginBottom: 4.5,
  },
  // Main Column: Starts at x=216.5, width: 353.5
  mainColumn: {
    marginLeft: 216.5,
    marginRight: 25.28,
    paddingTop: 14,
  },
  mainSection: {
    marginBottom: 20,
  },
  mainSectionHeading: {
    fontSize: 9.5,
    fontFamily: "Arimo",
    fontWeight: "bold",
    color: PDF_COLORS.title,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 9,
    fontFamily: "Arimo",
    color: PDF_COLORS.body,
    lineHeight: 1.45,
  },
  entryBlock: {
    marginBottom: 14,
  },
  roleLine: {
    fontSize: 10,
    fontFamily: "Arimo",
    fontWeight: "bold",
    color: PDF_COLORS.title,
    marginBottom: 2,
  },
  dateLine: {
    fontSize: 9,
    fontFamily: "Arimo",
    color: PDF_COLORS.body,
    marginBottom: 4,
    textAlign: "left",
  },
  mainBulletRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  mainBulletSymbol: {
    width: 12,
    fontSize: 9,
    fontFamily: "Arimo",
    color: PDF_COLORS.grayBullet,
  },
  mainBulletText: {
    flex: 1,
    fontSize: 9,
    fontFamily: "Arimo",
    color: PDF_COLORS.body,
    lineHeight: 1.4,
  },
  // Sidebar Body: Education & Skills (rendered after main column for ATS reading order)
  sidebarBody: {
    position: "absolute",
    left: 20,
    top: 154.9,
    width: 150.5,
  },
  sidebarSection: {
    marginBottom: 20,
  },
  sidebarSectionLabel: {
    fontSize: 8.5,
    fontFamily: "Arimo",
    fontWeight: "bold",
    color: PDF_COLORS.sidebarLabel,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  eduTitle: {
    fontSize: 10,
    fontFamily: "Arimo",
    fontWeight: "bold",
    color: PDF_COLORS.sidebarTitle,
    marginBottom: 2,
    lineHeight: 1.25,
  },
  eduDates: {
    fontSize: 8.5,
    fontFamily: "Arimo",
    color: PDF_COLORS.sidebarText,
    marginBottom: 8,
  },
  sidebarBulletRow: {
    flexDirection: "row",
    marginBottom: 4.5,
  },
  sidebarBulletSymbol: {
    width: 12,
    fontSize: 9,
    fontFamily: "Arimo",
    color: PDF_COLORS.grayBullet,
  },
  sidebarBulletText: {
    flex: 1,
    fontSize: 9,
    fontFamily: "Arimo",
    color: PDF_COLORS.sidebarText,
    lineHeight: 1.35,
  },
  categoryLabel: {
    fontFamily: "Arimo",
    fontWeight: "bold",
    color: PDF_COLORS.sidebarText,
  },
});

export function TwoColumnTemplate({ data }: { data: StructuredResumeContent }) {
  const { personalInfo, summary, experience, projects, education, skills, categorizedSkills, certifications, achievements } = data;

  // Build contact items
  const contactLinks: Array<{ text: string; href?: string; muted?: boolean }> = [];
  if (personalInfo.email?.trim()) {
    contactLinks.push({
      text: normalizePdfText(personalInfo.email),
      href: formatHref(`mailto:${personalInfo.email.trim()}`),
    });
  }
  if (personalInfo.phone?.trim()) {
    contactLinks.push({
      text: normalizePdfText(personalInfo.phone),
      href: formatHref(`tel:${personalInfo.phone.trim()}`),
      muted: true,
    });
  }
  if (personalInfo.location?.trim()) {
    contactLinks.push({
      text: normalizePdfText(personalInfo.location),
      muted: true,
    });
  }
  if (personalInfo.linkedin?.trim()) {
    contactLinks.push({
      text: cleanUrlDisplay(personalInfo.linkedin),
      href: formatHref(personalInfo.linkedin),
    });
  }
  if (personalInfo.github?.trim()) {
    contactLinks.push({
      text: cleanUrlDisplay(personalInfo.github),
      href: formatHref(personalInfo.github),
    });
  }
  if (personalInfo.portfolio?.trim()) {
    contactLinks.push({
      text: cleanUrlDisplay(personalInfo.portfolio),
      href: formatHref(personalInfo.portfolio),
    });
  }

  // Derive skill lines
  const skillLines: Array<{ category: string; items: string }> = [];
  if (categorizedSkills && categorizedSkills.length > 0) {
    for (const cat of categorizedSkills) {
      if (cat.items && cat.items.length > 0) {
        skillLines.push({
          category: normalizePdfText(cat.category),
          items: normalizePdfText(cat.items.join(", ")),
        });
      }
    }
  } else {
    if (skills.languages && skills.languages.length > 0) {
      skillLines.push({
        category: "Languages",
        items: normalizePdfText(skills.languages.join(", ")),
      });
    }
    if (skills.frameworks && skills.frameworks.length > 0) {
      skillLines.push({
        category: "Frameworks",
        items: normalizePdfText(skills.frameworks.join(", ")),
      });
    }
    if (skills.tools && skills.tools.length > 0) {
      skillLines.push({
        category: "Cloud & Tools",
        items: normalizePdfText(skills.tools.join(", ")),
      });
    }
    if (skills.databases && skills.databases.length > 0) {
      skillLines.push({
        category: "Databases",
        items: normalizePdfText(skills.databases.join(", ")),
      });
    }
  }

  return (
    <Document
      title={`${normalizePdfText(personalInfo.name)} - Resume`}
      author={normalizePdfText(personalInfo.name)}
      creator="ResumeFlow"
      producer="ResumeFlow Engine"
    >
      <Page size="A4" style={styles.page}>
        {/* 1. Sidebar Background (fixed on every page, decorative) */}
        <View style={styles.sidebarBackground} fixed />

        {/* 2. Sidebar Header: Name and Contact (Page 1) */}
        <View style={styles.sidebarHeader}>
          <Text style={styles.name}>{normalizePdfText(personalInfo.name)}</Text>
          {contactLinks.map((item, idx) =>
            item.href ? (
              <Link key={idx} src={item.href} style={styles.contactItem}>
                {item.text}
              </Link>
            ) : (
              <Text
                key={idx}
                style={item.muted ? styles.contactItemMuted : styles.contactItem}
              >
                {item.text}
              </Text>
            )
          )}
        </View>

        {/* 3. Main Column: Summary, Experience, Projects (flow naturally) */}
        <View style={styles.mainColumn}>
          {summary?.trim() ? (
            <View style={styles.mainSection}>
              <Text style={styles.mainSectionHeading}>SUMMARY</Text>
              <Text style={styles.summaryText}>{normalizePdfText(summary)}</Text>
            </View>
          ) : null}

          {experience && experience.length > 0 ? (
            <View style={styles.mainSection}>
              <Text style={styles.mainSectionHeading}>EXPERIENCE</Text>
              {experience.map((exp, idx) => (
                <View key={idx} style={styles.entryBlock}>
                  <Text style={styles.roleLine}>
                    {normalizePdfText(`${exp.role} — ${exp.company}`)}
                  </Text>
                  {exp.duration?.trim() ? (
                    <Text style={styles.dateLine}>{normalizePdfText(exp.duration)}</Text>
                  ) : null}
                  {exp.bullets?.map((bullet, bIdx) => (
                    <View key={bIdx} style={styles.mainBulletRow}>
                      <Text style={styles.mainBulletSymbol}>•</Text>
                      <Text style={styles.mainBulletText}>
                        {normalizePdfText(bullet)}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ) : null}

          {projects && projects.length > 0 ? (
            <View style={styles.mainSection}>
              <Text style={styles.mainSectionHeading}>PROJECTS</Text>
              {projects.map((proj, idx) => (
                <View key={idx} style={styles.entryBlock}>
                  <Text style={styles.roleLine}>
                    {normalizePdfText(
                      proj.technologies && proj.technologies.length > 0
                        ? `${proj.name} — ${proj.technologies.join(", ")}`
                        : proj.name
                    )}
                  </Text>
                  {proj.bullets?.map((bullet, bIdx) => (
                    <View key={bIdx} style={styles.mainBulletRow}>
                      <Text style={styles.mainBulletSymbol}>•</Text>
                      <Text style={styles.mainBulletText}>
                        {normalizePdfText(bullet)}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ) : null}

          {certifications && certifications.length > 0 ? (
            <View style={styles.mainSection}>
              <Text style={styles.mainSectionHeading}>CERTIFICATIONS</Text>
              {certifications.map((cert, idx) => (
                <View key={idx} style={styles.mainBulletRow}>
                  <Text style={styles.mainBulletSymbol}>•</Text>
                  <Text style={styles.mainBulletText}>
                    {normalizePdfText(
                      cert.issuer
                        ? `${cert.name} — ${cert.issuer} (${cert.year ?? ""})`
                        : cert.name
                    )}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {achievements && achievements.length > 0 ? (
            <View style={styles.mainSection}>
              <Text style={styles.mainSectionHeading}>ACHIEVEMENTS</Text>
              {achievements.map((ach, idx) => (
                <View key={idx} style={styles.mainBulletRow}>
                  <Text style={styles.mainBulletSymbol}>•</Text>
                  <Text style={styles.mainBulletText}>
                    {normalizePdfText(ach.description)}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {/* 4. Sidebar Body: Education & Skills (Placed LAST in element tree for ATS order) */}
        <View style={styles.sidebarBody}>
          {education && education.length > 0 ? (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarSectionLabel}>EDUCATION</Text>
              {education.map((edu, idx) => (
                <View key={idx}>
                  <Text style={styles.eduTitle}>
                    {normalizePdfText(`${edu.degree} — ${edu.institution}`)}
                  </Text>
                  {edu.year?.trim() ? (
                    <Text style={styles.eduDates}>{normalizePdfText(edu.year)}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}

          {skillLines.length > 0 ? (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarSectionLabel}>SKILLS</Text>
              {skillLines.map((line, idx) => (
                <View key={idx} style={styles.sidebarBulletRow}>
                  <Text style={styles.sidebarBulletSymbol}>•</Text>
                  <Text style={styles.sidebarBulletText}>
                    {line.category}: {line.items}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </Page>
    </Document>
  );
}

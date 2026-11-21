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
    paddingTop: 56,
    paddingLeft: 60,
    paddingRight: 60,
    paddingBottom: 40,
    backgroundColor: "#FFFFFF",
    fontFamily: "Arimo",
  },
  header: {
    marginBottom: 40,
  },
  name: {
    fontSize: 18,
    fontFamily: "Arimo",
    fontWeight: "normal",
    color: PDF_COLORS.ink,
    marginBottom: 10,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  contactItem: {
    fontSize: 8.5,
    fontFamily: "Arimo",
    color: PDF_COLORS.body,
    textDecoration: "none",
  },
  section: {
    marginBottom: 34,
  },
  sectionLabel: {
    fontSize: 8,
    fontFamily: "Arimo",
    fontWeight: "normal",
    color: PDF_COLORS.muted,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 9.5,
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
    fontSize: 9.5,
    fontFamily: "Arimo",
    color: PDF_COLORS.body,
    marginBottom: 6,
    textAlign: "left",
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 3.5,
  },
  dashMarker: {
    width: 14,
    fontSize: 9.5,
    fontFamily: "Arimo",
    color: PDF_COLORS.muted,
  },
  bulletText: {
    flex: 1,
    fontSize: 9.5,
    fontFamily: "Arimo",
    color: PDF_COLORS.body,
    lineHeight: 1.38,
  },
  skillCategoryBold: {
    fontFamily: "Arimo",
    fontWeight: "bold",
    color: PDF_COLORS.title,
  },
});

export function MinimalTemplate({ data }: { data: StructuredResumeContent }) {
  const { personalInfo, summary, experience, projects, education, skills, categorizedSkills, certifications, achievements } = data;

  // Build contact items
  const contactLinks: Array<{ text: string; href?: string }> = [];
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
    });
  }
  if (personalInfo.location?.trim()) {
    contactLinks.push({
      text: normalizePdfText(personalInfo.location),
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{normalizePdfText(personalInfo.name)}</Text>
          <View style={styles.contactRow}>
            {contactLinks.map((item, idx) =>
              item.href ? (
                <Link key={idx} src={item.href} style={styles.contactItem}>
                  {item.text}
                </Link>
              ) : (
                <Text key={idx} style={styles.contactItem}>
                  {item.text}
                </Text>
              )
            )}
          </View>
        </View>

        {/* Summary */}
        {summary?.trim() ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>SUMMARY</Text>
            <Text style={styles.summaryText}>{normalizePdfText(summary)}</Text>
          </View>
        ) : null}

        {/* Experience */}
        {experience && experience.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>EXPERIENCE</Text>
            {experience.map((exp, idx) => (
              <View key={idx} style={styles.entryBlock}>
                <Text style={styles.roleLine}>
                  {normalizePdfText(`${exp.role} — ${exp.company}`)}
                </Text>
                {exp.duration?.trim() ? (
                  <Text style={styles.dateLine}>{normalizePdfText(exp.duration)}</Text>
                ) : null}
                {exp.bullets?.map((bullet, bIdx) => (
                  <View key={bIdx} style={styles.bulletRow}>
                    <Text style={styles.dashMarker}>—</Text>
                    <Text style={styles.bulletText}>{normalizePdfText(bullet)}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {/* Projects */}
        {projects && projects.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>PROJECTS</Text>
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
                  <View key={bIdx} style={styles.bulletRow}>
                    <Text style={styles.dashMarker}>—</Text>
                    <Text style={styles.bulletText}>{normalizePdfText(bullet)}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {/* Education */}
        {education && education.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>EDUCATION</Text>
            {education.map((edu, idx) => (
              <View key={idx} style={styles.entryBlock}>
                <Text style={styles.roleLine}>
                  {normalizePdfText(`${edu.degree} — ${edu.institution}`)}
                </Text>
                {edu.year?.trim() ? (
                  <Text style={styles.dateLine}>{normalizePdfText(edu.year)}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* Skills */}
        {skillLines.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>SKILLS</Text>
            {skillLines.map((line, idx) => (
              <View key={idx} style={styles.bulletRow}>
                <Text style={styles.dashMarker}>—</Text>
                <Text style={styles.bulletText}>
                  {line.category}: {line.items}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Certifications */}
        {certifications && certifications.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>CERTIFICATIONS</Text>
            {certifications.map((cert, idx) => (
              <View key={idx} style={styles.bulletRow}>
                <Text style={styles.dashMarker}>—</Text>
                <Text style={styles.bulletText}>
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

        {/* Achievements */}
        {achievements && achievements.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>ACHIEVEMENTS</Text>
            {achievements.map((ach, idx) => (
              <View key={idx} style={styles.bulletRow}>
                <Text style={styles.dashMarker}>—</Text>
                <Text style={styles.bulletText}>
                  {normalizePdfText(ach.description)}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

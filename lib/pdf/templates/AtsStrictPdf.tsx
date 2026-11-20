"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { StructuredResumeContent } from "../types";

function stripUrl(url: string): string {
  return url.replace(/https?:\/\/(www\.)?/, "");
}

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 52,
    paddingVertical: 44,
    fontFamily: "Times-Roman",
    fontSize: 9.0,
    color: "#000000",
    lineHeight: 1.35,
  },
  headerName: {
    fontSize: 20,
    fontFamily: "Times-Bold",
    textAlign: "center",
    textTransform: "uppercase",
    marginBottom: 4,
    color: "#000000",
  },
  headerContact: {
    fontSize: 8.5,
    fontFamily: "Helvetica",
    textAlign: "center",
    marginBottom: 10,
    color: "#1e293b",
  },
  sectionTitle: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1.8,
    borderBottomWidth: 0.75,
    borderBottomColor: "#000000",
    borderBottomStyle: "solid",
    paddingBottom: 2,
    marginTop: 8,
    marginBottom: 4,
    color: "#000000",
  },
  summaryText: {
    fontFamily: "Times-Roman",
    fontSize: 9.0,
    lineHeight: 1.35,
    textAlign: "justify",
    marginBottom: 4,
    color: "#111827",
  },
  entryTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
    marginTop: 3,
    marginBottom: 2,
    color: "#000000",
  },
  bulletList: {
    marginLeft: 0,
    marginTop: 1,
    marginBottom: 3,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 2,
  },
  bulletSymbol: {
    width: 10,
    fontSize: 9.0,
    fontFamily: "Times-Roman",
    color: "#000000",
  },
  bulletText: {
    flex: 1,
    fontSize: 9.0,
    fontFamily: "Times-Roman",
    textAlign: "justify",
    lineHeight: 1.32,
    color: "#111827",
  },
  skillsRow: {
    flexDirection: "row",
    marginBottom: 2,
    fontSize: 9.0,
    flexWrap: "wrap",
  },
  skillsLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9.0,
    color: "#000000",
  },
  skillsValue: {
    fontFamily: "Times-Roman",
    fontSize: 9.0,
    color: "#111827",
  },
});

export function AtsStrictPdf({
  data,
}: {
  data: StructuredResumeContent;
  templateId?: string;
}) {
  const contactParts = [
    data.personalInfo.phone?.trim(),
    data.personalInfo.email?.trim(),
    data.personalInfo.linkedin
      ? stripUrl(data.personalInfo.linkedin).trim()
      : null,
    data.personalInfo.github ? stripUrl(data.personalInfo.github).trim() : null,
    data.personalInfo.portfolio
      ? stripUrl(data.personalInfo.portfolio).trim()
      : null,
  ].filter((part): part is string => !!part && part.trim().length > 0);

  // Grouped skills for the master layout
  const skillCategories = data.categorizedSkills || [
    data.skills.languages?.length
      ? { category: "Languages", items: data.skills.languages }
      : null,
    data.skills.frameworks?.length
      ? { category: "AI & Machine Learning", items: data.skills.frameworks }
      : null,
    data.skills.tools?.length
      ? { category: "LLMs & Agents", items: data.skills.tools }
      : null,
    data.skills.databases?.length
      ? { category: "AI Safety & Security", items: data.skills.databases }
      : null,
    data.skills.soft?.length
      ? { category: "MLOps & Deployment", items: data.skills.soft }
      : null,
  ].filter((c): c is { category: string; items: string[] } => !!c && c.items.length > 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ─── Header: Name & Contact ────────────────────────── */}
        <Text style={styles.headerName}>{data.personalInfo.name}</Text>
        <Text style={styles.headerContact}>{contactParts.join("  ·  ")}</Text>

        {/* ─── 1. Professional Summary ───────────────────────── */}
        {data.summary ? (
          <View wrap={false}>
            <Text style={styles.sectionTitle}>P R O F E S S I O N A L  S U M M A R Y</Text>
            <Text style={styles.summaryText}>{data.summary}</Text>
          </View>
        ) : null}

        {/* ─── 2. Experience ─────────────────────────────────── */}
        {data.experience && data.experience.length > 0 ? (
          <View>
            <Text style={styles.sectionTitle}>E X P E R I E N C E</Text>
            {data.experience.map((exp, index) => {
              const titleLine = [
                exp.role,
                exp.company,
                exp.duration,
                exp.location,
              ]
                .filter(Boolean)
                .join(" | ");

              return (
                <View key={`exp-${index}`} style={{ marginBottom: 4 }} wrap={false}>
                  <Text style={styles.entryTitle}>{titleLine}</Text>
                  <View style={styles.bulletList}>
                    {exp.bullets.map((bullet, bIdx) => (
                      <View key={`exp-b-${index}-${bIdx}`} style={styles.bulletItem}>
                        <Text style={styles.bulletSymbol}>•</Text>
                        <Text style={styles.bulletText}>{bullet}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}

        {/* ─── 3. Projects ───────────────────────────────────── */}
        {data.projects && data.projects.length > 0 ? (
          <View>
            <Text style={styles.sectionTitle}>P R O J E C T S</Text>
            {data.projects.map((proj, index) => {
              const techString = proj.technologies?.join(", ") || "";
              const titleLine = [
                proj.name,
                techString,
                proj.link ? "GitHub" : null,
              ]
                .filter(Boolean)
                .join(" | ");

              return (
                <View key={`proj-${index}`} style={{ marginBottom: 4 }} wrap={false}>
                  <Text style={styles.entryTitle}>{titleLine}</Text>
                  <View style={styles.bulletList}>
                    {proj.bullets.map((bullet, bIdx) => (
                      <View key={`proj-b-${index}-${bIdx}`} style={styles.bulletItem}>
                        <Text style={styles.bulletSymbol}>•</Text>
                        <Text style={styles.bulletText}>{bullet}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}

        {/* ─── 4. Research & Publications / Achievements ──────── */}
        {data.publications && data.publications.length > 0 ? (
          <View wrap={false}>
            <Text style={styles.sectionTitle}>R E S E A R C H  &  P U B L I C A T I O N S</Text>
            <View style={styles.bulletList}>
              {data.publications.map((pub, index) => {
                const pubText =
                  typeof pub === "string"
                    ? pub
                    : `${pub.title}${pub.venue ? `: ${pub.venue}` : ""}${pub.description ? `. ${pub.description}` : ""}`;

                return (
                  <View key={`pub-${index}`} style={styles.bulletItem}>
                    <Text style={styles.bulletSymbol}>•</Text>
                    <Text style={styles.bulletText}>{pubText}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        ) : data.achievements && data.achievements.length > 0 ? (
          <View wrap={false}>
            <Text style={styles.sectionTitle}>R E S E A R C H  &  A C H I E V E M E N T S</Text>
            <View style={styles.bulletList}>
              {data.achievements.map((ach, index) => (
                <View key={`ach-${index}`} style={styles.bulletItem}>
                  <Text style={styles.bulletSymbol}>•</Text>
                  <Text style={styles.bulletText}>{ach.description}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* ─── 5. Education ──────────────────────────────────── */}
        {data.education && data.education.length > 0 ? (
          <View wrap={false}>
            <Text style={styles.sectionTitle}>E D U C A T I O N</Text>
            {data.education.map((edu, index) => {
              const eduLine = [
                edu.degree,
                edu.institution,
                edu.year,
                edu.gpa ? `CGPA: ${edu.gpa}` : null,
              ]
                .filter(Boolean)
                .join(" | ");

              return (
                <View key={`edu-${index}`} style={{ marginBottom: 3 }}>
                  <Text style={styles.entryTitle}>{eduLine}</Text>
                </View>
              );
            })}
          </View>
        ) : null}

        {/* ─── 6. Skills ─────────────────────────────────────── */}
        {skillCategories.length > 0 ? (
          <View wrap={false}>
            <Text style={styles.sectionTitle}>S K I L L S</Text>
            {skillCategories.map((cat, index) => (
              <View key={`cat-${index}`} style={styles.skillsRow}>
                <Text style={styles.skillsLabel}>{cat.category}: </Text>
                <Text style={styles.skillsValue}>{cat.items.join(", ")}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* ─── 7. Certifications ─────────────────────────────── */}
        {data.certifications && data.certifications.length > 0 ? (
          <View wrap={false}>
            <Text style={styles.sectionTitle}>C E R T I F I C A T I O N S</Text>
            <View style={styles.bulletList}>
              {data.certifications.map((cert, index) => {
                const certText = `${cert.name}${cert.issuer ? `, ${cert.issuer}` : ""}${cert.year ? `, ${cert.year}` : ""}${cert.id ? ` (ID: ${cert.id})` : ""}`;
                return (
                  <View key={`cert-${index}`} style={styles.bulletItem}>
                    <Text style={styles.bulletSymbol}>•</Text>
                    <Text style={styles.bulletText}>{certText}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

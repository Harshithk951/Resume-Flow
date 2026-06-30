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

function getStyles(templateId: string) {
  const isSerif = templateId === "ats_strict" || templateId === "modern_executive";
  const fontRegular = isSerif ? "Times-Roman" : "Helvetica";
  const fontBold = isSerif ? "Times-Bold" : "Helvetica-Bold";
  const fontItalic = isSerif ? "Times-Italic" : "Helvetica-Oblique";

  let accentColor = "#000000";
  if (templateId === "modern_professional") {
    accentColor = "#E11D48"; // Rose-600 (Startup Accent)
  } else if (templateId === "modern_executive") {
    accentColor = "#1E3A8A"; // Blue-900 (Finance Classic)
  } else if (templateId === "tech_innovator") {
    accentColor = "#4F46E5"; // Indigo-600 (Tech Modern)
  }

  const isLeftAlign = templateId === "modern_professional" || templateId === "tech_innovator";

  return StyleSheet.create({
    page: {
      padding: 30,
      fontFamily: fontRegular,
      fontSize: 10,
      color: "#000000",
      lineHeight: 1.2,
    },
    headerName: {
      fontSize: 20,
      fontFamily: fontBold,
      textAlign: isLeftAlign ? "left" : "center",
      textTransform: "uppercase",
      color: accentColor !== "#000000" ? accentColor : "#000000",
      marginBottom: 4,
    },
    headerContact: {
      fontSize: 9,
      textAlign: isLeftAlign ? "left" : "center",
      marginBottom: 10,
      color: "#475569",
    },
    sectionTitle: {
      fontSize: 11,
      fontFamily: fontBold,
      textTransform: "uppercase",
      marginTop: 10,
      marginBottom: 3,
      borderBottomWidth: 0.5,
      borderBottomColor: accentColor,
      borderBottomStyle: "solid",
      color: accentColor,
    },
    summaryText: {
      fontSize: 9.5,
      marginBottom: 6,
      textAlign: "justify",
    },
    subheadingRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 4,
      marginBottom: 2,
    },
    boldText: {
      fontFamily: fontBold,
      fontSize: 10,
    },
    italicText: {
      fontFamily: fontItalic,
      fontSize: 9,
    },
    bulletList: {
      marginLeft: 12,
      marginTop: 2,
      marginBottom: 4,
    },
    bulletItem: {
      flexDirection: "row",
      marginBottom: 2,
    },
    bulletPoint: {
      width: 10,
      fontSize: 9,
      color: accentColor !== "#000000" ? accentColor : "#000000",
    },
    bulletText: {
      flex: 1,
      fontSize: 9,
      textAlign: "justify",
    },
    skillsRow: {
      flexDirection: "row",
      marginBottom: 2,
      fontSize: 9.5,
    },
    skillsLabel: {
      fontFamily: fontBold,
      color: accentColor !== "#000000" ? accentColor : "#000000",
    },
  });
}

export function AtsStrictPdf({
  data,
  templateId = "ats_strict",
}: {
  data: StructuredResumeContent;
  templateId?: string;
}) {
  const styles = getStyles(templateId);
  const contactParts = [
    data.personalInfo.phone,
    data.personalInfo.email,
    data.personalInfo.linkedin
      ? stripUrl(data.personalInfo.linkedin)
      : null,
    data.personalInfo.github ? stripUrl(data.personalInfo.github) : null,
    data.personalInfo.portfolio
      ? stripUrl(data.personalInfo.portfolio)
      : null,
  ].filter(Boolean);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.headerName}>{data.personalInfo.name}</Text>
        <Text style={styles.headerContact}>{contactParts.join(" | ")}</Text>

        {data.summary ? (
          <View>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summaryText}>{data.summary}</Text>
          </View>
        ) : null}

        {data.education.length > 0 ? (
          <View>
            <Text style={styles.sectionTitle}>Education</Text>
            {data.education.map((edu, index) => (
              <View key={`edu-${index}`} style={{ marginBottom: 4 }}>
                <View style={styles.subheadingRow}>
                  <Text style={styles.boldText}>{edu.institution}</Text>
                  <Text style={styles.boldText}>{edu.year}</Text>
                </View>
                <View style={styles.subheadingRow}>
                  <Text style={styles.italicText}>
                    {edu.degree}
                    {edu.gpa ? ` | CGPA: ${edu.gpa}` : ""}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {data.skills ? (
          <View>
            <Text style={styles.sectionTitle}>Technical Skills</Text>
            {data.skills.languages.length > 0 ? (
              <View style={styles.skillsRow}>
                <Text style={styles.skillsLabel}>Languages: </Text>
                <Text>{data.skills.languages.join(", ")}</Text>
              </View>
            ) : null}
            <View style={styles.skillsRow}>
              <Text style={styles.skillsLabel}>CS Fundamentals: </Text>
              <Text>
                {data.skills.soft?.join(", ") ||
                  "Data Structures, OOP, DBMS"}
              </Text>
            </View>
            {data.skills.frameworks.length > 0 ? (
              <View style={styles.skillsRow}>
                <Text style={styles.skillsLabel}>Tech Stack: </Text>
                <Text>{data.skills.frameworks.join(", ")}</Text>
              </View>
            ) : null}
            {data.skills.tools.length > 0 ? (
              <View style={styles.skillsRow}>
                <Text style={styles.skillsLabel}>Cloud & DevOps: </Text>
                <Text>{data.skills.tools.join(", ")}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {data.experience.length > 0 ? (
          <View>
            <Text style={styles.sectionTitle}>Experience</Text>
            {data.experience.map((exp, index) => (
              <View key={`exp-${index}`} style={{ marginBottom: 6 }}>
                <View style={styles.subheadingRow}>
                  <Text style={styles.boldText}>{exp.company}</Text>
                  <Text style={styles.boldText}>{exp.duration}</Text>
                </View>
                <View style={styles.subheadingRow}>
                  <Text style={styles.italicText}>{exp.role}</Text>
                  <Text style={styles.italicText}>
                    {exp.location || "Remote"}
                  </Text>
                </View>
                <View style={styles.bulletList}>
                  {exp.bullets.slice(0, 3).map((bullet, bIdx) => (
                    <View key={`exp-b-${index}-${bIdx}`} style={styles.bulletItem}>
                      <Text style={styles.bulletPoint}>•</Text>
                      <Text style={styles.bulletText}>{bullet}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {data.projects.length > 0 ? (
          <View>
            <Text style={styles.sectionTitle}>Projects</Text>
            {data.projects.map((proj, index) => (
              <View key={`proj-${index}`} style={{ marginBottom: 6 }}>
                <View style={styles.subheadingRow}>
                  <Text style={styles.boldText}>
                    {proj.name} |{" "}
                    <Text style={styles.italicText}>
                      {proj.technologies.join(", ")}
                    </Text>
                  </Text>
                  {proj.link ? (
                    <Text style={styles.boldText}>GitHub</Text>
                  ) : null}
                </View>
                <View style={styles.bulletList}>
                  {proj.bullets.slice(0, 3).map((bullet, bIdx) => (
                    <View key={`proj-b-${index}-${bIdx}`} style={styles.bulletItem}>
                      <Text style={styles.bulletPoint}>•</Text>
                      <Text style={styles.bulletText}>{bullet}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

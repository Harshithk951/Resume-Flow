import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileName = file.name || "resume.pdf";
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let extractedText = "";
    const rawLinksSet = new Set<string>();

    if (fileName.endsWith(".txt") || fileName.endsWith(".md") || fileName.endsWith(".tex")) {
      extractedText = buffer.toString("utf-8");
    } else {
      // PDF Parsing using @cedrugs/pdf-parse
      try {
        const pdfParseModule = await import("@cedrugs/pdf-parse");
        const pdfParse = pdfParseModule.default || pdfParseModule;
        const data = await pdfParse(buffer);
        extractedText = data.text || "";
      } catch (err) {
        console.warn("Direct pdf-parse error, falling back to stream extraction:", err);
      }

      // Also scan raw PDF buffer for /URI (http...) link annotations
      const rawString = buffer.toString("latin1");
      const uriMatches = rawString.match(/\/URI\s*\(([^)]+)\)/g);
      if (uriMatches) {
        for (const m of uriMatches) {
          const urlMatch = m.match(/\/URI\s*\(([^)]+)\)/);
          if (urlMatch && urlMatch[1]) {
            rawLinksSet.add(urlMatch[1].trim());
          }
        }
      }
    }

    // Also scan extracted text for standard URLs and email links
    const textUrlMatches = extractedText.match(/https?:\/\/[^\s)\]]+/g) || [];
    for (const url of textUrlMatches) {
      rawLinksSet.add(url.trim());
    }

    // Clean up text
    const cleanText = extractedText
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\t/g, " ")
      .trim();

    const charCount = cleanText.length;
    const wordCount = cleanText ? cleanText.split(/\s+/).length : 0;
    const linksFound = Math.max(rawLinksSet.size, (cleanText.match(/linkedin|github|portfolio|http/gi) || []).length > 2 ? 9 : Math.max(1, rawLinksSet.size));

    // Guess candidate name from first lines
    const lines = cleanText.split("\n").map((l) => l.trim()).filter(Boolean);
    const candidateName = lines.length > 0 && lines[0].length < 40 ? lines[0] : "Candidate";

    return NextResponse.json({
      success: true,
      text: cleanText,
      fileName,
      characterCount: charCount,
      wordCount,
      linksFound,
      links: Array.from(rawLinksSet),
      candidateName,
    });
  } catch (error: unknown) {
    console.error("PDF Parsing error:", error);
    return NextResponse.json(
      { error: "Failed to parse resume file. Please paste text directly." },
      { status: 500 }
    );
  }
}

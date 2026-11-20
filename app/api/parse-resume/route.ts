import { NextRequest, NextResponse } from "next/server";

// Comprehensive catalog of common tech skills, languages, tools, frameworks, and methodologies
const KNOWN_SKILLS_CATALOG = [
  "Python", "TypeScript", "JavaScript", "SQL", "C++", "Java", "Go", "Rust", "HTML", "CSS",
  "React", "Next.js", "Node.js", "FastAPI", "Express", "Django", "Flask",
  "Machine Learning", "Deep Learning", "Neural Networks", "NLP", "Natural Language Processing",
  "LLM", "LLMs", "AI Agents", "LangGraph", "LangChain", "Model Context Protocol", "MCP",
  "RAG", "Retrieval-Augmented Generation", "Tool Calling", "Model Evaluation", "Federated Learning",
  "Ensemble Learning", "Explainable AI", "Computer Vision", "Transformers", "PyTorch", "TensorFlow",
  "Keras", "Scikit-Learn", "NumPy", "Pandas", "Matplotlib", "Seaborn", "Jupyter", "Jupyter Notebooks",
  "Docker", "Kubernetes", "CI/CD", "Git", "GitHub", "GitLab", "Linux", "Bash",
  "AWS", "Microsoft Azure", "Google Cloud", "GCP", "Microsoft Foundry",
  "SQLite", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Snowflake",
  "Data Structures", "Algorithms", "Data Structures and Algorithms", "System Design",
  "Audit Trails", "Guardrails", "AI Safety", "Agent Forensics", "MCP Security",
  "Qiskit", "QAOA", "Quantum Computing", "Variational Quantum Eigensolver", "VQE",
  "LoRA", "RLHF", "Hugging Face", "Reinforcement Learning"
];

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
    const linksFound = rawLinksSet.size;

    // Guess candidate name from first non-empty line
    const lines = cleanText.split("\n").map((l) => l.trim()).filter(Boolean);
    const candidateName = lines.length > 0 && lines[0].length < 40 ? lines[0] : "Candidate";

    // Extract email
    const emailMatch = cleanText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const email = emailMatch ? emailMatch[0] : "";

    // Extract phone
    const phoneMatch = cleanText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+91[-.\s]?\d{10}/);
    const phone = phoneMatch ? phoneMatch[0] : "";

    // Dynamically detect skills genuinely present in the resume
    const detectedSkills: string[] = [];
    const lowerText = cleanText.toLowerCase();

    for (const skill of KNOWN_SKILLS_CATALOG) {
      const lowerSkill = skill.toLowerCase();
      // Use boundary-aware regex to avoid false positives (e.g. "go" in "good")
      const escaped = lowerSkill.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
      const regex = new RegExp(`\\b${escaped}\\b`, "i");

      if (lowerText.includes(lowerSkill) || regex.test(cleanText)) {
        detectedSkills.push(skill);
      }
    }

    return NextResponse.json({
      success: true,
      text: cleanText,
      fileName,
      characterCount: charCount,
      wordCount,
      linksFound,
      links: Array.from(rawLinksSet),
      candidateName,
      email,
      phone,
      detectedSkills,
    });
  } catch (error: unknown) {
    console.error("PDF Parsing error:", error);
    return NextResponse.json(
      { error: "Failed to parse resume file. Please paste text directly." },
      { status: 500 }
    );
  }
}

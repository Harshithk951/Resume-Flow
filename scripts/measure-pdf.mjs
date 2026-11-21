import fs from "fs";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

const files = [
  "tests/fixtures/templates/minimal-resume-template.pdf",
  "tests/fixtures/templates/modern-resume-template.pdf",
  "tests/fixtures/templates/classic-professional-resume-template.pdf",
  "tests/fixtures/templates/two-column-resume-template.pdf",
];

async function measurePdf(filePath) {
  console.log(`\n======================================================`);
  console.log(`MEASURING: ${filePath}`);
  console.log(`======================================================`);

  const data = new Uint8Array(fs.readFileSync(filePath));
  const doc = await pdfjs.getDocument({ data, useSystemFonts: true, disableFontFace: false }).promise;

  console.log(`Num pages: ${doc.numPages}`);

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const view = page.view; // [x, y, width, height]
    console.log(`Page ${i} ViewBox: [${view.join(", ")}] (Width: ${view[2] - view[0]} pt, Height: ${view[3] - view[1]} pt)`);

    const textContent = await page.getTextContent();
    console.log(`Items count: ${textContent.items.length}`);

    // Sort items top-to-bottom, left-to-right
    // In PDF, Y=0 is bottom, Y=view[3] is top
    const pageHeight = view[3] - view[1];
    const items = textContent.items
      .filter((item) => "str" in item && item.str.trim().length > 0)
      .map((item) => {
        const x = item.transform[4];
        const yFromBottom = item.transform[5];
        const yFromTop = pageHeight - yFromBottom;
        const fontSize = Math.hypot(item.transform[0], item.transform[1]); // scaleX
        return {
          str: item.str,
          x: Math.round(x * 10) / 10,
          yFromTop: Math.round(yFromTop * 10) / 10,
          fontSize: Math.round(fontSize * 10) / 10,
          fontName: item.fontName,
          width: Math.round(item.width * 10) / 10,
          height: Math.round(item.height * 10) / 10,
        };
      });

    // Group into visual lines (yFromTop within 3pt)
    const lines = [];
    for (const item of items) {
      let line = lines.find((l) => Math.abs(l.y - item.yFromTop) < 3);
      if (!line) {
        line = { y: item.yFromTop, items: [] };
        lines.push(line);
      }
      line.items.push(item);
    }

    lines.sort((a, b) => a.y - b.y);

    console.log(`--- First 25 text lines (y from top, x, font, size, text) ---`);
    for (const l of lines.slice(0, 25)) {
      l.items.sort((a, b) => a.x - b.x);
      const text = l.items.map((it) => it.str).join(" ");
      const first = l.items[0];
      console.log(`y=${l.y.toFixed(1)}pt | x=${first.x.toFixed(1)}pt | font=${first.fontName} | sz=${first.fontSize}pt | "${text}"`);
    }
  }
}

async function main() {
  for (const f of files) {
    if (fs.existsSync(f)) {
      await measurePdf(f);
    } else {
      console.log(`File not found: ${f}`);
    }
  }
}

main().catch(console.error);

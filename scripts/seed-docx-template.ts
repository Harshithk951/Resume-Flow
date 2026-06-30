// scripts/seed-docx-template.ts
import { ConvexClient } from "convex/browser";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

async function seedDocxTemplate() {
  const filePath = path.join(
    process.cwd(),
    "assets",
    "base-resume-template.docx"
  );
  if (!fs.existsSync(filePath)) {
    console.error("❌ Missing: assets/base-resume-template.docx");
    process.exit(1);
  }

  const secret = process.env.AUTOMATION_WEBHOOK_SECRET || "";
  
  // Call the system upload mutation with our local secret
  const uploadUrl = await client.mutation("profiles:generateSystemUploadUrl" as any, { secret });
  const fileBuffer = fs.readFileSync(filePath);

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
    body: fileBuffer,
  });

  const { storageId } = await response.json();
  console.log(`\n✅ Template seeded successfully.`);
  console.log(`storageId: ${storageId}`);
  console.log(
    "→ Save this as DOCX_TEMPLATE_STORAGE_ID in your Convex env vars."
  );
}

seedDocxTemplate();

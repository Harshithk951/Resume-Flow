const { OpenAI } = require("openai");

const apiKey = "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";
const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

async function main() {
  console.log("Listing available models from NVIDIA NIM...");
  try {
    const models = await openai.models.list();
    console.log("Found models count:", models.data.length);
    models.data.slice(0, 30).forEach(m => {
      console.log("- " + m.id);
    });
  } catch (err) {
    console.error("Failed to list models:", err);
  }
}

main();

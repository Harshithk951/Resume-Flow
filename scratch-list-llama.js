const { OpenAI } = require("openai");

const apiKey = "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";
const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

async function main() {
  try {
    const models = await openai.models.list();
    console.log("ALL Llama/Meta Models:");
    models.data
      .filter(m => m.id.toLowerCase().includes("llama") || m.id.toLowerCase().includes("meta"))
      .forEach(m => {
        console.log("- " + m.id);
      });
  } catch (err) {
    console.error("Failed to list models:", err);
  }
}

main();

const { OpenAI } = require("openai");

const apiKey = "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";
const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

async function main() {
  console.log("Sending diagnostic request to NVIDIA NIM...");
  try {
    const start = Date.now();
    const completion = await openai.chat.completions.create({
      model: "meta/llama-3.2-90b-vision-instruct",
      messages: [
        { role: "user", content: "Hello! Reply with exactly the word 'Pong'." }
      ],
      max_tokens: 10,
    });
    console.log(`Success in ${Date.now() - start}ms:`, completion.choices[0].message.content);
  } catch (err) {
    console.error("Failed to connect to NVIDIA NIM:", err);
  }
}

main();

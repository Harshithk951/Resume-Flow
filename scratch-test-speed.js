const { OpenAI } = require("openai");

const apiKey = "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";
const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

async function testModel(modelName) {
  console.log(`Testing model: ${modelName}...`);
  try {
    const start = Date.now();
    const completion = await openai.chat.completions.create({
      model: modelName,
      messages: [
        { role: "user", content: "Hello! Reply with exactly 'Pong'." }
      ],
      max_tokens: 5,
    });
    console.log(`✅ ${modelName} responded in ${Date.now() - start}ms: "${completion.choices[0].message.content.trim()}"`);
    return true;
  } catch (err) {
    console.error(`❌ ${modelName} failed:`, err.message);
    return false;
  }
}

async function main() {
  await testModel("meta/llama-3.3-70b-instruct");
  await testModel("meta/llama-3.1-70b-instruct");
  await testModel("meta/llama-3.1-8b-instruct");
  await testModel("meta/llama-3.2-11b-vision-instruct");
  await testModel("meta/llama-3.2-90b-vision-instruct");
}

main();

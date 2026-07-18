import { action } from "../_generated/server";
import OpenAI from "openai";
import { ConvexError } from "convex/values";

export const test = action({
  args: {},
  handler: async (ctx) => {
    const apiKey = process.env.NVIDIA_NIM_API_KEY;
    if (!apiKey) {
      console.error("❌ DIAGNOSTIC: NVIDIA_NIM_API_KEY is missing from Convex env.");
      return { success: false, error: "NVIDIA_NIM_API_KEY is missing." };
    }

    console.log("🔌 DIAGNOSTIC: Initiating connection test to integrate.api.nvidia.com...");
    
    const client = new OpenAI({
      baseURL: "https://integrate.api.nvidia.com/v1",
      apiKey: apiKey,
    });

    try {
      const start = Date.now();
      const response = await client.chat.completions.create({
        model: "meta/llama-3.2-11b-vision-instruct",
        messages: [{ role: "user", content: "Ping" }],
        max_tokens: 5,
      });
      const duration = Date.now() - start;
      console.log(`✅ Llama-3.3-70b response in ${duration}ms:`, response.choices[0].message.content);
      
      console.log("✅ DIAGNOSTIC SUCCESS: Connected cleanly to NVIDIA NIM!");
      console.log("Response:", response.choices[0].message.content);
      return { success: true, message: "Connection successful!" };
    } catch (error: any) {
      console.error("❌ DIAGNOSTIC FAILED: NVIDIA NIM rejected the request.");
      console.error("Status Code:", error.status);
      console.error("Error Message:", error.message);
      console.error("Full Error Object:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
      
      throw new ConvexError({
        status: error.status || "Unknown",
        message: error.message || "Network Connection Failed",
      });
    }
  },
});

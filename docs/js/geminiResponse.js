import { GoogleGenAI } from "@google/genai";
import { config } from "dotenv";

config();

const ai = new GoogleGenAI({ apiKey: process.env.GoogleGenAI_API_KEY });

async function main() {
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: "Explain how AI works in a few words",
    });
    console.log(response.text);
}

await main();

import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

// ES modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Setup Proxy
import { setGlobalDispatcher, ProxyAgent } from 'undici';
const PROXY_URL = 'http://127.0.0.1:10808'; // Based on your screenshot

console.log(`🔌 Configuring Proxy: ${PROXY_URL}`);
const dispatcher = new ProxyAgent(PROXY_URL);
setGlobalDispatcher(dispatcher);

const apiKey = process.env.GEMINI_API_KEY;

console.log("Testing API Key...");

if (!apiKey) {
    console.error("❌ ERROR: GEMINI_API_KEY is not defined in .env.local");
    process.exit(1);
}

console.log(`API Key found: ${apiKey.substring(0, 5)}...`);

const client = new GoogleGenAI({ apiKey });

async function testConnection() {
    try {
        console.log("Sending test request to Gemini 2.0 Flash Exp...");
        const response = await client.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: {
                parts: [{ text: "Hello, reply with 'OK' if you can see this." }]
            }
        });

        const text = response.candidates[0].content.parts[0].text;
        console.log("✅ API Connection Successful!");
        console.log("Response:", text);
    } catch (error) {
        console.error("❌ API Connection Failed:");
        if (error.message && error.message.includes("fetch failed")) {
            console.error("\n🚨 网络连接错误 (Network Error)");
            console.error("这通常是因为无法连接到 Google 服务器 (GFW 阻断)。");
            console.error("请尝试在运行脚本前设置代理，例如 (假设你的代理端口是 7890):");
            console.error("export https_proxy=http://127.0.0.1:7890 && node scripts/test-api.js");
        } else {
             if (error.message) console.error(error.message);
             else console.error(error);
        }
    }
}

testConnection();

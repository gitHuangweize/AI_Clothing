import { GoogleGenAI } from "@google/genai";
import { MODEL_NAME } from "../../constants";
import { setGlobalDispatcher, ProxyAgent } from 'undici';

// 简单的代理配置逻辑
const configureProxy = () => {
  // 如果有环境变量，优先使用
  if (process.env.HTTPS_PROXY) {
    setGlobalDispatcher(new ProxyAgent(process.env.HTTPS_PROXY));
    console.log(`[Proxy] Using configured proxy: ${process.env.HTTPS_PROXY}`);
    return;
  }

  // 如果是开发环境且没有环境变量，尝试默认的 Clash/Proxy 端口
  // 注意：这可能会影响没有代理的用户，但在中国开发这通常是必须的
  // 我们可以通过检查连接来决定，但这里先简单处理，仅在 fetch 失败时提示
  // 或者我们可以默认开启一个常见端口的代理，如果用户不需要代理，这会导致连接本地失败吗？不会，ProxyAgent 只拦截 http/https
  
  // 为了安全，我们还是只在显式设置或特定条件下启用。
  // 但为了解决用户的燃眉之急，我添加一个回退机制：
  // 如果在本地开发 (通常 netlify dev 会设置某些变量，或者我们假定本地)，尝试 7890
  
  // 更好的方式是让 catch 块处理，如果失败提示设置代理。
};

// 在文件顶部执行
if (process.env.NODE_ENV !== 'production') {
    // 尝试设置常见的代理端口，如果你的代理端口不是 7890，请在 .env.local 设置 HTTPS_PROXY
    const proxyUrl = process.env.HTTPS_PROXY || 'http://127.0.0.1:10808';
    try {
        setGlobalDispatcher(new ProxyAgent(proxyUrl));
        console.log(`[Dev] Setting global proxy to ${proxyUrl}`);
    } catch (e) {
        console.warn("[Dev] Failed to set proxy agent", e);
    }
}

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Missing prompt" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Server configuration error: API Key missing" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const ai = new GoogleGenAI({ apiKey });
  
    const enhancedPrompt = `A high-quality, flat-lay or mannequin style product photography of a piece of clothing: ${prompt}. White background, studio lighting, clear details.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [{ text: enhancedPrompt }],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          const base64Image = `data:image/png;base64,${part.inlineData.data}`;
          return new Response(JSON.stringify({ output: base64Image }), {
            headers: { "Content-Type": "application/json" },
          });
        }
      }
    }
    
    throw new Error("No clothes image generated.");

  } catch (error: any) {
    console.error("Gemini Clothes Gen Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

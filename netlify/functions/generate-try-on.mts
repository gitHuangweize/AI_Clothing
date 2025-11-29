import { GoogleGenAI } from "@google/genai";
import { MODEL_NAME } from "../../constants";


const stripBase64Header = (base64Str: string): string => {
  if (!base64Str.startsWith('data:')) return base64Str;
  return base64Str.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
};

const getMimeTypeFromBase64 = (base64Str: string): string => {
  const match = base64Str.match(/^data:image\/(png|jpeg|jpg|webp);base64,/);
  if (match && match[1]) {
    return `image/${match[1]}`;
  }
  return 'image/png'; // Default
};

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { personBase64, clothesBase64 } = await req.json();

    if (!personBase64 || !clothesBase64) {
      return new Response(JSON.stringify({ error: "Missing images" }), {
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

    const personPart = {
      inlineData: {
        data: stripBase64Header(personBase64),
        mimeType: getMimeTypeFromBase64(personBase64),
      },
    };

    const clothesPart = {
      inlineData: {
        data: stripBase64Header(clothesBase64),
        mimeType: getMimeTypeFromBase64(clothesBase64),
      },
    };

    const textPart = {
      text: "Generate a realistic, high-quality full-body photo of the person in the first image wearing the clothing shown in the second image. Maintain the person's identity, facial features, pose, and body shape exactly. Replace their original outfit with the new clothing naturally. The background should be simple and clean."
    };

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [personPart, clothesPart, textPart],
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

    throw new Error("No image generated.");

  } catch (error: any) {
    console.error("Gemini Try-On Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

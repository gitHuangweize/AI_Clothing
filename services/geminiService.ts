import { GoogleGenAI } from "@google/genai";
import { MODEL_NAME } from "../constants";
import { stripBase64Header, getMimeTypeFromBase64 } from "../utils/imageUtils";

/**
 * Generates an image of a person wearing specific clothes.
 * @param personBase64 Base64 string of the person
 * @param clothesBase64 Base64 string of the clothes
 */
export const generateTryOnImage = async (personBase64: string, clothesBase64: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Prepare parts
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

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [personPart, clothesPart, textPart],
      },
      config: {
         // Assuming outputting image directly for banana models
      }
    });

    // Check for image in parts
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image generated.");
  } catch (error) {
    console.error("Gemini Try-On Error:", error);
    throw error;
  }
};

/**
 * Generates an image of clothes based on a text prompt.
 * @param prompt User description of clothes
 */
export const generateClothesFromText = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const enhancedPrompt = `A high-quality, flat-lay or mannequin style product photography of a piece of clothing: ${prompt}. White background, studio lighting, clear details.`;

  try {
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
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No clothes image generated.");
  } catch (error) {
    console.error("Gemini Clothes Gen Error:", error);
    throw error;
  }
};
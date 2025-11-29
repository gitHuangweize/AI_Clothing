/**
 * Generates an image of a person wearing specific clothes.
 * @param personBase64 Base64 string of the person
 * @param clothesBase64 Base64 string of the clothes
 */
export const generateTryOnImage = async (personBase64: string, clothesBase64: string): Promise<string> => {
  const response = await fetch('/.netlify/functions/generate-try-on', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ personBase64, clothesBase64 }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.output;
};

/**
 * Generates an image of clothes based on a text prompt.
 * @param prompt User description of clothes
 */
export const generateClothesFromText = async (prompt: string): Promise<string> => {
  const response = await fetch('/.netlify/functions/generate-clothes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.output;
};

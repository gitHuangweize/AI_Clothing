
export const convertBlobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(blob);
  });
};

export const fetchUrlToBase64 = async (url: string): Promise<string> => {
  const attemptFetch = async (targetUrl: string) => {
    const response = await fetch(targetUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const blob = await response.blob();
    return await convertBlobToBase64(blob);
  };

  try {
    // 1. Try direct fetch first (works if CORS is enabled on source)
    return await attemptFetch(url);
  } catch (error) {
    // 2. Try wsrv.nl (standard image proxy)
    try {
      // Note: wsrv.nl expects the URL to be encoded
      const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(url)}&output=png`;
      return await attemptFetch(proxyUrl);
    } catch (proxyError1) {
       // 3. Try allorigins.win (general CORS proxy)
       try {
          const proxyUrl2 = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
          return await attemptFetch(proxyUrl2);
       } catch (proxyError2) {
          // 4. Try CodeTabs (another fallback)
          try {
             const proxyUrl3 = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`;
             return await attemptFetch(proxyUrl3);
          } catch (proxyError3) {
             console.error("All proxies failed:", proxyError3);
             throw new Error("无法加载图片 (跨域限制)。请尝试下载图片后上传本地文件。");
          }
       }
    }
  }
};

export const stripBase64Header = (base64Str: string): string => {
  if (!base64Str.startsWith('data:')) return base64Str;
  return base64Str.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
};

export const getMimeTypeFromBase64 = (base64Str: string): string => {
  const match = base64Str.match(/^data:image\/(png|jpeg|jpg|webp);base64,/);
  if (match && match[1]) {
    return `image/${match[1]}`;
  }
  return 'image/png'; // Default
};

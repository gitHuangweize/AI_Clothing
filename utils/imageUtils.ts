
export const compressImage = (file: Blob, maxWidth: number = 1024, quality: number = 0.8): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Canvas to Blob failed'));
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export const convertBlobToBase64 = async (blob: Blob): Promise<string> => {
  // Auto compress if large (e.g. > 1MB)
  if (blob.size > 1024 * 1024) {
     try {
       const compressed = await compressImage(blob);
       blob = compressed;
     } catch (e) {
       console.warn('Compression failed, using original', e);
     }
  }
  
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
    return await convertBlobToBase64(blob); // This will now auto-compress
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

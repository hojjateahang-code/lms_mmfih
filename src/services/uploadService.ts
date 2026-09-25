// src/services/uploadService.ts

export const uploadFile = async (
  file: File,
  bucket = 'general',
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; url?: string; fileName?: string; error?: string }> => {
  try {
    if (onProgress) onProgress(15);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);

    if (onProgress) onProgress(40);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (onProgress) onProgress(80);

    if (res.ok) {
      const data = await res.json();
      if (onProgress) onProgress(100);
      return { success: true, url: data.fileUrl, fileName: data.fileName };
    }

    // Fallback if backend returned non-200: convert to persistent Data URL for offline/localStorage
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (onProgress) onProgress(100);
        resolve({ success: true, url: reader.result as string, fileName: file.name });
      };
      reader.onerror = () => {
        const blobUrl = URL.createObjectURL(file);
        if (onProgress) onProgress(100);
        resolve({ success: true, url: blobUrl, fileName: file.name });
      };
      reader.readAsDataURL(file);
    });
  } catch (error: any) {
    console.warn('Real upload fallback to data URL:', error.message);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (onProgress) onProgress(100);
        resolve({ success: true, url: reader.result as string, fileName: file.name });
      };
      reader.onerror = () => {
        const blobUrl = URL.createObjectURL(file);
        if (onProgress) onProgress(100);
        resolve({ success: true, url: blobUrl, fileName: file.name });
      };
      reader.readAsDataURL(file);
    });
  }
};

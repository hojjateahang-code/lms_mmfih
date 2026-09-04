// src/services/uploadService.ts
import { supabase } from '../lib/supabase';

// Helper to simulate network upload delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const uploadFile = async (
  file: File,
  bucket: string,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    // Check if real bucket is available via supabase storage
    // If bucket exists we can use it:
    /*
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });
    
    if (error) throw error;
    
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return { success: true, url: publicUrlData.publicUrl };
    */
    
    // Fallback Mock logic for prototype with progressive feedback
    if (onProgress) {
      for (let i = 10; i <= 100; i += 20) {
        await delay(300);
        onProgress(i);
      }
    } else {
      await delay(1500);
    }
    
    // Return a realistic placeholder URL based on file type
    const isVideo = file.type.includes('video');
    const mockUrl = isVideo 
      ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
      : URL.createObjectURL(file); // This generates a local blob URL for immediate preview!
      
    return { success: true, url: mockUrl };
  } catch (error: any) {
    console.error('Error uploading file:', error.message);
    return { success: false, error: error.message };
  }
};

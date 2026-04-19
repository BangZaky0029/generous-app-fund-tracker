/**
 * Storage Utility
 * Helper logic for uploading files to Supabase Storage
 */
import { supabase } from '@/lib/supabaseConfig';
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Upload an image to Supabase Storage
 * @param localUri The local file URI from expo-image-picker
 * @param bucket Default is 'receipts'
 * @param prefix Folder prefix inside the bucket
 */
export async function uploadToStorage(
  localUri: string,
  bucket: string = 'receipts',
  prefix: string = 'general'
): Promise<string | null> {
  try {
    const fileName = `${prefix}_${Date.now()}.jpg`;
    const filePath = `${prefix}/${fileName}`;

    // Optimization: Use fetch to get a blob directly from the local URI
    // This is much more memory-efficient than reading the whole file as a base64 string
    const response = await fetch(localUri);
    const blob = await response.blob();

    // Percaya langsung pada bucket yang diberikan
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.error('[Storage] Upload Error Detail:', error);
      return null;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl ?? null;
  } catch (err) {
    console.error('[Storage] Catch Error:', err);
    return null;
  }
}

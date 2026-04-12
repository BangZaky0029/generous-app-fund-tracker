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

    // Baca file sebagai base64 string
    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Decode base64 ke Uint8Array
    const binaryLen = base64.length;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const lookup = new Uint8Array(256);
    for (let i = 0; i < chars.length; i++) lookup[chars.charCodeAt(i)] = i;

    const outputLen = Math.floor((binaryLen * 3) / 4) -
      (base64[binaryLen - 1] === '=' ? 1 : 0) -
      (base64[binaryLen - 2] === '=' ? 1 : 0);
    const bytes = new Uint8Array(outputLen);
    let p = 0;
    for (let i = 0; i < binaryLen; i += 4) {
      const a = lookup[base64.charCodeAt(i)];
      const b = lookup[base64.charCodeAt(i + 1)];
      const c = lookup[base64.charCodeAt(i + 2)];
      const d = lookup[base64.charCodeAt(i + 3)];
      bytes[p++] = (a << 2) | (b >> 4);
      if (p < outputLen) bytes[p++] = ((b & 15) << 4) | (c >> 2);
      if (p < outputLen) bytes[p++] = ((c & 3) << 6) | (d & 63);
    }

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, bytes, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.error('[Storage] Error:', error.message);
      return null;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl ?? null;
  } catch (err) {
    console.error('[Storage] Catch Error:', err);
    return null;
  }
}

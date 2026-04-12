/**
 * OCR Service
 * Menggunakan OCR.space Free API untuk ekstrak teks dari foto struk
 * Docs: https://ocr.space/OCRAPI
 */
import type { OcrResult, ParsedReceiptData } from '@/constants/types';

const OCR_API_URL = 'https://api.ocr.space/parse/image';
const OCR_API_KEY = process.env.EXPO_PUBLIC_OCR_SPACE_API_KEY ?? '';

/**
 * Kirim gambar base64 ke OCR.space API dan dapatkan teks terurai
 */
export async function extractTextFromImage(base64Image: string): Promise<OcrResult> {
  if (!OCR_API_KEY) {
    throw new Error('API Key OCR.space belum di-set di file .env');
  }

  // Pastikan base64 memiliki prefix data URI agar OCR.space mengenalinya dengan benar
  const base64Data = base64Image.startsWith('data:') 
    ? base64Image 
    : `data:image/jpeg;base64,${base64Image}`;

  const formData = new FormData();
  formData.append('apikey', OCR_API_KEY);
  formData.append('base64Image', base64Data);
  formData.append('language', 'eng'); // Gunakan 'eng' (latin based) untuk kestabilan di Free Tier
  formData.append('isOverlayRequired', 'false');
  formData.append('detectOrientation', 'true');
  formData.append('scale', 'true');
  formData.append('OCREngine', '2'); // Engine 2 lebih akurat untuk struk belanja/layout kompleks

  const response = await fetch(OCR_API_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OCR.space API error: ${response.status} - ${errorBody}`);
  }

  const result: OcrResult = await response.json();

  // Handle OCR.space specific processing errors
  if (result.IsErroredOnProcessing) {
    throw new Error(`OCR.space Error: ${result.ErrorMessage || 'Gagal memproses gambar'}`);
  }

  return result;
}

/**
 * Parse teks hasil OCR untuk ekstrak nominal dan tanggal dari struk
 * Mensupport struk Indonesia
 */
export function parseReceiptText(ocrResult: OcrResult): ParsedReceiptData {
  // Ambil teks dari ParsedResults pertama (OCR.space schema)
  const rawText = ocrResult.ParsedResults?.[0]?.ParsedText ?? '';

  if (!rawText) {
    return { amount: null, date: null, rawText: 'Tidak ada teks terdeteksi.' };
  }

  // --- Parse Nominal ---
  // Pattern: "Rp 50.000", "Rp50000", "Total: 50.000", "TOTAL 50000"
  let amount: number | null = null;
  const amountPatterns = [
    /(?:total|jumlah|rp\.?|idr|netto|bayar|tunai)\s*[:.]?\s*([\d.,]+)/gi,
    /(?:grand\s*total|subtotal|total\s*harga|amount\s*total)\s*[:.]?\s*([\d.,]+)/gi,
    /([\d]{1,3}(?:[.,]\d{3})+)/gi, 
    /TOTAL\s+([\d.,]+)/i,
  ];

  for (const pattern of amountPatterns) {
    const matches = rawText.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        const cleaned = match[1].replace(/[^\d]/g, '');
        const parsed = parseInt(cleaned, 10);
        // Validasi: Biasanya total struk > 1000 perak (mencegah salah ambil angka kecil)
        if (!isNaN(parsed) && parsed > 500) {
          // Selalu ambil angka yang paling besar di bagian bawah jika memungkinkan
          if (amount === null || parsed > amount) {
            amount = parsed;
          }
        }
      }
    }
  }

  // --- Parse Tanggal ---
  let date: string | null = null;
  const datePatterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,     // DD/MM/YYYY
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,     // YYYY-MM-DD
    /(\d{1,2})\s+(jan|feb|mar|apr|mei|jun|jul|agu|sep|okt|nov|des)[a-z]*\s+(\d{4})/i,
  ];

  for (const pattern of datePatterns) {
    const match = rawText.match(pattern);
    if (match) {
      date = match[0];
      break;
    }
  }

  return { amount, date, rawText };
}

/**
 * Main function: foto base64 → data struk terparse
 */
export async function scanReceipt(base64Image: string): Promise<ParsedReceiptData> {
  try {
    const ocrResult = await extractTextFromImage(base64Image);
    return parseReceiptText(ocrResult);
  } catch (error) {
    console.error('[OCR Service OCR.space] Error:', error);
    throw error;
  }
}

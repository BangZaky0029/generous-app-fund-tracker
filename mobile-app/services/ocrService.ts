/**
 * OCR Service
 * Menggunakan OCR.space API (free) untuk ekstrak teks dari foto struk
 * Docs: https://ocr.space/ocrapi
 */
import type { OcrResult, ParsedReceiptData } from '@/constants/types';

const OCR_API_URL = 'https://api.ocr.space/parse/image';
const OCR_API_KEY = process.env.EXPO_PUBLIC_OCR_SPACE_API_KEY ?? 'helloworld';

/**
 * Kirim gambar base64 ke OCR.space dan dapat teks hasilnya
 */
export async function extractTextFromImage(
  base64Image: string,
  mimeType: 'image/jpeg' | 'image/png' = 'image/jpeg'
): Promise<OcrResult> {
  const formData = new FormData();
  formData.append('base64Image', `data:${mimeType};base64,${base64Image}`);
  formData.append('language', 'eng');
  formData.append('isOverlayRequired', 'false');
  formData.append('detectOrientation', 'true');
  formData.append('scale', 'true');
  formData.append('OCREngine', '2'); // Engine 2 lebih akurat untuk angka

  const response = await fetch(OCR_API_URL, {
    method: 'POST',
    headers: {
      apikey: OCR_API_KEY,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`OCR API error: ${response.status} ${response.statusText}`);
  }

  const result: OcrResult = await response.json();

  if (result.IsErroredOnProcessing) {
    throw new Error('OCR gagal memproses gambar. Coba lagi dengan foto yang lebih jelas.');
  }

  return result;
}

/**
 * Parse teks OCR untuk ekstrak nominal dan tanggal dari struk
 * Menggunakan regex pattern umum pada struk Indonesia
 */
export function parseReceiptText(ocrResult: OcrResult): ParsedReceiptData {
  const rawText =
    ocrResult.ParsedResults?.[0]?.ParsedText ?? ocrResult.ParsedText ?? '';

  // --- Parse Nominal ---
  // Pattern: "Rp 50.000", "Rp50000", "Total: 50.000", "TOTAL 50000"
  let amount: number | null = null;
  const amountPatterns = [
    /(?:total|jumlah|rp\.?|idr)\s*[:.]?\s*([\d.,]+)/gi,
    /(?:grand\s*total|subtotal|total\s*harga)\s*[:.]?\s*([\d.,]+)/gi,
    /([\d]{1,3}(?:[.,]\d{3})+)/gi, // Angka ribuan seperti 50.000 atau 50,000
  ];

  for (const pattern of amountPatterns) {
    const match = rawText.match(pattern);
    if (match) {
      // Ambil angka terakhir yang match (biasanya total ada di bawah)
      const lastMatch = match[match.length - 1];
      const cleaned = lastMatch.replace(/[^\d]/g, '');
      const parsed = parseInt(cleaned, 10);
      if (!isNaN(parsed) && parsed > 100) {
        amount = parsed;
        break;
      }
    }
  }

  // --- Parse Tanggal ---
  // Pattern Indonesia: "11/04/2026", "11-04-2026", "11 April 2026", "2026-04-11"
  let date: string | null = null;
  const datePatterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,     // DD/MM/YYYY atau MM/DD/YYYY
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,     // YYYY-MM-DD
    /(\d{1,2})\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\s+(\d{4})/i,
    /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{4})/i,
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
    console.error('[OCR Service] Error:', error);
    throw error;
  }
}

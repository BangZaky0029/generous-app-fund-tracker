/**
 * OCR Service
 * Menggunakan Google Cloud Vision API untuk ekstrak teks dari foto struk (Gold Standard OCR)
 * Docs: https://cloud.google.com/vision/docs/ocr
 */
import type { OcrResult, ParsedReceiptData } from '@/constants/types';

const OCR_API_URL = 'https://vision.googleapis.com/v1/images:annotate';
const OCR_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY ?? '';

/**
 * Kirim gambar base64 ke Google Vision API dan dapatkan anotasi teks lengkap
 */
export async function extractTextFromImage(base64Image: string): Promise<OcrResult> {
  if (!OCR_API_KEY) {
    throw new Error('API Key Google Vision API belum di-set di file .env');
  }

  const payload = {
    requests: [
      {
        image: {
          content: base64Image,
        },
        features: [
          {
            type: 'TEXT_DETECTION',
          },
        ],
      },
    ],
  };

  const response = await fetch(`${OCR_API_URL}?key=${OCR_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Google Vision API error: ${response.status} - ${errorBody}`);
  }

  const result: OcrResult = await response.json();

  // Handle Google Vision specific API layer errors
  if (result.responses && result.responses[0]?.error) {
    throw new Error(`Vision API Error: ${result.responses[0].error.message}`);
  }

  return result;
}

/**
 * Parse teks OCR Google Vision untuk ekstrak nominal dan tanggal dari struk
 * Mensupport struk Indonesia
 */
export function parseReceiptText(ocrResult: OcrResult): ParsedReceiptData {
  // Ambil raw string text lengkap hasil scan Google Vision
  const rawText = ocrResult.responses?.[0]?.fullTextAnnotation?.text ?? '';

  if (!rawText) {
    return { amount: null, date: null, rawText: 'Tidak ada teks terdeteksi.' };
  }

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
      // Ambil angka terakhir yang match (karena biasanya "total" ada di porsi paling bawah struk)
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
    console.error('[OCR Service Google Vision] Error:', error);
    throw error;
  }
}

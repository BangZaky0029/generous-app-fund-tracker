/**
 * OCR Service - Optimized for Indonesian Receipts
 * Using OCR.space API to extract amount and dates
 */
import type { OcrResult, ParsedReceiptData } from '@/constants/types';

const OCR_API_URL = 'https://api.ocr.space/parse/image';
const OCR_API_KEY = process.env.EXPO_PUBLIC_OCR_SPACE_API_KEY ?? '';

/**
 * Sends base64 image to OCR.space
 */
export async function extractTextFromImage(base64Image: string): Promise<OcrResult> {
  if (!OCR_API_KEY) {
    throw new Error('API Key OCR.space not found in .env');
  }

  // Ensure Base64 has correct prefix
  const base64Data = base64Image.startsWith('data:') 
    ? base64Image 
    : `data:image/jpeg;base64,${base64Image}`;

  const formData = new FormData();
  formData.append('apikey', OCR_API_KEY);
  formData.append('base64Image', base64Data);
  formData.append('language', 'eng'); // 'eng' is stable, receipts use latin chars
  formData.append('isOverlayRequired', 'false');
  formData.append('detectOrientation', 'true');
  formData.append('scale', 'true');
  formData.append('OCREngine', '2'); // Engine 2 is better for receipts

  const response = await fetch(OCR_API_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OCR API Error: ${response.status} - ${errorBody}`);
  }

  const result: OcrResult = await response.json();
  if (result.IsErroredOnProcessing) {
    throw new Error(`OCR Processing Error: ${result.ErrorMessage || 'Unknown Error'}`);
  }

  return result;
}

/**
 * Robust parsing for Indonesian receipts
 */
export function parseReceiptText(ocrResult: OcrResult): ParsedReceiptData {
  try {
    const rawText = ocrResult.ParsedResults?.[0]?.ParsedText ?? '';
    if (!rawText) {
      return { amount: null, date: null, rawText: 'No text detected.' };
    }

    // --- 1. AMOUNT EXTRACTION ---
    let amount: number | null = null;
    
    // Clean text: remove Rp, IDR, and unify separators for parsing
    // But keep dots/commas for now to identify thousand/decimal
    const sanitizedText = rawText.replace(/Rp\.?|IDR/gi, ' ');

    // Patterns with /g flag to avoid matchAll TypeError
    const amountPatterns = [
      /(?:total|jumlah|bayar|netto|tunai|tagihan|amount)\s*[:.]?\s*([\d.,]{3,15})/gi,
      /(?:grand\s*total|subtotal|total\s*harga)\s*[:.]?\s*([\d.,]{3,15})/gi,
      /([\d]{1,3}(?:[.,]\d{3})+)/g, // Standard thousand separators
    ];

    const foundAmounts: number[] = [];

    for (const pattern of amountPatterns) {
      const matches = sanitizedText.matchAll(pattern);
      for (const match of matches) {
        if (match[1] || match[0]) {
          const valStr = match[1] || match[0];
          
          // Indonesian format: 50.000,00 -> 50000.00
          // Strategy: remove all dots, treat last comma as decimal
          let cleaned = valStr.replace(/\./g, ''); // Remove thousand dots
          cleaned = cleaned.replace(/,/g, '.');    // Internal decimal
          
          const parsed = parseFloat(cleaned);
          
          // Basic validation: mostly receipts are > 1000 and total is usually the largest
          if (!isNaN(parsed) && parsed >= 100) {
            foundAmounts.push(Math.floor(parsed));
          }
        }
      }
    }

    if (foundAmounts.length > 0) {
      // Pick the largest value found as it is usually the "Grand Total"
      amount = Math.max(...foundAmounts);
    }

    // --- 2. DATE EXTRACTION ---
    let date: string | null = null;
    const datePatterns = [
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/g,     // DD/MM/YYYY
      /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/g,     // YYYY-MM-DD
      /(\d{1,2})\s+(jan|feb|mar|apr|mei|jun|jul|agu|sep|okt|nov|des)[a-z]*\s+(\d{4})/gi,
    ];

    for (const pattern of datePatterns) {
      const match = rawText.match(pattern);
      if (match) {
        date = match[0];
        break;
      }
    }

    return { amount, date, rawText };
  } catch (error) {
    console.error('[OCR Parser Error]:', error);
    return { 
      amount: null, 
      date: null, 
      rawText: ocrResult.ParsedResults?.[0]?.ParsedText || 'Parsing failed.' 
    };
  }
}

/**
 * High-level scanner function
 */
export async function scanReceipt(base64Image: string): Promise<ParsedReceiptData> {
  try {
    const ocrResult = await extractTextFromImage(base64Image);
    return parseReceiptText(ocrResult);
  } catch (error) {
    console.error('[OCR Service] Fatal Error:', error);
    throw error;
  }
}

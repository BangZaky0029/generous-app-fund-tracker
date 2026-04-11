/**
 * useCamera Hook
 * Mengelola izin kamera, pengambilan foto, dan scan OCR
 */
import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Alert } from 'react-native';
import { scanReceipt } from '@/services/ocrService';
import type { ParsedReceiptData } from '@/constants/types';

type CameraState = {
  isScanning: boolean;
  capturedUri: string | null;
  parsedData: ParsedReceiptData | null;
  error: string | null;
};

type CameraActions = {
  openCamera: () => Promise<void>;
  openGallery: () => Promise<void>;
  clearCapture: () => void;
};

export function useCamera(): CameraState & CameraActions {
  const [state, setState] = useState<CameraState>({
    isScanning: false,
    capturedUri: null,
    parsedData: null,
    error: null,
  });

  // Request Camera Permission — Wajib di Android!
  const requestCameraPermission = useCallback(async (): Promise<boolean> => {
    const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();

    if (status === 'granted') return true;

    if (!canAskAgain) {
      Alert.alert(
        'Izin Kamera Diperlukan',
        'Izin kamera telah ditolak permanen. Buka Pengaturan untuk mengaktifkannya.',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Izin Kamera Diperlukan',
        'Aplikasi memerlukan izin kamera untuk memfoto struk.',
        [{ text: 'OK' }]
      );
    }
    return false;
  }, []);

  // Proses gambar yang diambil: compress + OCR scan
  const processImage = useCallback(async (uri: string) => {
    setState((prev) => ({ ...prev, isScanning: true, error: null, capturedUri: uri }));

    try {
      // Baca gambar sebagai base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Kirim ke OCR service untuk scan
      const parsed = await scanReceipt(base64);

      setState((prev) => ({
        ...prev,
        isScanning: false,
        parsedData: parsed,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal scan struk';
      setState((prev) => ({
        ...prev,
        isScanning: false,
        error: message,
        parsedData: { amount: null, date: null, rawText: '' },
      }));
      console.error('[useCamera] OCR error:', err);
    }
  }, []);

  // Buka kamera native
  const openCamera = useCallback(async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'] as ImagePicker.MediaType[],
      quality: 0.8,           // Compress untuk performa OCR
      base64: false,
      allowsEditing: true,
      aspect: [4, 3] as [number, number],
    });

    if (!result.canceled && result.assets[0]) {
      await processImage(result.assets[0].uri);
    }
  }, [requestCameraPermission, processImage]);

  // Buka galeri (alternatif)
  const openGallery = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin diperlukan', 'Akses ke galeri diperlukan untuk memilih foto struk.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as ImagePicker.MediaType[],
      quality: 0.8,
      base64: false,
      allowsEditing: true,
      aspect: [4, 3] as [number, number],
    });

    if (!result.canceled && result.assets[0]) {
      await processImage(result.assets[0].uri);
    }
  }, [processImage]);

  // Reset state
  const clearCapture = useCallback(() => {
    setState({
      isScanning: false,
      capturedUri: null,
      parsedData: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    openCamera,
    openGallery,
    clearCapture,
  };
}

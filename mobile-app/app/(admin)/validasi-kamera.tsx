import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, FlashMode } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useRef, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { scanReceipt } from '@/services/ocrService';
import { useFundTrackerContext } from '@/context/FundTrackerContext';

export default function ValidasiKamera() {
  const { showAlert } = useFundTrackerContext();
  const [permission, requestPermission] = useCameraPermissions();
  const params = useLocalSearchParams();
  const mode = (params.mode as 'scan' | 'photo') || 'scan';
  const returnTo = (params.returnTo as string) || '/(admin)/add-expense';

  const [flash, setFlash] = useState<FlashMode>('off');
  const [isScanning, setIsScanning] = useState(false);
  const [lastCapturedUri, setLastCapturedUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  // Reset state saat mode berubah (misal dari foto donasi balik ke scanner utama)
  useEffect(() => {
    setIsScanning(false);
    setLastCapturedUri(null);
  }, [mode]);

  if (!permission) return <View style={{ flex: 1, backgroundColor: '#000' }} />;

  if (!permission.granted) {
    return (
      <View style={styles.permissionRoot}>
        <View style={styles.permissionIconBox}>
          <MaterialIcons name="camera-alt" size={48} color="#69f6b8" />
        </View>
        <Text style={styles.permissionTitle}>Akses Kamera Dibutuhkan</Text>
        <Text style={styles.permissionDesc}>
          Untuk menjaga transparansi donasi, Admin diwajibkan mengunggah bukti struk asli melalui kamera.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={styles.permissionBtn}
        >
          <Text style={styles.permissionBtnText}>Izinkan Sekarang</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleFlash = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFlash(current => (current === 'off' ? 'on' : current === 'on' ? 'auto' : 'off'));
  };

  const handleOcrProcess = async (base64: string, uri: string) => {
    setIsScanning(true);
    setLastCapturedUri(uri);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // MODE PHOTO: Lewati OCR, langsung konfirmasi
    if (mode === 'photo') {
      setIsScanning(false);
      showAlert(
        'Foto Diambil',
        'Gunakan foto ini sebagai bukti?',
        'success',
        () => router.push({
          pathname: returnTo as any,
          params: { capturedUri: uri }
        })
      );
      return;
    }

    // MODE SCAN: Jalankan AI/OCR
    try {
      const result = await scanReceipt(base64);
      setIsScanning(false);

      if (result.amount) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showAlert(
          'Struk Terdeteksi',
          `Nominal: Rp ${result.amount.toLocaleString('id-ID')}\n\nLanjutkan simpan?`,
          'success',
          () => router.push({
            pathname: '/(admin)/add-expense',
            params: {
              amount: result.amount?.toString(),
              description: result.rawText.substring(0, 50),
              category: 'Lainnya',
              capturedUri: uri,
            }
          })
        );
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        showAlert('Gagal Mendeteksi', 'Nominal struk tidak terbaca. Pastikan foto fokus.', 'warning');
      }
    } catch (error: any) {
      setIsScanning(false);
      showAlert('System Error', error.message || 'Gagal memproses gambar.', 'error');
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      try {
        const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5 });
        if (photo?.base64 && photo?.uri) {
          handleOcrProcess(photo.base64, photo.uri);
        }
      } catch (e) {
        showAlert('Error', 'Gagal mengambil gambar', 'error');
      }
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      handleOcrProcess(result.assets[0].base64, result.assets[0].uri);
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.headerArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color="#69f6b8" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>PINDAI BUKTI</Text>
        </View>
      </SafeAreaView>

      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing="back"
        flash={flash}
      >
        <View style={styles.overlay}>
          {mode === 'scan' ? (
            <View style={styles.viewfinder}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />

              <View style={styles.metaBadge}>
                <View style={[styles.statusDot, { backgroundColor: isScanning ? '#fbbf24' : '#69f6b8' }]} />
                <Text style={styles.metaText}>
                  {isScanning ? 'MEMPROSES...' : 'SIAP PINDAI'}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.photoModeBadge}>
               <View style={styles.statusDot} />
               <Text style={styles.metaText}>MODE FOTO BUKTI</Text>
            </View>
          )}

          <View style={styles.hintBox}>
            <Text style={styles.hintText}>
              {mode === 'scan' ? 'Posisikan struk belanja di dalam kotak' : 'Ambil foto bukti transaksi dengan jelas'}
            </Text>
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity onPress={pickImage} style={styles.sideBtn}>
            <MaterialIcons name="photo-library" size={24} color="#dee5ff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={takePicture} disabled={isScanning} style={styles.shutterBtn}>
            <View style={styles.shutterInner}>
              {isScanning ? <ActivityIndicator color="#000" /> : <View style={styles.shutterPoint} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleFlash} style={styles.sideBtn}>
            <MaterialIcons
              name={flash === 'off' ? 'flash-off' : flash === 'on' ? 'flash-on' : 'flash-auto'}
              size={24}
              color={flash === 'off' ? '#dee5ff' : '#69f6b8'}
            />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  permissionRoot: { flex: 1, backgroundColor: '#060e20', alignItems: 'center', justifyContent: 'center', padding: 32 },
  permissionIconBox: { width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(105, 246, 184, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  permissionTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 16 },
  permissionDesc: { color: '#94a3b8', textAlign: 'center', marginBottom: 40, lineHeight: 22 },
  permissionBtn: { backgroundColor: '#69f6b8', width: '100%', paddingVertical: 20, borderRadius: 16, alignItems: 'center' },
  permissionBtnText: { color: '#002919', fontWeight: 'bold', fontSize: 16 },
  headerArea: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'rgba(25, 37, 64, 0.8)', margin: 16, borderRadius: 16, gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { color: '#69f6b8', fontWeight: 'bold', letterSpacing: 1 },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  viewfinder: { width: '80%', aspectRatio: 3 / 4, borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 20, position: 'relative' },
  corner: { position: 'absolute', width: 24, height: 24, borderColor: '#69f6b8', borderWidth: 4 },
  topLeft: { top: -2, left: -2, borderBottomWidth: 0, borderRightWidth: 0, borderTopLeftRadius: 20 },
  topRight: { top: -2, right: -2, borderBottomWidth: 0, borderLeftWidth: 0, borderTopRightRadius: 20 },
  bottomLeft: { bottom: -2, left: -2, borderTopWidth: 0, borderRightWidth: 0, borderBottomLeftRadius: 20 },
  bottomRight: { bottom: -2, right: -2, borderTopWidth: 0, borderLeftWidth: 0, borderBottomRightRadius: 20 },
  metaBadge: { position: 'absolute', top: 16, left: 16, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  photoModeBadge: { position: 'absolute', top: 120, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(105, 246, 184, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(105, 246, 184, 0.2)' },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#69f6b8' },
  metaText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  hintBox: { position: 'absolute', bottom: 180, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24 },
  hintText: { color: '#fff', fontSize: 12 },
  controls: { position: 'absolute', bottom: 40, width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 40 },
  sideBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  shutterBtn: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#69f6b8', padding: 4 },
  shutterInner: { flex: 1, borderRadius: 40, borderWidth: 4, borderColor: 'rgba(0,0,0,0.1)', alignItems: 'center', justifyContent: 'center' },
  shutterPoint: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'transparent', borderWidth: 2, borderColor: '#fff' }
});

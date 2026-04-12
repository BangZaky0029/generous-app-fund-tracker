import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, FlashMode } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { scanReceipt } from '@/services/ocrService';

export default function ValidasiKamera() {
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState<FlashMode>('off');
  const [isScanning, setIsScanning] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) return <View className="flex-1 bg-black" />;

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-surface items-center justify-center p-8">
        <View className="w-24 h-24 bg-primary/10 rounded-full items-center justify-center mb-8 border border-primary/20">
          <MaterialIcons name="camera-alt" size={48} color="#69f6b8" />
        </View>
        <Text className="font-headline text-2xl font-bold text-white text-center mb-4">Akses Kamera Dibutuhkan</Text>
        <Text className="text-on-surface-variant text-center mb-10 leading-6 px-4">
          Untuk menjaga transparansi donasi, Admin diwajibkan mengunggah bukti struk asli melalui kamera. Kami menjamin privasi data Anda.
        </Text>
        <TouchableOpacity 
          onPress={requestPermission} 
          className="bg-primary w-full py-5 rounded-2xl items-center shadow-lg shadow-primary/20"
        >
          <Text className="font-bold text-on-primary-container text-lg">Izinkan Sekarang</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} className="mt-6">
          <Text className="text-on-surface-variant font-medium">Nanti Saja</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleFlash = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFlash(current => (current === 'off' ? 'on' : current === 'on' ? 'auto' : 'off'));
  };

  const handleOcrProcess = async (base64: string) => {
    setIsScanning(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    try {
      const result = await scanReceipt(base64);
      setIsScanning(false);
      
      if (result.amount) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Struk Terdeteksi',
          `Nominal: Rp ${result.amount.toLocaleString('id-ID')}\nTanggal: ${result.date || 'Tidak ditemukan'}\n\nLanjutkan simpan?`,
          [
            { text: 'Ulangi', style: 'cancel' },
            { 
              text: 'Simpan', 
              onPress: () => router.push({
                pathname: '/modal/add-expense',
                params: { 
                  amount: result.amount?.toString(),
                  description: result.rawText.substring(0, 50),
                  category: 'Lainnya'
                }
              }) 
            }
          ]
        );
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Gagal Mendeteksi', 'Nominal struk tidak terbaca dengan jelas. Pastikan foto fokus dan pencahayaan cukup.');
      }
    } catch (error: any) {
      setIsScanning(false);
      Alert.alert('System Error', error.message || 'Gagal memproses gambar.');
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      try {
        const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5 });
        if (photo?.base64) {
          handleOcrProcess(photo.base64);
        }
      } catch (e) {
        Alert.alert('Error', 'Gagal mengambil gambar');
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
      handleOcrProcess(result.assets[0].base64);
    }
  };

  return (
    <View className="flex-1 bg-black">
      <SafeAreaView edges={['top']} className="absolute top-0 left-0 right-0 z-50">
        <View className="flex-row justify-between items-center px-6 py-4 bg-[#192540]/80 border-b border-[#40485d]/15 mx-4 mt-2 rounded-2xl backdrop-blur-md">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
              <MaterialIcons name="arrow-back" size={24} color="#69f6b8" />
            </TouchableOpacity>
            <Text className="font-headline text-sm text-[#69f6b8] font-bold uppercase tracking-widest">Pindai Bukti</Text>
          </View>
        </View>
      </SafeAreaView>

      <CameraView 
        ref={cameraRef}
        style={{ flex: 1 }} 
        facing="back"
        flash={flash}
      >
         <View className="flex-1 justify-center items-center bg-black/40">
           {/* Viewfinder Target */}
           <View className="w-[80%] aspect-[3/4] border-2 border-white/20 rounded-xl relative overflow-hidden">
             {/* Corners */}
             <View className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-primary rounded-tl-xl" />
             <View className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-primary rounded-tr-xl" />
             <View className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-primary rounded-bl-xl" />
             <View className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-primary rounded-br-xl" />

             {/* Detection Meta */}
             <View className="absolute top-4 left-4 bg-primary/20 px-3 py-1 rounded-full border border-primary/30 flex-row items-center gap-2">
                <View className={`w-2 h-2 rounded-full ${isScanning ? 'bg-amber-400' : 'bg-primary'}`} />
                <Text className="text-[10px] font-bold text-primary tracking-widest uppercase">
                  {isScanning ? 'Memproses...' : 'Siap Pindai'}
                </Text>
             </View>

             {/* Animated Scanning Line (Simulated) */}
             {isScanning && (
               <View className="absolute top-0 w-full h-1 bg-primary/50 shadow-lg shadow-primary" />
             )}
           </View>

           {/* Instructional */}
           <View className="absolute bottom-48 bg-black/40 px-6 py-2 rounded-full border border-white/10">
              <Text className="text-white/80 text-sm font-medium tracking-wide">Posisikan struk belanja di dalam kotak</Text>
           </View>
         </View>

         {/* Shutter Controls */}
         <View className="absolute bottom-12 w-full flex-row justify-between items-center px-10 pb-6">
            {/* Gallery Button */}
            <View className="items-center justify-center w-12">
              <TouchableOpacity 
                disabled={isScanning}
                onPress={pickImage}
                className="w-12 h-12 rounded-full bg-surface-variant/40 border border-outline-variant/20 items-center justify-center backdrop-blur-md"
              >
                 <MaterialIcons name="photo-library" size={24} color="#dee5ff" />
              </TouchableOpacity>
            </View>

            {/* Main Shutter */}
            <TouchableOpacity 
              disabled={isScanning}
              onPress={takePicture}
              className={`w-20 h-20 rounded-full ${isScanning ? 'bg-surface-variant' : 'bg-primary'} p-1 shadow-lg active:scale-95`}
            >
               <View className="w-full h-full rounded-full border-4 border-black/20 items-center justify-center">
                  {isScanning ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <View className="w-16 h-16 rounded-full bg-transparent border-2 border-white/30" />
                  )}
               </View>
            </TouchableOpacity>

            {/* Flash Toggle */}
            <View className="items-center justify-center w-12">
              <TouchableOpacity 
                onPress={toggleFlash}
                className="w-12 h-12 rounded-full bg-surface-variant/40 border border-outline-variant/20 items-center justify-center backdrop-blur-md"
              >
                 <MaterialIcons 
                    name={flash === 'off' ? 'flash-off' : flash === 'on' ? 'flash-on' : 'flash-auto'} 
                    size={24} 
                    color={flash === 'off' ? '#dee5ff' : '#69f6b8'} 
                 />
              </TouchableOpacity>
            </View>
         </View>
      </CameraView>
    </View>
  );
}

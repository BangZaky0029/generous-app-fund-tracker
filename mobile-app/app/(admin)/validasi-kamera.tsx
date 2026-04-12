import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ValidasiKamera() {
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) return <View className="flex-1 bg-black" />;

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-surface items-center justify-center p-6">
        <Text className="text-white text-center mb-6">Akses kamera sangat dibutuhkan untuk memindai bukti struk secara langsung agar kredibilitas donasi terjaga.</Text>
        <TouchableOpacity onPress={requestPermission} className="bg-primary px-8 py-4 rounded-full active:scale-95">
          <Text className="font-bold text-on-primary-container text-lg">Izinkan Kamera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-black">
      {/* TopAppBar */}
      <View className="flex-row justify-between items-center px-6 py-4 bg-[#192540]/60 border-b border-[#40485d]/15 z-50 absolute top-0 w-full mt-10 rounded-b-3xl">
        <View className="flex-row items-center gap-3">
          <View className="w-8 h-8 rounded-full border border-primary/30 items-center justify-center bg-surface-variant overflow-hidden">
             <MaterialIcons name="person" size={16} color="#69f6b8" />
          </View>
          <Text className="font-headline text-sm text-[#69f6b8] font-bold uppercase tracking-widest">Pindai Bukti</Text>
        </View>
      </View>

      <CameraView style={{ flex: 1 }} facing="back">
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
                <View className="w-2 h-2 rounded-full bg-primary" />
                <Text className="text-[10px] font-bold text-primary tracking-widest uppercase">Mendeteksi...</Text>
             </View>
           </View>

           {/* Instructional */}
           <View className="absolute bottom-48 bg-black/40 px-6 py-2 rounded-full border border-white/10">
              <Text className="text-white/80 text-sm font-medium tracking-wide">Posisikan struk belanja di dalam kotak</Text>
           </View>
         </View>

         {/* Shutter Controls */}
         <View className="absolute bottom-24 w-full flex-row justify-between items-center px-10">
            {/* Gallery Button */}
            <View className="items-center justify-center w-12">
              <TouchableOpacity className="w-12 h-12 rounded-full bg-surface-variant/40 border border-outline-variant/20 items-center justify-center backdrop-blur-md">
                 <MaterialIcons name="photo" size={24} color="#dee5ff" />
              </TouchableOpacity>
            </View>

            {/* Main Shutter */}
            <TouchableOpacity className="w-20 h-20 rounded-full bg-primary p-1 shadow-lg active:scale-90">
               <View className="w-full h-full rounded-full border-4 border-[#002919]/20 items-center justify-center">
                  <View className="w-16 h-16 rounded-full bg-[#002919]/10 border border-white/20" />
               </View>
            </TouchableOpacity>

            {/* Flash Toggle */}
            <View className="items-center justify-center w-12">
              <TouchableOpacity className="w-12 h-12 rounded-full bg-surface-variant/40 border border-outline-variant/20 items-center justify-center backdrop-blur-md">
                 <MaterialIcons name="flash-auto" size={24} color="#dee5ff" />
              </TouchableOpacity>
            </View>
         </View>
      </CameraView>
    </SafeAreaView>
  );
}

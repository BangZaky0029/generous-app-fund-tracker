import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Bell, Heart, Activity, ShieldCheck, ChevronRight } from 'lucide-react-native';

export default function DonaturDashboard() {
  return (
    <ScrollView className="flex-1 bg-surface font-body mb-20" contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
      {/* Header */}
      <View className="flex-row justify-between items-center mb-8">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant/30 overflow-hidden">
             <View className="w-full h-full bg-primary/20 items-center justify-center">
                <Text className="text-primary font-bold">BS</Text>
             </View>
          </View>
          <View>
            <Text className="text-xs text-on-surface-variant">Selamat datang,</Text>
            <Text className="font-bold text-on-surface text-sm">Budi Santoso</Text>
          </View>
        </View>
        <TouchableOpacity className="p-2 rounded-full bg-white/10">
          <Bell size={20} color="#69f6b8" />
        </TouchableOpacity>
      </View>

      {/* Hero Section */}
      <View className="bg-surface-container-high rounded-xl p-8 mb-6 border border-outline-variant/10 shadow-2xl relative overflow-hidden">
         <View className="absolute -bottom-24 -left-24 w-64 h-64 bg-tertiary/10 rounded-full blur-3xl opacity-50" />
         <Text className="text-on-surface-variant font-medium tracking-wide mb-2">Total Kontribusi</Text>
         <Text className="text-4xl font-extrabold text-white tracking-tighter">Rp 12.500k</Text>
         
         <View className="flex-row items-center gap-4 mt-8">
           <View className="flex-row items-center gap-2 bg-tertiary/10 px-4 py-2 rounded-full border border-tertiary/20">
             <Heart size={16} color="#00dcfd" />
             <Text className="text-tertiary font-bold text-xs">Gold Contributor</Text>
           </View>
         </View>
      </View>

      {/* Transparansi Dana Section */}
      <View className="bg-surface-container-high rounded-xl p-6 mb-6 border border-outline-variant/10">
        <View className="flex-row items-center gap-2 mb-6">
           <ShieldCheck size={20} color="#69f6b8" />
           <Text className="text-on-surface font-bold text-lg">Transparansi Dana</Text>
        </View>
        
        <View className="space-y-6">
          <View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-xs text-on-surface-variant">Telah Disalurkan</Text>
              <Text className="text-xs text-primary font-bold">Rp 8.000k (64%)</Text>
            </View>
            <View className="h-2 bg-surface-variant rounded-full overflow-hidden">
               <View className="h-full bg-primary w-[64%] rounded-full shadow-[0_0_10px_rgba(105,246,184,0.4)]" />
            </View>
          </View>
          <View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-xs text-on-surface-variant">Dalam Proses</Text>
              <Text className="text-xs text-tertiary font-bold">Rp 4.500k (36%)</Text>
            </View>
            <View className="h-2 bg-surface-variant rounded-full overflow-hidden">
               <View className="h-full bg-tertiary w-[36%] rounded-full" />
            </View>
          </View>
        </View>
      </View>

      {/* Update Penyaluran */}
      <View className="bg-[rgba(25,37,64,0.6)] rounded-xl p-6 border border-outline-variant/15 mb-10">
         <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center gap-3">
              <Activity size={24} color="#69f6b8" />
              <Text className="text-lg font-bold text-on-surface">Update Terkini</Text>
            </View>
         </View>
         
         <View className="space-y-4">
            <View className="flex-row gap-4 p-4 rounded-lg bg-surface-container/50 border-l-4 border-primary items-center">
               <View className="flex-1">
                 <Text className="text-sm text-on-surface font-medium">Bantuan Pendidikan Batch 4 disalurkan.</Text>
                 <Text className="text-[10px] text-on-surface-variant mt-1">Hari ini, 10:00 WIB</Text>
               </View>
               <ChevronRight size={16} color="#6d758c" />
            </View>
            <View className="flex-row gap-4 p-4 rounded-lg bg-surface-container/30 border-l-4 border-tertiary items-center">
               <View className="flex-1">
                 <Text className="text-sm text-on-surface font-medium">Laporan audit Q2 diterbitkan.</Text>
                 <Text className="text-[10px] text-on-surface-variant mt-1">Kemarin, 15:30 WIB</Text>
               </View>
               <ChevronRight size={16} color="#6d758c" />
            </View>
         </View>
      </View>

    </ScrollView>
  );
}

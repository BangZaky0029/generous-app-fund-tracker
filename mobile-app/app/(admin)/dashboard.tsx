import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Bell, TrendingUp, PlusSquare, QrCode, Bot, RefreshCw, CheckCircle, Brain } from 'lucide-react-native';

export default function AdminDashboard() {
  return (
    <ScrollView className="flex-1 bg-surface font-body mb-20" contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
      {/* Header */}
      <View className="flex-row justify-between items-center mb-8">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant/30 overflow-hidden">
            <Image 
              source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuA9YiMWYqDWq75EopNuHwotbwPaVkNCi3g0Lw6pCImS73aIpPH2OnsdvxLP4YJDG9eel9jQjJqN62OACThSQXdg0uIifYDbCwdlVhlusj7ujZywT9azTTN2ukoOECNFpTAfbFNezREg7rLjMsxJyVcoLUr2XarLZBN0GgdYo53SWyC9ZdQjLtT4U8FdoCbBR9PYN7Gw286tUehwiSlPD1JbReJxFd6mMiQX88zUDTPh98R0xJGjcJXlqO5aBoG3CyjyOuYeXaGNWIQ" }} 
              className="w-full h-full"
            />
          </View>
          <Text className="font-bold text-primary tracking-widest text-[12px]">ETHEREAL VAULT</Text>
        </View>
        <TouchableOpacity className="p-2 rounded-full bg-white/10">
          <Bell size={20} color="#69f6b8" />
        </TouchableOpacity>
      </View>

      {/* Hero Section */}
      <View className="bg-surface-container-high rounded-xl p-8 mb-6 border border-outline-variant/10 shadow-2xl relative overflow-hidden">
         <View className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50" />
         <Text className="text-on-surface-variant font-medium tracking-wide mb-2">Total Saldo Terkelola</Text>
         <Text className="text-4xl font-extrabold text-primary tracking-tighter">Rp2.840 M</Text>
         
         <View className="flex-row items-center gap-4 mt-8">
           <View className="flex-row items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
             <TrendingUp size={16} color="#69f6b8" />
             <Text className="text-primary font-bold text-xs">+12.4% Bulan Ini</Text>
           </View>
           <View className="h-1 w-24 bg-surface-variant rounded-full overflow-hidden">
             <View className="h-full bg-primary w-3/4" />
           </View>
         </View>
      </View>

      {/* Quick Actions */}
      <View className="bg-surface-container-high rounded-xl p-6 mb-6 border border-outline-variant/10">
        <Text className="text-on-surface font-bold text-lg mb-4">Aksi Cepat</Text>
        <TouchableOpacity className="flex-row items-center justify-between p-4 bg-primary rounded-lg mb-3">
          <View className="flex-row items-center gap-3">
             <PlusSquare size={20} color="#005a3c" />
             <Text className="text-[#005a3c] font-bold">Tambah Data</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center justify-between p-4 bg-surface-variant border border-primary/20 rounded-lg">
          <View className="flex-row items-center gap-3">
             <QrCode size={20} color="#69f6b8" />
             <Text className="text-primary font-bold">Pindai Dokumen</Text>
          </View>
        </TouchableOpacity>
        <View className="mt-4 pt-4 border-t border-outline-variant/10">
           <Text className="text-xs text-on-surface-variant mb-2">Sistem Terakhir Diperbarui</Text>
           <View className="flex-row items-center gap-2">
             <View className="w-2 h-2 rounded-full bg-primary" />
             <Text className="text-sm font-medium text-on-surface">Sistem Aktif (V2.4)</Text>
           </View>
        </View>
      </View>

      {/* Log Aktivitas Agen */}
      <View className="bg-[rgba(25,37,64,0.6)] rounded-xl p-6 border border-outline-variant/15 mb-6">
         <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center gap-3">
              <Bot size={24} color="#69f6b8" />
              <Text className="text-lg font-bold text-on-surface">Log Aktivitas Agen</Text>
            </View>
         </View>
         
         <View className="space-y-4">
            <View className="flex-row gap-4 p-4 rounded-lg bg-surface-container/50 border-l-4 border-primary">
               <RefreshCw size={16} color="#69f6b8" />
               <View className="flex-1">
                 <Text className="text-sm text-on-surface font-medium">Agen sedang menghitung persentase portofolio...</Text>
                 <Text className="text-[10px] text-on-surface-variant mt-1">Baru saja</Text>
               </View>
            </View>
            <View className="flex-row gap-4 p-4 rounded-lg bg-surface-container/30">
               <CheckCircle size={16} color="#34d399" />
               <View className="flex-1">
                 <Text className="text-sm text-on-surface font-medium">Sinkronisasi data berhasil: 1,420 entries.</Text>
                 <Text className="text-[10px] text-on-surface-variant mt-1">2 menit yang lalu</Text>
               </View>
            </View>
            <View className="flex-row gap-4 p-4 rounded-lg bg-surface-container/30">
               <Brain size={16} color="#69f6b8" />
               <View className="flex-1">
                 <Text className="text-sm text-on-surface font-medium">AI mendeteksi anomali pada departemen IT.</Text>
                 <Text className="text-[10px] text-on-surface-variant mt-1">5 menit yang lalu</Text>
               </View>
            </View>
         </View>
      </View>

      {/* Allocation Tile */}
      <View className="bg-surface-container rounded-xl p-6 border border-outline-variant/10 mb-10">
        <Text className="text-lg font-bold text-on-surface mb-6">Alokasi Dana</Text>
        <View className="space-y-6">
          <View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-xs text-on-surface-variant">Operasional</Text>
              <Text className="text-xs text-primary font-bold">45%</Text>
            </View>
            <View className="h-2 bg-surface-variant rounded-full overflow-hidden">
               <View className="h-full bg-primary w-[45%] rounded-full shadow-[0_0_10px_rgba(105,246,184,0.4)]" />
            </View>
          </View>
          <View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-xs text-on-surface-variant">Investasi</Text>
              <Text className="text-xs text-tertiary font-bold">30%</Text>
            </View>
            <View className="h-2 bg-surface-variant rounded-full overflow-hidden">
               <View className="h-full bg-tertiary w-[30%] rounded-full" />
            </View>
          </View>
        </View>
        
        <View className="mt-6 p-4 rounded-xl bg-surface-container-high/50 border border-outline-variant/10">
           <Text className="text-xs text-on-surface-variant leading-relaxed italic">
             "Optimasi agen otomatis telah meningkatkan efisiensi alokasi sebesar 4.2% pada kuartal ini."
           </Text>
        </View>
      </View>
    </ScrollView>
  );
}

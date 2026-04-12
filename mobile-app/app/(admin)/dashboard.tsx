import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Bell, TrendingUp, PlusSquare, QrCode, Bot, Receipt } from 'lucide-react-native';
import { useFundTrackerContext, useAuthContext } from '@/context/FundTrackerContext';

// Helper Formatter
const formatRp = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function AdminDashboard() {
  const { user } = useAuthContext();
  const fundData = useFundTrackerContext();
  
  // Ambil inisial 
  const fullName = ((user as any)?.user_metadata?.full_name as string) || 'Administrator';
  const initals = fullName.substring(0, 2).toUpperCase();

  if (fundData.isLoading) {
     return (
       <View className="flex-1 bg-surface items-center justify-center">
         <ActivityIndicator size="large" color="#69f6b8" />
         <Text className="text-on-surface-variant mt-2 text-sm">Menyinkronkan agen pelacakan...</Text>
       </View>
     );
  }

  return (
    <ScrollView className="flex-1 bg-surface font-body mb-20" contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
      {/* Header */}
      <View className="flex-row justify-between items-center mb-8">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant/30 overflow-hidden items-center justify-center">
             <Text className="text-primary font-bold">{initals}</Text>
          </View>
          <Text className="font-bold text-primary tracking-widest text-[12px] uppercase">{fullName}</Text>
        </View>
        <TouchableOpacity className="p-2 rounded-full bg-white/10">
          <Bell size={20} color="#69f6b8" />
        </TouchableOpacity>
      </View>

      {/* Hero Section */}
      <View className="bg-surface-container-high rounded-xl p-8 mb-6 border border-outline-variant/10 shadow-2xl relative overflow-hidden">
         <View className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50" />
         <Text className="text-on-surface-variant font-medium tracking-wide mb-2">Total Saldo Terkelola</Text>
         <Text className="text-3xl font-extrabold text-primary tracking-tighter">
            {formatRp(fundData.remainingFunds)}
         </Text>
         
         <View className="flex-row items-center gap-4 mt-8">
           <View className="flex-row items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
             <TrendingUp size={16} color="#69f6b8" />
             <Text className="text-primary font-bold text-xs">Aset Total: {formatRp(fundData.totalDonations)}</Text>
           </View>
         </View>
      </View>

      {/* Quick Actions */}
      <View className="bg-surface-container-high rounded-xl p-6 mb-6 border border-outline-variant/10">
        <Text className="text-on-surface font-bold text-lg mb-4">Aksi Cepat</Text>
        <TouchableOpacity className="flex-row items-center justify-between p-4 bg-primary rounded-lg mb-3">
          <View className="flex-row items-center gap-3">
             <PlusSquare size={20} color="#005a3c" />
             <Text className="text-[#005a3c] font-bold">Tambah Pengeluaran</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center justify-between p-4 bg-surface-variant border border-primary/20 rounded-lg">
          <View className="flex-row items-center gap-3">
             <QrCode size={20} color="#69f6b8" />
             <Text className="text-primary font-bold">Pindai Struk OCR</Text>
          </View>
        </TouchableOpacity>
        <View className="mt-4 pt-4 border-t border-outline-variant/10">
           <Text className="text-xs text-on-surface-variant mb-2">Sistem Agen Realtime</Text>
           <View className="flex-row items-center gap-2">
             <View className="w-2 h-2 rounded-full bg-primary" />
             <Text className="text-sm font-medium text-on-surface">Supabase Channel Tersambung</Text>
           </View>
        </View>
      </View>

      {/* Log Aktivitas Agen */}
      <View className="bg-[rgba(25,37,64,0.6)] rounded-xl p-6 border border-outline-variant/15 mb-6">
         <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center gap-3">
              <Bot size={24} color="#69f6b8" />
              <Text className="text-lg font-bold text-on-surface">Log Aktivitas Pengeluaran</Text>
            </View>
         </View>
         
         <View className="space-y-4">
             {fundData.recentExpenses.length === 0 ? (
                <Text className="text-on-surface-variant text-sm italic">Belum ada pengeluaran hari ini.</Text>
             ) : fundData.recentExpenses.slice(0,3).map((exp, idx) => (
                <View key={exp.id || idx} className="flex-row gap-4 p-4 rounded-lg bg-surface-container/50 border-l-4 border-primary">
                    <Receipt size={16} color="#69f6b8" />
                    <View className="flex-1">
                        <Text className="text-sm text-on-surface font-medium">{exp.description || exp.category}</Text>
                        <Text className="text-primary font-bold text-xs mt-1">{formatRp(exp.amount)} dicatat</Text>
                    </View>
                </View>
             ))}
         </View>
      </View>

      {/* Allocation Tile */}
      <View className="bg-surface-container rounded-xl p-6 border border-outline-variant/10 mb-10">
        <Text className="text-lg font-bold text-on-surface mb-6">Alokasi Dana Keluar</Text>
        <View className="space-y-6">
          {fundData.categories.map((cat, idx) => (
             <View key={idx}>
               <View className="flex-row justify-between mb-2">
                 <Text className="text-xs text-on-surface-variant">{cat.name}</Text>
                 <Text className="text-xs text-primary font-bold">{cat.percentage}%</Text>
               </View>
               <View className="h-2 bg-surface-variant rounded-full overflow-hidden">
                  <View 
                    style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }} 
                    className="h-full rounded-full shadow-[0_0_10px_rgba(105,246,184,0.4)]" 
                  />
               </View>
             </View>
          ))}
        </View>
        
        <View className="mt-6 p-4 rounded-xl bg-surface-container-high/50 border border-outline-variant/10">
           <Text className="text-xs text-on-surface-variant leading-relaxed italic">
             "Optimasi alokasi dihitung otomatis dari total biaya sebesar {formatRp(fundData.totalExpenses)}."
           </Text>
        </View>
      </View>
    </ScrollView>
  );
}

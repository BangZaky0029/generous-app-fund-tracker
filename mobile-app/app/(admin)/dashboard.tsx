import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Bell, TrendingUp, PlusSquare, QrCode, Bot, Receipt, ChevronRight } from 'lucide-react-native';
import { useFundTrackerContext, useAuthContext } from '@/context/FundTrackerContext';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

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
  const fullName = user?.profile?.full_name || 'Administrator';
  const initals = fullName.substring(0, 2).toUpperCase();

  if (fundData.isLoading) {
     return (
       <View className="flex-1 bg-[#060e20] items-center justify-center">
         <ActivityIndicator size="large" color="#69f6b8" />
         <Text className="text-slate-400 mt-2 text-sm font-medium">Sinkronisasi Agen Digital...</Text>
       </View>
     );
  }

  return (
    <ScrollView 
      className="flex-1 bg-[#060e20]" 
      contentContainerStyle={{ padding: 24, paddingTop: 60, paddingBottom: 140 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center mb-10">
        <View className="flex-row items-center gap-4">
          <LinearGradient
            colors={['#69f6b8', '#00c37b']}
            className="w-12 h-12 rounded-2xl items-center justify-center shadow-lg shadow-emerald-500/40"
          >
             <Text className="text-[#002919] font-bold text-lg">{initals}</Text>
          </LinearGradient>
          <View>
            <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-[2px]">Admin Ledger</Text>
            <Text className="text-white font-bold text-lg leading-tight">{fullName}</Text>
          </View>
        </View>
        <TouchableOpacity className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50">
          <Bell size={20} color="#69f6b8" />
        </TouchableOpacity>
      </View>

      {/* Hero Balanced Section */}
      <View className="bg-slate-900 rounded-[32px] p-8 mb-8 border border-white/5 shadow-2xl relative overflow-hidden">
         <LinearGradient
           colors={['rgba(105, 246, 184, 0.15)', 'transparent']}
           start={{ x: 0, y: 0 }}
           end={{ x: 1, y: 1 }}
           className="absolute inset-0"
         />
         <View className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />
         
         <Text className="text-slate-400 font-bold text-xs uppercase tracking-[2px] mb-3">Total Saldo Terkelola</Text>
         <Text className="text-4xl font-extrabold text-white tracking-tighter mb-8">
            {formatRp(fundData.remainingFunds)}
         </Text>
         
         <View className="flex-row items-center justify-between pt-6 border-t border-white/5">
            <View>
              <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Aset Total</Text>
              <Text className="text-emerald-400 font-bold">{formatRp(fundData.totalDonations)}</Text>
            </View>
            <View className="items-end">
              <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Pengeluaran</Text>
              <Text className="text-white font-bold">{formatRp(fundData.totalExpenses)}</Text>
            </View>
         </View>
      </View>

      {/* Quick Actions */}
      <View className="mb-10">
        <Text className="text-white font-bold text-lg mb-5 px-1">Aksi Cepat</Text>
        <View className="flex-row gap-4">
          <TouchableOpacity 
            onPress={() => router.push('/modal/add-expense')}
            className="flex-1 bg-emerald-400 rounded-3xl p-5 items-center justify-center shadow-lg shadow-emerald-500/20"
          >
            <PlusSquare size={24} color="#002919" />
            <Text className="text-[#002919] font-bold mt-3 text-xs">Tambah Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => router.push('/modal/add-expense')}
            className="flex-1 bg-slate-800 rounded-3xl p-5 items-center justify-center border border-white/5"
          >
            <QrCode size={24} color="#69f6b8" />
            <Text className="text-white font-bold mt-3 text-xs">Pindai Struk</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Log Aktivitas Agen */}
      <View className="bg-slate-900/40 rounded-3xl p-6 border border-white/5 mb-8">
         <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center gap-3">
              <Bot size={22} color="#69f6b8" />
              <Text className="text-lg font-bold text-white">Log Aktivitas</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(admin)/manajemen-bukti')}>
              <Text className="text-emerald-400 font-bold text-xs">Lihat Semua</Text>
            </TouchableOpacity>
         </View>
         
         <View className="space-y-3">
             {fundData.recentExpenses.length === 0 ? (
                <View className="py-8 items-center">
                  <Text className="text-slate-500 text-sm italic text-center">Belum ada pengeluaran digital tercatat hari ini.</Text>
                </View>
             ) : fundData.recentExpenses.slice(0,3).map((exp, idx) => (
                <TouchableOpacity 
                  key={exp.id || idx} 
                  className="flex-row items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5"
                  onPress={() => exp.receipt_url && router.push({ pathname: '/(admin)/manajemen-bukti', params: { search: exp.description } })}
                >
                    <View className="w-10 h-10 rounded-xl bg-emerald-500/10 items-center justify-center">
                      <Receipt size={18} color="#69f6b8" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-sm text-white font-bold" numberOfLines={1}>{exp.description || exp.category}</Text>
                        <Text className="text-emerald-400 font-bold text-[10px] mt-0.5">{formatRp(exp.amount)}</Text>
                    </View>
                    <ChevronRight size={16} color="#475569" />
                </TouchableOpacity>
             ))}
         </View>
      </View>

      {/* Monitoring System Status */}
      <View className="px-5 py-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex-row items-center justify-between mb-10">
         <View className="flex-row items-center gap-3">
            <View className="w-2 h-2 rounded-full bg-emerald-400" />
            <Text className="text-emerald-400/80 text-[11px] font-bold uppercase tracking-wider">Sistem Agen Realtime Aktif</Text>
         </View>
         <Text className="text-slate-500 text-[10px]">Supabase TLS 1.3</Text>
      </View>
    </ScrollView>
  );
}

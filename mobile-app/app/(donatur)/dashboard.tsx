import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Bell, Heart, Activity, ShieldCheck, ChevronRight } from 'lucide-react-native';
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

export default function DonaturDashboard() {
  const { user } = useAuthContext();
  const fundData = useFundTrackerContext();

  const fullName = ((user as any)?.user_metadata?.full_name as string) || 'Budi Santoso';
  const initals = fullName.substring(0, 2).toUpperCase();

  if (fundData.isLoading) {
     return (
       <View className="flex-1 bg-surface items-center justify-center">
         <ActivityIndicator size="large" color="#00dcfd" />
         <Text className="text-on-surface-variant mt-2 text-sm">Bertukar salaman dengan database publik...</Text>
       </View>
     );
  }

  return (
    <ScrollView className="flex-1 bg-surface font-body mb-20" contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
      {/* Header */}
      <View className="flex-row justify-between items-center mb-8">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant/30 overflow-hidden">
             <View className="w-full h-full bg-primary/20 items-center justify-center">
                <Text className="text-primary font-bold">{initals}</Text>
             </View>
          </View>
          <View>
            <Text className="text-xs text-on-surface-variant">Selamat datang,</Text>
            <Text className="font-bold text-on-surface text-sm">{fullName}</Text>
          </View>
        </View>
        <TouchableOpacity className="p-2 rounded-full bg-white/10">
          <Bell size={20} color="#69f6b8" />
        </TouchableOpacity>
      </View>

      {/* Hero Section */}
      <View className="bg-surface-container-high rounded-xl p-8 mb-6 border border-outline-variant/10 shadow-2xl relative overflow-hidden">
         <View className="absolute -bottom-24 -left-24 w-64 h-64 bg-tertiary/10 rounded-full blur-3xl opacity-50" />
         <Text className="text-on-surface-variant font-medium tracking-wide mb-2">Total Penggalangan Dana</Text>
         <Text className="text-3xl font-extrabold text-white tracking-tighter">
             {formatRp(fundData.totalDonations)}
         </Text>
         
         <View className="flex-row items-center gap-4 mt-8">
           <View className="flex-row items-center gap-2 bg-tertiary/10 px-4 py-2 rounded-full border border-tertiary/20">
             <Heart size={16} color="#00dcfd" />
             <Text className="text-tertiary font-bold text-xs">Aktivis Terverifikasi</Text>
           </View>
         </View>
      </View>

      {/* Transparansi Dana Section */}
      <View className="bg-surface-container-high rounded-xl p-6 mb-6 border border-outline-variant/10">
        <View className="flex-row items-center gap-2 mb-6">
           <ShieldCheck size={20} color="#69f6b8" />
           <Text className="text-on-surface font-bold text-lg">Indikator Transparansi</Text>
        </View>
        
        <View className="space-y-6">
          <View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-xs text-on-surface-variant">Telah Disalurkan</Text>
              <Text className="text-xs text-primary font-bold">
                  {formatRp(fundData.totalExpenses)} ({fundData.usagePercentage}%)
              </Text>
            </View>
            <View className="h-2 bg-surface-variant rounded-full overflow-hidden">
               <View style={{ width: `${fundData.usagePercentage}%`}} className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(105,246,184,0.4)]" />
            </View>
          </View>
          <View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-xs text-on-surface-variant">Dalam Penahanan / Proses</Text>
              <Text className="text-xs text-tertiary font-bold">
                  {formatRp(fundData.remainingFunds)} ({100 - fundData.usagePercentage}%)
              </Text>
            </View>
            <View className="h-2 bg-surface-variant rounded-full overflow-hidden">
               <View style={{ width: `${Math.max(0, 100 - fundData.usagePercentage)}%`}} className="h-full bg-tertiary rounded-full" />
            </View>
          </View>
        </View>
      </View>

      {/* Update Penyaluran */}
      <View className="bg-[rgba(25,37,64,0.6)] rounded-xl p-6 border border-outline-variant/15 mb-10">
         <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center gap-3">
              <Activity size={24} color="#69f6b8" />
              <Text className="text-lg font-bold text-on-surface">Riwayat Sumbangan Terbaru</Text>
            </View>
         </View>
         
         <View className="space-y-4">
             {fundData.recentDonations.length === 0 ? (
                 <Text className="text-on-surface-variant text-sm italic">Belum ada sumbangan terkumpul di backend.</Text>
             ) : fundData.recentDonations.slice(0,3).map((don, idx) => (
                 <View key={don.id || idx} className="flex-row gap-4 p-4 rounded-lg bg-surface-container/50 border-l-4 border-primary items-center">
                    <View className="flex-1">
                      <Text className="text-sm text-on-surface font-medium">{don.donator_name || 'Hamba Allah'}</Text>
                      <Text className="text-[10px] text-primary font-bold mt-1">Berhasil membukukan dana sebesar {formatRp(don.amount)}</Text>
                    </View>
                    <ChevronRight size={16} color="#6d758c" />
                 </View>
             ))}
         </View>
      </View>

    </ScrollView>
  );
}

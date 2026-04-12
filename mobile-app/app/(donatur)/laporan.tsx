import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFundTrackerContext } from '@/context/FundTrackerContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LaporanDonatur() {
  const fundData = useFundTrackerContext();

  const formatRp = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <View className="flex-row justify-between items-center px-6 py-4 bg-[#192540]/90 border-b border-outline-variant/15 z-50">
        <View className="flex-row items-center gap-3">
          <MaterialIcons name="grid-view" size={24} color="#69f6b8" />
          <Text className="font-headline font-bold text-lg text-primary tracking-tight uppercase">Transparansi</Text>
        </View>
        <View className="w-10 h-10 rounded-full border-2 border-primary/20 items-center justify-center bg-surface-variant overflow-hidden">
           <MaterialIcons name="person" size={20} color="#69f6b8" />
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-6 mb-24">
        {/* Hero Section */}
        <View className="mb-10">
          <Text className="font-headline font-extrabold text-4xl text-on-surface tracking-tight mb-2">Laporan Audit</Text>
          <Text className="text-on-surface-variant text-base">Distribusi dana publik secara real-time untuk akuntabilitas setiap rupiah.</Text>
        </View>

        {/* Transparansi Feed List */}
        <View className="mb-12">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="font-headline font-bold text-2xl text-on-surface">Pengeluaran Terverifikasi</Text>
          </View>
          
          <View className="space-y-4">
            {fundData.recentExpenses.map((expense) => (
              <View key={expense.id} className="bg-surface-container-high border border-outline-variant/15 p-5 rounded-lg flex-col gap-3 group mt-3">
                <View className="flex-row items-center gap-4">
                  <View className="w-12 h-12 rounded-full bg-surface-variant items-center justify-center">
                    <MaterialIcons 
                       name={expense.category === 'Logistik' ? 'local-shipping' : (expense.category === 'Kesehatan' ? 'medical-services' : 'school')} 
                       size={24} 
                       color="#69f6b8" 
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="font-headline font-bold text-on-surface">{expense.description}</Text>
                    <View className="flex-row items-center gap-2 mt-1">
                      <View className="bg-primary/10 px-2 py-0.5 rounded-full">
                        <Text className="text-xs text-primary font-bold uppercase">{expense.category}</Text>
                      </View>
                      <Text className="text-on-surface-variant text-xs">{new Date(expense.created_at).toLocaleDateString('id-ID')}</Text>
                    </View>
                  </View>
                </View>
                
                <View className="flex-row items-center justify-between mt-2 border-t border-outline-variant/10 pt-3">
                  <Text className="font-headline font-bold text-lg text-on-surface">{formatRp(expense.amount)}</Text>
                  <TouchableOpacity className="flex-row items-center gap-2 px-5 py-2 rounded-full border border-primary">
                    <MaterialIcons name="visibility" size={16} color="#69f6b8" />
                    <Text className="text-primary text-sm font-bold">Bukti</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            
            {fundData.recentExpenses.length === 0 && (
              <Text className="text-on-surface-variant text-center mt-4">Belum ada rekaman audit.</Text>
            )}
          </View>
        </View>
        
        {/* Audit CTA */}
        <View className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-6 items-center mb-10">
            <MaterialIcons name="picture-as-pdf" size={48} color="#06b77f" />
            <Text className="font-headline font-extrabold text-xl text-on-surface mt-4 mb-2 text-center">Laporan Tahunan 2024</Text>
            <Text className="text-on-surface-variant text-center text-sm mb-6">Unduh format PDF untuk dokumen validasi KAP Independen.</Text>
            
            <TouchableOpacity className="bg-gradient-to-tr from-[#06b77f] to-[#69f6b8] bg-[#69f6b8] px-8 py-3 rounded-full flex-row items-center gap-2">
               <Text className="text-[#002919] font-bold">Download Laporan PDF</Text>
            </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

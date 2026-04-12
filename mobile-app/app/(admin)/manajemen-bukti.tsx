import { View, Text, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFundTrackerContext } from '@/context/FundTrackerContext';

export default function ManajemenBukti() {
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
          <View className="w-8 h-8 rounded-full border border-primary/30 items-center justify-center bg-surface-variant overflow-hidden">
             <MaterialIcons name="person" size={16} color="#69f6b8" />
          </View>
          <Text className="font-headline font-bold text-sm text-primary tracking-widest uppercase">Ethereal Vault</Text>
        </View>
        <MaterialIcons name="notifications" size={24} color="#a3aac4" />
      </View>

      <View className="px-6 pt-6 pb-2">
        <Text className="font-headline text-3xl font-extrabold text-on-surface mb-6 tracking-tight">Galeri Bukti</Text>
        <View className="bg-surface-container rounded-lg p-1 border border-outline-variant/15 flex-row items-center gap-3 px-4 mb-4">
          <MaterialIcons name="search" size={20} color="#6d758c" />
          <TextInput 
             className="flex-1 text-on-surface font-body py-3"
             placeholder="Cari transaksi atau kategori..."
             placeholderTextColor="#6d758c"
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pb-24">
        <View className="flex-row flex-wrap justify-between">
          {fundData.recentExpenses.map((expense) => (
             <TouchableOpacity key={expense.id} className="w-[48%] bg-surface-container-high rounded-xl overflow-hidden border border-outline-variant/15 mb-4 active:scale-95 transition-all">
                <View className="aspect-square w-full relative bg-surface-variant items-center justify-center">
                   {expense.receipt_url ? (
                      <Image source={{uri: expense.receipt_url}} className="w-full h-full object-cover" />
                   ) : (
                      <MaterialIcons name="photo" size={48} color="#40485d" />
                   )}
                   <View className="absolute inset-0 bg-surface-dim/40" />
                   
                   {/* Badge Status */}
                   <View className="absolute top-3 left-3 px-2 py-1 bg-[#192540]/80 rounded-full border border-outline-variant/30 flex-row items-center gap-1">
                      {expense.receipt_url ? (
                        <>
                          <MaterialIcons name="check-circle" size={10} color="#69f6b8" />
                          <Text className="text-[8px] font-bold text-primary tracking-wider uppercase">Berhasil</Text>
                        </>
                      ) : (
                        <>
                          <View className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <Text className="text-[8px] font-bold text-on-surface tracking-wider uppercase">Pending</Text>
                        </>
                      )}
                   </View>
                </View>
                <View className="p-3">
                   <Text className="font-headline font-bold text-on-surface mb-1 text-xs" numberOfLines={1}>{expense.description}</Text>
                   <Text className="font-headline text-sm font-semibold text-primary mb-2">{formatRp(expense.amount)}</Text>
                   <Text className="text-[8px] text-on-surface-variant font-medium uppercase tracking-widest">{new Date(expense.created_at).toLocaleDateString('id-ID')}</Text>
                </View>
             </TouchableOpacity>
          ))}
          
          {fundData.recentExpenses.length === 0 && (
             <View className="w-full mt-10 items-center justify-center p-6 border border-dashed border-outline-variant/20 rounded-xl">
                <Text className="text-on-surface-variant">Belum ada galeri bukti terekam.</Text>
             </View>
          )}

        </View>
      </ScrollView>

    </SafeAreaView>
  );
}

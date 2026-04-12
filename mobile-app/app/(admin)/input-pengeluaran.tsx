import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';

export default function InputPengeluaran() {
   const [amount, setAmount] = useState('');
   const [category, setCategory] = useState<string | null>(null);
   const [desc, setDesc] = useState('');

   const Categories = [
     { id: 'logistik', label: 'Logistik', icon: 'inventory-2' as any },
     { id: 'medis', label: 'Medis', icon: 'medical-services' as any },
     { id: 'operasional', label: 'Operasional', icon: 'bolt' as any },
     { id: 'lainnya', label: 'Lainnya', icon: 'more-horiz' as any }
   ];

   return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      {/* TopAppBar */}
      <View className="flex-row justify-between items-center px-6 py-4 bg-[#192540]/90 border-b border-outline-variant/15 z-50">
        <View className="flex-row items-center gap-3">
          <View className="w-8 h-8 rounded-full border border-primary/30 items-center justify-center bg-surface-variant overflow-hidden">
             <MaterialIcons name="person" size={16} color="#69f6b8" />
          </View>
          <Text className="font-headline font-bold text-sm text-primary tracking-widest uppercase">Input Pengeluaran</Text>
        </View>
        <MaterialIcons name="notifications" size={24} color="#69f6b8" />
      </View>

      <ScrollView className="flex-1 px-6 pt-6 mb-24">
         <View className="mb-10 items-center">
            <Text className="text-on-surface-variant font-label text-xs tracking-widest uppercase mb-2">Input Transaksi Baru</Text>
            <Text className="font-headline text-2xl font-extrabold text-on-surface">Digital Command Center</Text>
         </View>

         <View className="bg-surface-container rounded-xl p-8 border border-outline-variant/15 shadow-2xl relative overflow-hidden">
            <View className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full" />
            
            {/* Amount */}
            <View className="mb-6">
               <Text className="font-headline text-sm font-bold text-primary tracking-wide uppercase mb-3">Nominal Transaksi</Text>
               <View className="relative justify-center">
                  <Text className="absolute left-6 text-on-surface-variant font-headline font-bold text-xl z-10">Rp</Text>
                  <TextInput 
                     className="bg-[#000000] border border-outline-variant/15 rounded-lg py-5 pl-16 pr-6 text-2xl font-headline font-extrabold text-on-surface"
                     placeholder="0"
                     placeholderTextColor="#4d556b"
                     keyboardType="numeric"
                     value={amount}
                     onChangeText={setAmount}
                  />
               </View>
            </View>

            {/* Kategori */}
            <View className="mb-6">
               <Text className="font-headline text-sm font-bold text-primary tracking-wide uppercase mb-3">Kategori</Text>
               <View className="flex-row flex-wrap justify-between">
                 {Categories.map((cat) => {
                    const isSelected = category === cat.id;
                    return (
                      <TouchableOpacity 
                         key={cat.id} 
                         onPress={() => setCategory(cat.id)}
                         className={`w-[48%] py-4 rounded-lg flex-row items-center justify-center gap-2 mb-3 border ${isSelected ? 'bg-primary-container border-primary' : 'bg-surface-container-high border-outline-variant/10'}`}
                      >
                         <MaterialIcons name={cat.icon} size={18} color={isSelected ? '#002919' : '#a3aac4'} />
                         <Text className={`font-bold text-sm ${isSelected ? 'text-on-primary-container' : 'text-on-surface-variant'}`}>{cat.label}</Text>
                      </TouchableOpacity>
                    )
                 })}
               </View>
            </View>

            {/* Deskripsi */}
            <View className="mb-6">
               <Text className="font-headline text-sm font-bold text-primary tracking-wide uppercase mb-3">Deskripsi</Text>
               <TextInput 
                  className="bg-[#000000] border border-outline-variant/15 rounded-lg p-5 text-on-surface font-body"
                  placeholder="Keterangan pengeluaran..."
                  placeholderTextColor="#4d556b"
                  multiline
                  numberOfLines={3}
                  value={desc}
                  onChangeText={setDesc}
                  style={{ textAlignVertical: 'top' }}
               />
            </View>

            <View className="pt-4 mt-2 border-t border-outline-variant/10">
               <TouchableOpacity 
                  onPress={() => router.push('/(admin)/validasi-kamera')}
                  className="bg-primary py-4 rounded-lg flex-row items-center justify-center gap-3 active:scale-95 transition-transform"
               >
                  <Text className="font-headline font-bold text-lg text-on-primary-container">Lanjutkan ke Kamera</Text>
                  <MaterialIcons name="photo-camera" size={24} color="#002919" />
               </TouchableOpacity>
               <Text className="text-center text-on-surface-variant/60 text-xs mt-4 font-label">Verifikasi struk akan dilakukan di langkah berikutnya.</Text>
            </View>
         </View>

      </ScrollView>
    </SafeAreaView>
   )
}

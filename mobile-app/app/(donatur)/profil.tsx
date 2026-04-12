import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthContext } from '@/context/FundTrackerContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfilDonatur() {
  const { user, signOut } = useAuthContext();
  
  const fullName = ((user as any)?.user_metadata?.full_name as string) || 'Donatur Anonim';
  const initial = fullName.substring(0, 1).toUpperCase();

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      {/* TopAppBar */}
      <View className="flex-row justify-between items-center px-6 py-4 bg-[#192540]/90 border-b border-outline-variant/15 z-50">
        <View className="flex-row items-center gap-3">
          <MaterialIcons name="grid-view" size={24} color="#69f6b8" />
          <Text className="font-headline font-bold text-lg text-primary tracking-tight">Profil Donatur</Text>
        </View>
        <View className="w-10 h-10 rounded-full border-2 border-primary/20 items-center justify-center bg-surface-variant overflow-hidden">
           <Text className="text-on-surface font-bold">{initial}</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-6 pb-32">
        {/* User Info Bento Card */}
        <View className="bg-surface-container-high rounded-xl p-8 items-center relative overflow-hidden mb-6 border border-outline-variant/10">
          <View className="w-24 h-24 rounded-full bg-primary-container items-center justify-center shadow-lg border-4 border-surface mb-6">
            <MaterialIcons name="person" size={48} color="#00452d" />
            <View className="absolute -bottom-1 -right-1 bg-surface-container-highest p-1 rounded-full shadow-lg">
              <MaterialIcons name="verified" size={16} color="#69f6b8" />
            </View>
          </View>
          <Text className="font-headline font-bold text-2xl text-on-surface mb-1">{fullName}</Text>
          <View className="flex-row items-center gap-2 px-4 py-1.5 rounded-full bg-surface-variant border border-outline-variant/15">
            <MaterialIcons name="military-tech" size={18} color="#69f6b8" />
            <Text className="text-sm font-bold text-on-surface-variant">Silver Contributor</Text>
          </View>
        </View>

        {/* Contribution Summary Bento Card */}
        <View className="bg-surface-container-high rounded-xl p-8 border border-outline-variant/10 relative overflow-hidden mb-8">
          <Text className="text-on-surface-variant font-medium text-xs uppercase tracking-widest mb-2">Total Kontribusi</Text>
          <Text className="font-headline text-4xl font-extrabold text-primary">Rp12.500.000</Text>
          
          <View className="flex-row items-center justify-between mt-6">
            <View className="flex-col">
              <Text className="text-[10px] text-on-surface-variant/80 uppercase">Peringkat Edu</Text>
              <Text className="text-sm font-bold text-on-surface">#124 Teratas</Text>
            </View>
            <View className="h-8 w-px bg-outline-variant/30" />
            <View className="flex-col">
              <Text className="text-[10px] text-on-surface-variant/80 uppercase">Kampanye</Text>
              <Text className="text-sm font-bold text-on-surface">12 Bantuan</Text>
            </View>
            <View className="h-8 w-px bg-outline-variant/30" />
            <View className="flex-col">
              <Text className="text-[10px] text-on-surface-variant/80 uppercase">Bergabung</Text>
              <Text className="text-sm font-bold text-on-surface">Jan 2024</Text>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View className="bg-surface-container-high rounded-xl overflow-hidden border border-outline-variant/10 mb-20">
          <TouchableOpacity className="flex-row items-center justify-between p-5 border-b border-outline-variant/10" activeOpacity={0.7}>
            <View className="flex-row items-center gap-4">
              <MaterialIcons name="security" size={24} color="#a3aac4" />
              <Text className="font-medium text-on-surface">Keamanan</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#a3aac4" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center justify-between p-5 border-b border-outline-variant/10" activeOpacity={0.7}>
            <View className="flex-row items-center gap-4">
              <MaterialIcons name="help" size={24} color="#a3aac4" />
              <Text className="font-medium text-on-surface">Pusat Bantuan</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#a3aac4" />
          </TouchableOpacity>
          <TouchableOpacity onPress={signOut} className="flex-row items-center justify-between p-5" activeOpacity={0.7}>
            <View className="flex-row items-center gap-4">
              <MaterialIcons name="logout" size={24} color="#d7383b" />
              <Text className="font-medium text-error-dim">Keluar</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthContext } from '@/context/FundTrackerContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminProfil() {
  const { user, signOut } = useAuthContext();
  
  const fullName = ((user as any)?.user_metadata?.full_name as string) || 'Administrator';
  const email = user?.email || 'admin@fundtracker.com';
  const initial = fullName.substring(0, 1).toUpperCase();

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      {/* TopAppBar */}
      <View className="flex-row justify-between items-center px-6 py-4 bg-[#192540]/90 border-b border-outline-variant/15 z-50">
        <View className="flex-row items-center gap-3">
          <MaterialIcons name="admin-panel-settings" size={24} color="#69f6b8" />
          <Text className="font-headline font-bold text-lg text-primary tracking-tight uppercase">Admin Control</Text>
        </View>
        <TouchableOpacity className="w-10 h-10 rounded-full border-2 border-primary/20 items-center justify-center bg-surface-variant overflow-hidden">
           <Text className="text-on-surface font-bold">{initial}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 pt-6 pb-32">
        {/* Admin Card */}
        <View className="bg-surface-container-high rounded-xl p-8 items-center relative overflow-hidden mb-6 border border-outline-variant/10 shadow-2xl">
          <View className="absolute -top-12 -left-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
          
          <View className="w-24 h-24 rounded-full bg-primary-container items-center justify-center shadow-lg border-4 border-surface mb-6">
            <MaterialIcons name="security" size={48} color="#00452d" />
          </View>
          
          <Text className="font-headline font-bold text-2xl text-on-surface mb-1">{fullName}</Text>
          <Text className="text-on-surface-variant text-sm mb-4">{email}</Text>
          
          <View className="flex-row items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <MaterialIcons name="verified-user" size={16} color="#69f6b8" />
            <Text className="text-xs font-bold text-primary uppercase tracking-widest">Master Admin</Text>
          </View>
        </View>

        {/* Management Options */}
        <View className="bg-surface-container-high rounded-xl overflow-hidden border border-outline-variant/10 mb-8">
           <View className="p-4 border-b border-outline-variant/10 bg-surface-variant/30">
              <Text className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Manajemen Sistem</Text>
           </View>
           
           <TouchableOpacity className="flex-row items-center justify-between p-5 border-b border-outline-variant/10" activeOpacity={0.7}>
            <View className="flex-row items-center gap-4">
              <MaterialIcons name="people" size={24} color="#a3aac4" />
              <Text className="font-medium text-on-surface">Manajemen User</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#a3aac4" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between p-5 border-b border-outline-variant/10" activeOpacity={0.7}>
            <View className="flex-row items-center gap-4">
              <MaterialIcons name="settings" size={24} color="#a3aac4" />
              <Text className="font-medium text-on-surface">Pengaturan Global</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#a3aac4" />
          </TouchableOpacity>

          <TouchableOpacity onPress={signOut} className="flex-row items-center justify-between p-5" activeOpacity={0.7}>
            <View className="flex-row items-center gap-4">
              <MaterialIcons name="logout" size={24} color="#d7383b" />
              <Text className="font-medium text-error-dim">Keluar Aplikasi</Text>
            </View>
            <MaterialIcons name="power-settings-new" size={20} color="#d7383b" />
          </TouchableOpacity>
        </View>

        {/* System Info */}
        <View className="items-center opacity-40 mb-20">
           <Text className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tighter">Generous Fund Tracker v2.0.4</Text>
           <Text className="text-[10px] text-on-surface-variant">Connected to Supabase Realtime Engine</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

import { Stack } from 'expo-router';
import { AppColors } from '@/constants/theme';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#060e20' },
        animation: 'slide_from_right',
      }}
    >
      {/* Main Tab destinations are nested here */}
      <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
      
      {/* Deeply nested Stack screens (Tabs hidden by default) */}
      <Stack.Screen name="campaign-manage" />
      <Stack.Screen name="add-expense" />
      <Stack.Screen name="add-donation" />
      <Stack.Screen name="add-campaign-update" />
      <Stack.Screen name="create-campaign" />
      <Stack.Screen name="validasi-kamera" />
      <Stack.Screen name="input-pengeluaran" />
    </Stack>
  );
}

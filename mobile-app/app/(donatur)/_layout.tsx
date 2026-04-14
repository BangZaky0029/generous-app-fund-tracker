import { Stack } from 'expo-router';

export default function DonaturLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#060e20' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
      <Stack.Screen name="campaign-detail" />
      <Stack.Screen name="donation-form" />
    </Stack>
  );
}

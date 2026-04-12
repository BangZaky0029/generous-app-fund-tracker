/**
 * App Entry Point — Auth Gatekeeper
 */
import { Redirect } from 'expo-router';
import { View, ActivityIndicator, Text } from 'react-native';
import { useAuthContext } from '@/context/FundTrackerContext';

export default function AppIndex() {
  const { user, isAdmin, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <View className="flex-1 bg-surface items-center justify-center gap-4">
        <ActivityIndicator size="large" color="#69f6b8" />
        <Text className="text-on-surface-variant text-sm">Memuat sesi...</Text>
      </View>
    );
  }

  if (user) {
    if (isAdmin) {
      return <Redirect href="/(admin)/dashboard" />;
    }
    return <Redirect href="/(donatur)/dashboard" />;
  }

  return <Redirect href="/(auth)/login" />;
}

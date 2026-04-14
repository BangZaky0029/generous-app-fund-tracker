import { Tabs } from 'expo-router';
import { LayoutDashboard, Receipt, User } from 'lucide-react-native';

export default function DonaturLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 24,
          left: 20,
          right: 20,
          elevation: 0,
          backgroundColor: 'rgba(25, 37, 64, 0.9)',
          borderRadius: 9999,
          height: 64,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: 'rgba(64, 72, 93, 0.15)',
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#06b77f',
        tabBarInactiveTintColor: '#6d758c',
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 10, fontFamily: 'Inter', fontWeight: '500' },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="laporan"
        options={{
          title: 'Riwayat',
          tabBarIcon: ({ color, size }) => <Receipt size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="campaign-detail"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="donation-form"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tabs>
  );
}

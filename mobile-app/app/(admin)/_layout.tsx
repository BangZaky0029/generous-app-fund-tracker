import { Tabs, router } from 'expo-router';
import { LayoutDashboard, ReceiptText, UploadCloud, Camera, User } from 'lucide-react-native';
import { TouchableOpacity, View } from 'react-native';

export default function AdminLayout() {
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
          backgroundColor: 'rgba(25, 37, 64, 0.95)',
          borderRadius: 32,
          height: 64,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: 'rgba(64, 72, 93, 0.15)',
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#69f6b8',
        tabBarInactiveTintColor: '#6d758c',
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 10, fontFamily: 'Inter', fontWeight: '500' },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="input-pengeluaran"
        options={{
          href: null,
          title: 'Input',
          tabBarStyle: { display: 'none' },
        }}
      />
      
      <Tabs.Screen
        name="validasi-kamera"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />

      <Tabs.Screen
        name="manajemen-bukti"
        options={{
          title: 'Gallery',
          tabBarIcon: ({ color, size }) => <ReceiptText size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Admin',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />

      {/* Internal Screens (Hidden from Tab Bar UI but within Tab System) */}
      <Tabs.Screen
        name="add-expense"
        options={{
          href: null,
          title: 'Input Pengeluaran',
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="add-donation"
        options={{
          href: null,
          title: 'Catat Donasi',
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="create-campaign"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="add-campaign-update"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="campaign-manage"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tabs>
  );
}

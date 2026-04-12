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
          title: 'Input',
          tabBarIcon: ({ color, size }) => <UploadCloud size={size} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="validasi-kamera"
        options={{
          title: 'Kamera',
          tabBarStyle: { display: 'none' },
          tabBarButton: (props) => (
            <TouchableOpacity
              onPress={() => {
                router.push({
                  pathname: '/(admin)/validasi-kamera',
                  params: { mode: 'scan' }
                });
              }}
              onLongPress={props.onLongPress ?? undefined}
              activeOpacity={0.8}
              style={{
                top: -30,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: '#69f6b8',
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#69f6b8',
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.3,
                  shadowRadius: 15,
                  elevation: 5,
                }}
              >
                <Camera size={32} color="#060e20" />
              </View>
            </TouchableOpacity>
          ),
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
        }}
      />
      <Tabs.Screen
        name="add-donation"
        options={{
          href: null,
          title: 'Catat Donasi',
        }}
      />
    </Tabs>
  );
}

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Dimensions, Pressable } from 'react-native';
import { Bell, Heart, Receipt, Newspaper, MessageCircle, X } from 'lucide-react-native';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuthContext } from '@/context/FundTrackerContext';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export const NotificationBell = () => {
  const { user } = useAuthContext();
  const { 
    unreadCount, 
    recentNotifications, 
    isDropdownVisible, 
    setIsDropdownVisible,
    markAllAsRead 
  } = useNotifications();

  const handleToggle = () => {
    if (isDropdownVisible) {
      markAllAsRead();
    }
    setIsDropdownVisible(!isDropdownVisible);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_donation':
      case 'donation_confirmed':
        return <Heart size={14} color="#69f6b8" />;
      case 'new_expense':
        return <Receipt size={14} color="#ff4757" />;
      case 'new_campaign':
      case 'campaign_update':
        return <Newspaper size={14} color="#60a5fa" />;
      default:
        return <MessageCircle size={14} color="#94a3b8" />;
    }
  };

  return (
    <View>
      <TouchableOpacity style={styles.notifBtn} onPress={handleToggle}>
        <Bell size={20} color={unreadCount > 0 ? "#69f6b8" : "#64748b"} />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={isDropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDropdownVisible(false)}
      >
        <Pressable 
            style={styles.modalOverlay} 
            onPress={() => {
                markAllAsRead();
                setIsDropdownVisible(false);
            }}
        >
          <View style={styles.dropdownContainer}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Notifikasi Terbaru</Text>
              <TouchableOpacity onPress={() => setIsDropdownVisible(false)}>
                <X size={16} color="#4b5563" />
              </TouchableOpacity>
            </View>

            <ScrollView 
                style={styles.notifList}
                showsVerticalScrollIndicator={false}
            >
              {recentNotifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Belum ada notifikasi.</Text>
                </View>
              ) : (
                recentNotifications.map((n) => (
                  <View key={n.id} style={[styles.notifItem, !n.is_read && styles.unreadItem]}>
                    <View style={styles.iconContainer}>
                        {getIcon(n.data?.type)}
                    </View>
                    <View style={styles.notifContent}>
                      <Text style={styles.notifTitle} numberOfLines={1}>{n.title}</Text>
                      <Text style={styles.notifMessage} numberOfLines={2}>{n.message}</Text>
                      <Text style={styles.notifTime}>
                        {new Date(n.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
            
            <TouchableOpacity 
                style={styles.seeAllBtn}
                onPress={() => {
                    setIsDropdownVisible(false);
                    const role = (user as any)?.profile?.role;
                    if (role === 'admin') {
                        router.push('/(admin)/notifications');
                    } else {
                        router.push('/(donatur)/notifications');
                    }
                }}
            >
                <Text style={styles.seeAllText}>Buka Semua Notifikasi</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  notifBtn: { 
    padding: 10, 
    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
    borderRadius: 14,
    position: 'relative'
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#ff4757',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#060e20'
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  dropdownContainer: {
    position: 'absolute',
    top: 110, // Di bawah lonceng dashboard
    right: 24,
    width: width * 0.75, // Sekitar 3/4 lebar atau menyesuaikan
    maxHeight: height * 0.4, // Seperempat lebih sedikit layar
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden'
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)'
  },
  dropdownTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold'
  },
  notifList: {
    padding: 8
  },
  notifItem: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    marginBottom: 4
  },
  unreadItem: {
    backgroundColor: 'rgba(105, 246, 184, 0.03)'
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  notifContent: {
    flex: 1,
    gap: 2
  },
  notifTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  notifMessage: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 16
  },
  notifTime: {
    color: '#4b5563',
    fontSize: 9,
    marginTop: 4
  },
  seeAllBtn: {
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(255,255,255,0.01)'
  },
  seeAllText: {
    color: '#69f6b8',
    fontSize: 11,
    fontWeight: 'bold'
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center'
  },
  emptyText: {
    color: '#4b5563',
    fontSize: 12
  }
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { ChevronLeft, Bell, Heart, Receipt, Newspaper, MessageCircle, CheckCheck } from 'lucide-react-native';
import { router } from 'expo-router';
import { useNotifications } from '@/hooks/useNotifications';
import { LinearGradient } from 'expo-linear-gradient';

export default function AdminNotifications() {
  const { recentNotifications, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifs = filter === 'all' 
    ? recentNotifications 
    : recentNotifications.filter(n => !n.is_read);

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_donation':
        return <Heart size={18} color="#69f6b8" />;
      case 'new_expense':
        return <Receipt size={18} color="#ff4757" />;
      case 'new_campaign':
      case 'campaign_update':
        return <Newspaper size={18} color="#60a5fa" />;
      default:
        return <MessageCircle size={18} color="#94a3b8" />;
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#1e293b', '#060e20']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Otoritas Notifikasi</Text>
          <TouchableOpacity onPress={markAllAsRead} style={styles.headerAction}>
            <CheckCheck size={20} color="#69f6b8" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabRow}>
          <TouchableOpacity 
            onPress={() => setFilter('all')}
            style={[styles.tab, filter === 'all' && styles.activeTab]}
          >
            <Text style={[styles.tabText, filter === 'all' && styles.activeTabText]}>Semua</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setFilter('unread')}
            style={[styles.tab, filter === 'unread' && styles.activeTab]}
          >
            <Text style={[styles.tabText, filter === 'unread' && styles.activeTabText]}>Belum Dibaca</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredNotifs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Bell size={40} color="#1e293b" />
            <Text style={styles.emptyTitle}>Log Bersih</Text>
            <Text style={styles.emptyDesc}>Tidak ada notifikasi sistem yang perlu diperhatikan saat ini.</Text>
          </View>
        ) : (
          filteredNotifs.map((n) => (
            <View key={n.id} style={[styles.notifCard, !n.is_read && styles.unreadCard]}>
              <View style={[styles.iconBox, { backgroundColor: n.is_read ? 'rgba(255,255,255,0.03)' : 'rgba(105, 246, 184, 0.1)' }]}>
                {getIcon(n.data?.type)}
              </View>
              <View style={styles.notifMain}>
                <Text style={styles.notifTitle}>{n.title}</Text>
                <Text style={styles.notifMsg}>{n.message}</Text>
                <Text style={styles.notifTime}>
                  {new Date(n.created_at).toLocaleString('id-ID')}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#060e20' },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  headerAction: { padding: 8 },
  tabRow: { flexDirection: 'row', gap: 12 },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.03)' },
  activeTab: { backgroundColor: '#69f6b8' },
  tabText: { color: '#64748b', fontSize: 13, fontWeight: '600' },
  activeTabText: { color: '#002919' },
  content: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  notifCard: { flexDirection: 'row', gap: 16, padding: 16, backgroundColor: '#0f172a', borderRadius: 20, marginBottom: 12 },
  unreadCard: { borderColor: 'rgba(105, 246, 184, 0.2)', borderWidth: 1 },
  iconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  notifMain: { flex: 1, gap: 2 },
  notifTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  notifMsg: { color: '#94a3b8', fontSize: 12, lineHeight: 18 },
  notifTime: { color: '#4b5563', fontSize: 10, marginTop: 4 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 16 },
  emptyDesc: { color: '#64748b', textAlign: 'center', paddingHorizontal: 40, fontSize: 14, marginTop: 8 }
});

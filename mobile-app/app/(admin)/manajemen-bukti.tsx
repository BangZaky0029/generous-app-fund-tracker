import React, { useState, useMemo } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, 
  TextInput, Image, Modal, StyleSheet, 
  Dimensions, ActivityIndicator 
} from 'react-native';
import { 
  Search, Receipt, Calendar, 
  Trash2, Maximize2, X, Filter,
  AlertCircle, Download, ExternalLink, Sparkles
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFundTrackerContext } from '@/context/FundTrackerContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { AppColors, AppFonts, AppRadius, AppSpacing, CATEGORIES } from '@/constants/theme';
import { deleteExpense } from '@/services/expenseService';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function ManajemenBukti() {
  const { recentExpenses, isLoading, refetch, showAlert } = useFundTrackerContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const formatRp = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Logic: Search & Filter
  const filteredExpenses = useMemo(() => {
    return recentExpenses.filter(expense => {
      const matchQuery = expense.description?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         expense.amount.toString().includes(searchQuery) ||
                         expense.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory ? expense.category === selectedCategory : true;
      return matchQuery && matchCategory;
    });
  }, [recentExpenses, searchQuery, selectedCategory]);

  const handleDelete = async (id: string) => {
    showAlert(
      'Hapus Bukti Permanen',
      'Apakah Anda yakin ingin menghapus data pengeluaran dan foto bukti ini? Tindakan ini akan menghapus aset dari server ledger.',
      'warning',
      async () => {
        setIsDeleting(id);
        try {
          await deleteExpense(id);
          await refetch();
          showAlert('Sukses', 'Aset berhasil dihapus dari cloud.', 'success');
        } catch (err) {
          showAlert('Error', 'Gagal menghapus data. Periksa koneksi agent.', 'error');
        } finally {
          setIsDeleting(null);
        }
      }
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Asset Gallery</Text>
            <View style={styles.vaultBadge}>
              <Sparkles size={10} color={AppColors.accent.emerald} />
              <Text style={styles.vaultText}>Cloud Vault Verified</Text>
            </View>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statCount}>{filteredExpenses.length}</Text>
            <Text style={styles.statLabel}>Items</Text>
          </View>
        </View>

        {/* Floating Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={18} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari transaksi atau kategori..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>

        {/* Horizontal Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.filterScroll}
        >
          <TouchableOpacity 
            style={[styles.filterChip, !selectedCategory && styles.filterChipActive]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[styles.filterText, !selectedCategory && styles.filterTextActive]}>Semua</Text>
          </TouchableOpacity>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity 
              key={cat.name} 
              style={[styles.filterChip, selectedCategory === cat.name && { borderColor: cat.color, backgroundColor: `${cat.color}20` }]}
              onPress={() => setSelectedCategory(cat.name)}
            >
              <Text style={[styles.filterText, selectedCategory === cat.name && { color: cat.color, fontWeight: '700' }]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {isLoading && filteredExpenses.length === 0 ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={AppColors.accent.emerald} />
            <Text style={styles.loadingText}>Menghubungkan ke Storage...</Text>
          </View>
        ) : filteredExpenses.length > 0 ? (
          <View style={styles.grid}>
            {filteredExpenses.map((expense) => (
              <GlassCard key={expense.id} style={styles.card}>
                {/* Image Section */}
                <TouchableOpacity 
                  style={styles.imageContainer} 
                  activeOpacity={0.9}
                  onPress={() => expense.receipt_url && setPreviewImage(expense.receipt_url)}
                >
                  {expense.receipt_url ? (
                    <Image source={{ uri: expense.receipt_url }} style={styles.image} />
                  ) : (
                    <View style={styles.noImage}>
                      <Receipt size={32} color="rgba(255,255,255,0.05)" />
                      <Text style={styles.noImageText}>Tanpa Bukti</Text>
                    </View>
                  )}
                  
                  {/* Overlay Tools */}
                  <LinearGradient
                    colors={['rgba(0,0,0,0.6)', 'transparent']}
                    className="absolute top-0 left-0 right-0 h-16 p-3"
                  >
                    <View style={styles.cardHeader}>
                       <View style={[styles.categoryBadge, { backgroundColor: CATEGORIES.find(c => c.name === expense.category)?.color + '30' }]}>
                          <Text style={[styles.categoryBadgeText, { color: CATEGORIES.find(c => c.name === expense.category)?.color }]}>
                            {expense.category}
                          </Text>
                       </View>
                       <TouchableOpacity 
                          style={styles.deleteBtn}
                          onPress={() => handleDelete(expense.id)}
                          disabled={isDeleting === expense.id}
                       >
                          {isDeleting === expense.id ? (
                             <ActivityIndicator size="small" color={AppColors.accent.red} />
                          ) : (
                             <Trash2 size={12} color="#fff" />
                          )}
                       </TouchableOpacity>
                    </View>
                  </LinearGradient>

                  {expense.receipt_url && (
                    <View style={styles.previewHint}>
                       <Maximize2 size={10} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>

                {/* Content Section */}
                <View style={styles.cardBody}>
                   <Text style={styles.expensePrice}>{formatRp(expense.amount)}</Text>
                   <Text style={styles.expenseDesc} numberOfLines={1}>{expense.description || 'Deskripsi kosong'}</Text>
                   
                   <View style={styles.cardFooter}>
                      <Calendar size={10} color="#64748b" />
                      <Text style={styles.expenseDate}>
                        {new Date(expense.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </Text>
                   </View>
                </View>
              </GlassCard>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
             <View style={styles.emptyIconCircle}>
                <AlertCircle size={40} color="#334155" />
             </View>
             <Text style={styles.emptyTitle}>Galeri Kosong</Text>
             <Text style={styles.emptyText}>Tidak ada aset digital yang cocok dengan filter pencarian Anda.</Text>
          </View>
        )}
        
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Modern Image Preview Modal */}
      <Modal
        visible={!!previewImage}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalCloseArea} onPress={() => setPreviewImage(null)} />
          <View style={styles.previewContainer}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>Bukti Transaksi</Text>
              <TouchableOpacity style={styles.closeModalBtn} onPress={() => setPreviewImage(null)}>
                <X size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <Image source={{ uri: previewImage || '' }} style={styles.previewFull} resizeMode="contain" />
            
            <View style={styles.previewActions}>
              <TouchableOpacity style={styles.actionBtn}>
                <Download size={20} color={AppColors.accent.emerald} />
                <Text style={styles.actionBtnText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => showAlert('Info', 'Fitur share akan segera hadir!', 'info')}>
                <ExternalLink size={20} color={AppColors.accent.blue} />
                <Text style={styles.actionBtnText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#060e20',
  },
  header: {
    paddingHorizontal: AppSpacing.base,
    paddingBottom: AppSpacing.lg,
    backgroundColor: '#060e20',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 24,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  vaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  vaultText: {
    color: AppColors.accent.emerald,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statChip: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statCount: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  filterScroll: {
    gap: 10,
    paddingBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  filterChipActive: {
    backgroundColor: AppColors.accent.emerald,
    borderColor: AppColors.accent.emerald,
  },
  filterText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  filterTextActive: {
    color: '#002919',
  },
  scroll: {
    padding: AppSpacing.base,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    width: (width - AppSpacing.base * 2 - 12) / 2,
    padding: 0,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  imageContainer: {
    aspectRatio: 1,
    width: '100%',
    backgroundColor: '#0f172a',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  noImageText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  categoryBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewHint: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    padding: 16,
  },
  expensePrice: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 2,
  },
  expenseDesc: {
    color: '#94a3b8',
    fontSize: 11,
    marginBottom: 10,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expenseDate: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  centerContent: {
    flex: 1,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    height: 400,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.02)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseArea: {
    ...StyleSheet.absoluteFillObject,
  },
  previewContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#1e293b',
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  previewTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  closeModalBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewFull: {
    width: '100%',
    height: 350,
    backgroundColor: '#0f172a',
  },
  previewActions: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  }
});

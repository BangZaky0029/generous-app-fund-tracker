import React, { useState, useMemo } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, 
  TextInput, Image, Alert, Modal, StyleSheet, 
  Dimensions, ActivityIndicator 
} from 'react-native';
import { 
  Search, Receipt, Calendar, Tag, 
  Trash2, Maximize2, X, Filter,
  ChevronDown, AlertCircle, Trash
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFundTrackerContext } from '@/context/FundTrackerContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { AppColors, AppFonts, AppRadius, AppSpacing, AppShadows, CATEGORIES } from '@/constants/theme';
import { deleteExpense } from '@/services/expenseService';

const { width } = Dimensions.get('window');

export default function ManajemenBukti() {
  const { recentExpenses, isLoading, refetch } = useFundTrackerContext();

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
                         expense.amount.toString().includes(searchQuery);
      const matchCategory = selectedCategory ? expense.category === selectedCategory : true;
      return matchQuery && matchCategory;
    });
  }, [recentExpenses, searchQuery, selectedCategory]);

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Hapus Bukti',
      'Apakah Anda yakin ingin menghapus data pengeluaran dan bukti transaksi ini? Tindakan ini tidak dapat dibatalkan.',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Hapus', 
          style: 'destructive', 
          onPress: async () => {
            setIsDeleting(id);
            try {
              await deleteExpense(id);
              await refetch();
              Alert.alert('Sukses', 'Data berhasil dihapus');
            } catch (err) {
              Alert.alert('Error', 'Gagal menghapus data');
            } finally {
              setIsDeleting(null);
            }
          } 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerHeader}>
          <Text style={styles.headerTitle}>Ethereal Vault</Text>
          <Text style={styles.headerSubtitle}>Manajemen Bukti Digital</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={18} color={AppColors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari transaksi atau nominal..."
            placeholderTextColor={AppColors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color={AppColors.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filter */}
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
                      <Receipt size={32} color={AppColors.glass.borderStrong} />
                      <Text style={styles.noImageText}>Tanpa Bukti</Text>
                    </View>
                  )}
                  
                  {/* Overlay Tools */}
                  <View style={styles.cardHeader}>
                     <View style={[styles.categoryBadge, { backgroundColor: CATEGORIES.find(c => c.name === expense.category)?.color + '20' }]}>
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
                           <Trash2 size={14} color={AppColors.accent.red} />
                        )}
                     </TouchableOpacity>
                  </View>

                  {expense.receipt_url && (
                    <View style={styles.previewHint}>
                       <Maximize2 size={12} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>

                {/* Content Section */}
                <View style={styles.cardBody}>
                   <Text style={styles.expensePrice}>{formatRp(expense.amount)}</Text>
                   <Text style={styles.expenseDesc} numberOfLines={2}>{expense.description || 'Tanpa keterangan'}</Text>
                   
                   <View style={styles.cardFooter}>
                      <Calendar size={10} color={AppColors.text.tertiary} />
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
             <AlertCircle size={48} color={AppColors.glass.borderStrong} />
             <Text style={styles.emptyTitle}>Data tidak ditemukan</Text>
             <Text style={styles.emptyText}>Coba gunakan kata kunci pencarian lain atau pilih kategori berbeda.</Text>
          </View>
        )}
        
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Image Preview Modal */}
      <Modal
        visible={!!previewImage}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setPreviewImage(null)}
        >
          <View style={styles.previewContainer}>
            <Image source={{ uri: previewImage || '' }} style={styles.previewFull} resizeMode="contain" />
            
            <TouchableOpacity style={styles.closePreview} onPress={() => setPreviewImage(null)}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.previewFooter}>
               <Text style={styles.previewInfo}>Bukti Transaksi Digital</Text>
               <TouchableOpacity style={styles.downloadBtn}>
                  <Text style={styles.downloadText}>Simpan ke Galeri</Text>
               </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AppColors.bg.primary,
  },
  header: {
    paddingHorizontal: AppSpacing.base,
    paddingBottom: AppSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.glass.border,
    backgroundColor: 'rgba(6, 14, 32, 0.8)',
  },
  headerHeader: {
    paddingVertical: AppSpacing.md,
  },
  headerTitle: {
    color: AppColors.text.primary,
    fontSize: 24,
    fontWeight: AppFonts.weights.bold,
  },
  headerSubtitle: {
    color: AppColors.accent.emerald,
    fontSize: 12,
    fontWeight: AppFonts.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.bg.secondary,
    borderRadius: AppRadius.md,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: AppColors.glass.border,
    marginBottom: AppSpacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: AppColors.text.primary,
    fontSize: 14,
    fontFamily: 'Inter',
  },
  filterScroll: {
    paddingBottom: 4,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: AppRadius.full,
    borderWidth: 1,
    borderColor: AppColors.glass.border,
    backgroundColor: AppColors.glass.bg,
  },
  filterChipActive: {
    backgroundColor: AppColors.accent.emerald,
    borderColor: AppColors.accent.emerald,
  },
  filterText: {
    color: AppColors.text.secondary,
    fontSize: 12,
    fontWeight: AppFonts.weights.medium,
  },
  filterTextActive: {
    color: '#002919',
    fontWeight: AppFonts.weights.bold,
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
    overflow: 'hidden',
  },
  imageContainer: {
    aspectRatio: 1,
    width: '100%',
    backgroundColor: AppColors.bg.secondary,
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
    gap: 8,
  },
  noImageText: {
    color: AppColors.text.tertiary,
    fontSize: 10,
    fontWeight: AppFonts.weights.medium,
  },
  cardHeader: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  categoryBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    ...AppShadows.sm,
  },
  previewHint: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    padding: 12,
  },
  expensePrice: {
    color: AppColors.accent.emerald,
    fontSize: 16,
    fontWeight: AppFonts.weights.bold,
    marginBottom: 2,
  },
  expenseDesc: {
    color: AppColors.text.primary,
    fontSize: 11,
    lineHeight: 14,
    marginBottom: 8,
    minHeight: 28,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    opacity: 0.6,
  },
  expenseDate: {
    color: AppColors.text.tertiary,
    fontSize: 9,
    fontWeight: AppFonts.weights.medium,
  },
  centerContent: {
    flex: 1,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    height: 400,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    color: AppColors.text.primary,
    fontSize: 18,
    fontWeight: AppFonts.weights.bold,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: AppColors.text.tertiary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    padding: 20,
  },
  previewFull: {
    width: '100%',
    height: '70%',
    borderRadius: AppRadius.lg,
  },
  closePreview: {
    position: 'absolute',
    top: 60,
    right: 30,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewFooter: {
    position: 'absolute',
    bottom: 50,
    left: 40,
    right: 40,
    alignItems: 'center',
  },
  previewInfo: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 20,
    opacity: 0.7,
  },
  downloadBtn: {
    backgroundColor: AppColors.accent.emerald,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: AppRadius.full,
  },
  downloadText: {
    color: '#002919',
    fontWeight: '700',
    fontSize: 14,
  }
});

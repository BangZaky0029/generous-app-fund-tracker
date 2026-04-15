import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState, useMemo } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, 
  TextInput, Image, Modal, StyleSheet, 
  Dimensions, ActivityIndicator 
} from 'react-native';
import { 
  Search, Receipt, Calendar, 
  Trash2, Maximize2, X, Filter,
  AlertCircle, Download, ExternalLink, Sparkles, ArrowLeft,
  LayoutGrid, List as ListIcon
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFundTrackerContext } from '@/context/FundTrackerContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { AppColors, AppFonts, AppRadius, AppSpacing, CATEGORIES } from '@/constants/theme';
import { deleteExpense } from '@/services/expenseService';
import { deleteDonation } from '@/services/donationService';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function ManajemenBukti() {
  const { recentExpenses, recentDonations, isLoading, refetch, showAlert } = useFundTrackerContext();
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'pending'>('all');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('list');

  // Auto Refresh saat masuk ke layar ini
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState<string | null>(null);

  const formatRp = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Simplified Unified List Logic
  const unifiedItems = useMemo(() => {
    const expenses = recentExpenses.map(e => ({ ...e, type: 'expense' as const }));
    const donations = recentDonations.map(d => ({ 
      ...d, 
      type: 'income' as const, 
      category: 'Donasi',
      receipt_url: d.payment_proof_url // Normalize field name for unified UI
    }));
    
    let combined = [...expenses, ...donations];
    
    // Global filter by Type
    if (filterType === 'income') combined = combined.filter(i => i.type === 'income' && i.status === 'confirmed');
    if (filterType === 'expense') combined = combined.filter(i => i.type === 'expense');
    if (filterType === 'pending') combined = combined.filter(i => i.type === 'income' && i.status === 'pending');

    // Search and Category Filter
    return combined.filter(item => {
      const title = item.type === 'income' ? (item as any).donator_name : (item as any).description;
      const campaignTitle = item.campaigns?.title || 'Umum';
      const matchQuery = title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.amount.toString().includes(searchQuery) ||
                         item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaignTitle.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchCategory = selectedCategory ? item.category === selectedCategory : true;
      return matchQuery && matchCategory;
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [recentExpenses, recentDonations, searchQuery, selectedCategory, filterType]);

  const handleDelete = async (id: string, type: 'income' | 'expense') => {
    const title = type === 'income' ? 'Donasi' : 'Pengeluaran';
    showAlert(
      `Hapus ${title} Permanen`,
      `Apakah Anda yakin ingin menghapus data ini? Tindakan ini akan menghapus aset bukti dari server ledger.`,
      'warning',
      async () => {
        setIsDeleting(id);
        try {
          if (type === 'income') {
            await deleteDonation(id);
          } else {
            await deleteExpense(id);
          }
          await refetch();
          showAlert('Sukses', 'Data berhasil dihapus dari cloud.', 'success');
        } catch (err) {
          showAlert('Error', 'Gagal menghapus data. Periksa koneksi agent.', 'error');
        } finally {
          setIsDeleting(null);
        }
      }
    );
  };

  const handleConfirm = async (id: string, status: 'confirmed' | 'rejected') => {
    const title = status === 'confirmed' ? 'Konfirmasi' : 'Tolak';
    showAlert(
      `${title} Donasi`,
      `Apakah Anda yakin ingin ${title.toLowerCase()} donasi ini?`,
      'info',
      async () => {
        setIsConfirming(id);
        try {
          const { confirmDonation } = await import('@/services/donationService');
          await confirmDonation(id, status);
          await refetch();
          showAlert('Berhasil', `Donasi berhasil ${status === 'confirmed' ? 'dikonfirmasi' : 'ditolak'}.`, 'success');
        } catch (err) {
          showAlert('Gagal', 'Terjadi kesalahan saat memproses donasi.', 'error');
        } finally {
          setIsConfirming(null);
        }
      }
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleRow}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={20} color="#fff" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Asset Gallery</Text>
              <View style={styles.vaultBadge}>
                <Sparkles size={10} color={AppColors.accent.emerald} />
                <Text style={styles.vaultText}>Cloud Vault Verified</Text>
              </View>
            </View>
          </View>

        <View style={styles.headerActions}>
          <View style={styles.statChip}>
            <Text style={styles.statCount}>{unifiedItems.length}</Text>
            <Text style={styles.statLabel}>
              {filterType === 'all' ? 'Total Aset' : filterType === 'income' ? 'Donasi' : filterType === 'expense' ? 'Pengeluaran' : 'Menunggu'}
            </Text>
          </View>
        </View>
      </View>

      {/* Unified Tab Filter */}
      <View style={styles.tabScrollWrapp}>
         <TouchableOpacity 
           onPress={() => setFilterType('all')}
           style={[styles.tabItem, filterType === 'all' && styles.tabItemActive]}
         >
            <Text style={[styles.tabText, filterType === 'all' && styles.tabTextActive]}>Semua</Text>
         </TouchableOpacity>
         <TouchableOpacity 
           onPress={() => setFilterType('pending')}
           style={[styles.tabItem, filterType === 'pending' && styles.tabItemActive]}
         >
            <Text style={[styles.tabText, filterType === 'pending' && styles.tabTextActive]}>Menunggu</Text>
         </TouchableOpacity>
         <TouchableOpacity 
           onPress={() => setFilterType('income')}
           style={[styles.tabItem, filterType === 'income' && styles.tabItemActive]}
         >
            <Text style={[styles.tabText, filterType === 'income' && styles.tabTextActive]}>Donasi</Text>
         </TouchableOpacity>
         <TouchableOpacity 
           onPress={() => setFilterType('expense')}
           style={[styles.tabItem, filterType === 'expense' && styles.tabItemActive]}
         >
            <Text style={[styles.tabText, filterType === 'expense' && styles.tabTextActive]}>Keluar</Text>
         </TouchableOpacity>
      </View>

        {/* Floating Search Bar */}
        {/* Floating Search Bar & Toggle */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Search size={18} color="#64748b" />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari transaksi..."
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

          <View style={styles.layoutToggle}>
            <TouchableOpacity 
              onPress={() => setLayoutMode('grid')}
              style={[styles.toggleBtn, layoutMode === 'grid' && styles.toggleBtnActive]}
            >
              <LayoutGrid size={16} color={layoutMode === 'grid' ? '#060e20' : '#64748b'} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setLayoutMode('list')}
              style={[styles.toggleBtn, layoutMode === 'list' && styles.toggleBtnActive]}
            >
              <ListIcon size={16} color={layoutMode === 'list' ? '#060e20' : '#64748b'} />
            </TouchableOpacity>
          </View>
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
        {isLoading && unifiedItems.length === 0 ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={AppColors.accent.emerald} />
            <Text style={styles.loadingText}>Menghubungkan ke Storage...</Text>
          </View>
        ) : unifiedItems.length > 0 ? (
          <View style={layoutMode === 'grid' ? styles.grid : styles.listList}>
            {unifiedItems.map((item) => {
              const isIncome = item.type === 'income';
              const title = isIncome ? (item as any).donator_name : (item as any).description;
              const accentColor = isIncome ? AppColors.accent.emerald : (CATEGORIES.find(c => c.name === item.category)?.color || '#fff');
              
              if (layoutMode === 'list') {
                return (
                  <GlassCard 
                    key={item.id} 
                    style={[
                      styles.cardList, 
                      isIncome && styles.incomeCard,
                      isIncome && item.status === 'pending' && styles.pendingCardHighlight
                    ]}
                  >
                    <TouchableOpacity 
                      style={styles.imageContainerList} 
                      onPress={() => item.receipt_url && setPreviewImage(item.receipt_url)}
                    >
                      {item.receipt_url ? (
                        <Image source={{ uri: item.receipt_url }} style={styles.imageList} />
                      ) : (
                        <View style={styles.noImageList}>
                          <Receipt size={20} color="rgba(255,255,255,0.05)" />
                        </View>
                      )}
                    </TouchableOpacity>

                    <View style={styles.cardBodyList}>
                      <View style={styles.rowBetween}>
                        <View style={[styles.categoryBadge, { backgroundColor: `${accentColor}20`, borderColor: `${accentColor}40` }]}>
                          <Text style={[styles.categoryBadgeText, { color: accentColor }]}>
                            {isIncome ? (item.status === 'pending' ? 'MENUNGGU' : 'MASUK') : item.category}
                          </Text>
                        </View>
                        <Text style={[styles.expensePriceList, isIncome && { color: AppColors.accent.emerald }]}>
                          {isIncome ? '+' : '-'}{formatRp(item.amount)}
                        </Text>
                      </View>
                      
                      <Text style={styles.expenseDescList} numberOfLines={1}>{title || 'Tanpa keterangan'}</Text>
                      <Text style={styles.campaignSubtitleList} numberOfLines={1}>{item.campaigns?.title || 'Umum / Pusat'}</Text>
                      
                      <View style={styles.cardFooterList}>
                         <View style={styles.footerInfo}>
                            <Calendar size={10} color="#64748b" />
                            <Text style={styles.expenseDate}>
                              {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </Text>
                         </View>
                         
                         {isIncome && item.status === 'pending' ? (
                           <View style={styles.actionRowSmall}>
                              <TouchableOpacity onPress={() => handleConfirm(item.id, 'confirmed')} style={styles.confirmBtnSmall}>
                                 <Sparkles size={12} color="#002919" />
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => handleConfirm(item.id, 'rejected')} style={styles.rejectBtnSmall}>
                                 <X size={12} color="#fff" />
                              </TouchableOpacity>
                           </View>
                         ) : (
                           <TouchableOpacity 
                              style={styles.deleteBtnSmall}
                              onPress={() => handleDelete(item.id, item.type)}
                              disabled={isDeleting === item.id}
                           >
                              {isDeleting === item.id ? (
                                 <ActivityIndicator size="small" color={AppColors.accent.red} />
                              ) : (
                                 <Trash2 size={12} color="#94a3b8" />
                              )}
                           </TouchableOpacity>
                         )}
                      </View>
                    </View>
                  </GlassCard>
                );
              }

              return (
                <GlassCard 
                  key={item.id} 
                  style={[
                    styles.card, 
                    isIncome && styles.incomeCard,
                    isIncome && item.status === 'pending' && styles.pendingCardHighlight
                  ]}
                >
                  {/* Image Section */}
                  <TouchableOpacity 
                    style={styles.imageContainer} 
                    activeOpacity={0.9}
                    onPress={() => item.receipt_url && setPreviewImage(item.receipt_url)}
                  >
                    {item.receipt_url ? (
                      <Image source={{ uri: item.receipt_url }} style={styles.image} />
                    ) : (
                      <View style={styles.noImage}>
                        <Receipt size={32} color="rgba(255,255,255,0.05)" />
                        <Text style={styles.noImageText}>Tanpa Bukti</Text>
                      </View>
                    )}
                    
                    {/* Overlay Tools */}
                    <LinearGradient
                      colors={['rgba(0,0,0,0.6)', 'transparent']}
                      style={StyleSheet.absoluteFill}
                    >
                      <View style={styles.cardHeader}>
                          <View style={[styles.categoryBadge, { backgroundColor: `${accentColor}30`, borderColor: `${accentColor}50` }]}>
                             <Text style={[styles.categoryBadgeText, { color: accentColor }]}>
                               {isIncome ? (item.status === 'pending' ? 'MENUNGGU' : 'MASUK') : item.category}
                             </Text>
                          </View>
                          
                          <View style={styles.actionRowSmall}>
                             {isIncome && item.status === 'pending' ? (
                               <>
                                 <TouchableOpacity onPress={() => handleConfirm(item.id, 'confirmed')} style={styles.confirmBtnSmall}>
                                    <Sparkles size={12} color="#002919" />
                                 </TouchableOpacity>
                                 <TouchableOpacity onPress={() => handleConfirm(item.id, 'rejected')} style={styles.rejectBtnSmall}>
                                    <X size={12} color="#fff" />
                                 </TouchableOpacity>
                               </>
                             ) : (
                               <TouchableOpacity 
                                  style={[styles.deleteBtn, isIncome && { backgroundColor: 'rgba(239, 68, 68, 0.4)' }]}
                                  onPress={() => handleDelete(item.id, item.type)}
                                  disabled={isDeleting === item.id}
                               >
                                  {isDeleting === item.id ? (
                                     <ActivityIndicator size="small" color={AppColors.accent.red} />
                                  ) : (
                                     <Trash2 size={12} color="#fff" />
                                  )}
                               </TouchableOpacity>
                             )}
                          </View>
                      </View>
                    </LinearGradient>
  
                    {item.receipt_url && (
                      <View style={styles.previewHint}>
                         <Maximize2 size={10} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
  
                  {/* Content Section */}
                  <View style={styles.cardBody}>
                     <Text style={[styles.expensePrice, isIncome && { color: AppColors.accent.emerald }]}>
                       {isIncome ? '+' : '-'}{formatRp(item.amount)}
                     </Text>
                     <Text style={styles.expenseDesc} numberOfLines={1}>{title || 'Tanpa keterangan'}</Text>
                     <Text style={styles.campaignSubtitle} numberOfLines={1}>{item.campaigns?.title || 'Umum / Pusat'}</Text>
                     
                     <View style={styles.cardFooter}>
                        <Calendar size={10} color="#64748b" />
                        <Text style={styles.expenseDate}>
                          {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </Text>
                     </View>
                  </View>
                </GlassCard>
              );
            })}
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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
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
  tabScrollWrapp: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabItemActive: {
    backgroundColor: 'rgba(105, 246, 184, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(105, 246, 184, 0.2)',
  },
  tabText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
  },
  tabTextActive: {
    color: AppColors.accent.emerald,
  },
  incomeCard: {
     borderColor: 'rgba(105, 246, 184, 0.1)',
  },
  pendingCardHighlight: {
    borderColor: 'rgba(250, 204, 21, 0.4)',
    shadowColor: '#facc15',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  layoutToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 4,
    height: 52,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  toggleBtn: {
    width: 36,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: '#69f6b8',
  },
  listList: {
    gap: 12,
  },
  cardList: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  imageContainerList: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#0f172a',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageList: {
    width: '100%',
    height: '100%',
  },
  noImageList: {
    opacity: 0.5,
  },
  cardBodyList: {
    flex: 1,
    justifyContent: 'space-between',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expensePriceList: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
  expenseDescList: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  campaignSubtitleList: {
    color: AppColors.accent.emerald,
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  cardFooterList: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionRowSmall: {
    flexDirection: 'row',
    gap: 8,
  },
  confirmBtnSmall: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: AppColors.accent.emerald,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtnSmall: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: AppColors.accent.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnSmall: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 4,
    fontWeight: '500',
  },
  campaignSubtitle: {
    color: AppColors.accent.emerald,
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 10,
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

/**
 * 🧠 useFundTracker — AGENTIC CORE HOOK
 *
 * Ini adalah "otak" dari aplikasi. Hook ini:
 * 1. Subscribe ke tabel 'expenses' + 'donations' secara REALTIME via Supabase Channel
 * 2. OTOMATIS recalculate persentase saat ada perubahan data (INSERT/UPDATE/DELETE)
 * 3. Expose state yang sudah dikalkulasi ke seluruh aplikasi via Context
 *
 * Agentic Behavior:
 *   - Tanpa user refresh → data selalu up-to-date
 *   - Agent trigger: supabase.channel().on('postgres_changes', ...).subscribe()
 *   - Auto-compute: (totalKategori / totalDonasi) × 100%
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { AppRealtime } from '@/lib/supabaseConfig';
import { fetchTotalDonations, fetchRecentDonations, fetchDonationTotalsGroupByCampaign } from '@/services/donationService';
import { fetchExpensesByCategory, fetchRecentExpenses } from '@/services/expenseService';
import { fetchActiveCampaigns } from '@/services/campaignService'; // New
import { CATEGORIES } from '@/constants/theme';
import type { FundTrackerState, CategorySummary, ExpenseCategory, Campaign } from '@/constants/types';

const INITIAL_STATE: FundTrackerState = {
  totalDonations: 0,
  totalExpenses: 0,
  remainingFunds: 0,
  usagePercentage: 0,
  categories: [],
  recentExpenses: [],
  recentDonations: [],
  activeCampaigns: [],
  isLoading: true,
  error: null,
  lastUpdated: null,
};

export function useFundTracker(): FundTrackerState & { refetch: () => void } {
  const [state, setState] = useState<FundTrackerState>(INITIAL_STATE);
  const channelRef = useRef<ReturnType<typeof AppRealtime.channel> | null>(null);

  // ========== AGENTIC CALCULATION ENGINE ==========
  const calculateFundState = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Fetch semua data secara paralel (efisien)
      const [
        totalDonations, 
        expensesByCategory, 
        recentExpenses, 
        recentDonations,
        activeCampaigns,
        totalsConfirmed,
        totalsPending
      ] = await Promise.all([
          fetchTotalDonations(),
          fetchExpensesByCategory(),
          fetchRecentExpenses(20),
          fetchRecentDonations(20),
          fetchActiveCampaigns(),
          fetchDonationTotalsGroupByCampaign('confirmed'),
          fetchDonationTotalsGroupByCampaign('pending'),
        ]);

      // Augment campaigns with dynamic totals
      const augmentedCampaigns = activeCampaigns.map(camp => ({
        ...camp,
        current_amount: totalsConfirmed[camp.id] ?? 0,
        pending_amount: totalsPending[camp.id] ?? 0, // Custom field for UI
      }));

      // Hitung total expenses
      const totalExpenses = Object.values(expensesByCategory).reduce(
        (sum, val) => sum + val,
        0
      );

      // Kalkulasi persentase per kategori
      const categories: CategorySummary[] = CATEGORIES.map((cat) => {
        const catTotal = expensesByCategory[cat.name as ExpenseCategory] ?? 0;
        const percentage =
          totalDonations > 0
            ? Math.min(Math.round((catTotal / totalDonations) * 100 * 10) / 10, 100)
            : 0;

        return {
          name: cat.name,
          total: catTotal,
          percentage,
          color: cat.color,
          dimColor: cat.dimColor,
          icon: cat.icon,
        };
      });

      const remainingFunds = Math.max(totalDonations - totalExpenses, 0);
      const usagePercentage =
        totalDonations > 0
          ? Math.min(Math.round((totalExpenses / totalDonations) * 100 * 10) / 10, 100)
          : 0;

      setState({
        totalDonations,
        totalExpenses,
        remainingFunds,
        usagePercentage,
        categories,
        recentExpenses,
        recentDonations,
        activeCampaigns: augmentedCampaigns as any,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal memuat data';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      console.error('[useFundTracker] Calculation error:', err);
    }
  }, []);

  // ========== REALTIME SUBSCRIPTION (AGENTIC TRIGGER) ==========
  useEffect(() => {
    // Initial load
    calculateFundState();

    // Buat channel untuk subscribe ke perubahan realtime
    const channel = AppRealtime.channel('fund-tracker-realtime', {
      config: {
        broadcast: { self: true },
      },
    });

    // Subscribe ke semua tabel relevan
    const tables = ['expenses', 'donations', 'campaigns', 'campaign_updates'];
    
    tables.forEach(table => {
      channel.on(
        'postgres_changes' as any,
        {
          event: '*',        // INSERT, UPDATE, DELETE
          schema: 'public',
          table: table,
        },
        (payload: any) => {
          console.log(`[Agent] ${table} changed:`, payload.eventType, '→ Recalculating...');
          calculateFundState(); // Auto recalculate for any change
        }
      );
    });

    // Subscribe dan simpan channel reference
    channel.subscribe((status) => {
      console.log('[Agent] Realtime status:', status);
    });

    channelRef.current = channel;

    // Cleanup: unsubscribe saat komponen unmount
    return () => {
      if (channelRef.current) {
        AppRealtime.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [calculateFundState]);

  return {
    ...state,
    refetch: calculateFundState,
  };
}

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
import { fetchTotalDonations, fetchRecentDonations, fetchDonationTotalsGroupByCampaign, fetchCampaignStats } from '@/services/donationService';
import { fetchExpensesByCategory, fetchRecentExpenses, fetchExpenseTotalsGroupByCampaign } from '@/services/expenseService';
import { fetchActiveCampaigns } from '@/services/campaignService'; // New
import { CATEGORIES } from '@/constants/theme';
import type { FundTrackerState, CategorySummary, ExpenseCategory, Campaign } from '@/constants/types';

const INITIAL_STATE: FundTrackerState = {
  totalDonations: 0,
  totalDonationsPending: 0,
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
  const calculateFundState = useCallback(async (isInitial = false) => {
    try {
      // Hanya set loading jika ini initial load, 
      // untuk data updates kita biarkan background update agar UI tidak flickering
      if (isInitial) {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
      }

      // Fetch semua data secara paralel (efisien)
      const [
        totalDonations, 
        totalDonationsPending,
        expensesByCategory, 
        recentExpenses, 
        recentDonations,
        activeCampaigns,
        totalsConfirmed,
        totalsPending,
        totalsExpense,
        campaignStats
      ] = await Promise.all([
          fetchTotalDonations(undefined, 'confirmed').catch(() => 0),
          fetchTotalDonations(undefined, 'pending').catch(() => 0),
          fetchExpensesByCategory().catch(() => ({})),
          fetchRecentExpenses(20).catch(() => []),
          fetchRecentDonations(20).catch(() => []),
          fetchActiveCampaigns().catch(() => []),
          fetchDonationTotalsGroupByCampaign('confirmed').catch(() => ({})),
          fetchDonationTotalsGroupByCampaign('pending').catch(() => ({})),
          fetchExpenseTotalsGroupByCampaign().catch(() => ({})),
          fetchCampaignStats().catch(() => ({})),
        ]);

      // Augment campaigns with dynamic totals (Safe Mapping)
      const augmentedCampaigns = activeCampaigns.map(camp => {
        const campId = String(camp.id).trim();
        const confAmount = (totalsConfirmed as Record<string, number>)[campId] || 0;
        const pendAmount = (totalsPending as Record<string, number>)[campId] || 0;
        const expAmount = (totalsExpense as Record<string, number>)[campId] || 0;
        const stats = (campaignStats as Record<string, any>)[campId] || { total_donors: 0, top_donator_name: '-', top_donator_amount: 0 };
        
        return {
          ...camp,
          current_amount: confAmount > 0 ? confAmount : (camp.current_amount || 0),
          pending_amount: pendAmount, 
          expense_amount: expAmount,
          total_donors: stats.total_donors,
          top_donator_name: stats.top_donator_name,
          top_donator_amount: stats.top_donator_amount,
        };
      });

      // Hitung total expenses
      const totalExpenses = Object.values(expensesByCategory).reduce(
        (sum, val) => (typeof val === 'number' ? sum + val : sum),
        0
      );

      // Kalkulasi persentase per kategori
      const categories: CategorySummary[] = CATEGORIES.map((cat) => {
        const catTotal = (expensesByCategory as any)[cat.name] ?? 0;
        const percentage =
          totalDonations > 0
            ? Math.min(Math.round((catTotal / totalDonations) * 100 * 10) / 10, 100)
            : 0;

        return {
          name: cat.name as ExpenseCategory,
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
        totalDonationsPending,
        totalExpenses,
        remainingFunds,
        usagePercentage,
        categories,
        recentExpenses,
        recentDonations,
        activeCampaigns: augmentedCampaigns,
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

  // Debouce Ref
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedCalculate = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      calculateFundState(false);
    }, 1000); // Debounce 1 detik untuk menghindari spam fetch saat batch update
  }, [calculateFundState]);

  // ========== REALTIME SUBSCRIPTION (AGENTIC TRIGGER) ==========
  useEffect(() => {
    // Initial load
    calculateFundState(true);

    // Buat channel untuk subscribe ke perubahan realtime
    const channelId = `fund-tracker-realtime-${Date.now()}`;
    const channel = AppRealtime.channel(channelId, {
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
          console.log(`[Agent] ${table} changed:`, payload.eventType, '→ Queueing Recalculate...');
          debouncedCalculate(); // Gunakan debounced version
        }
      );
    });

    // Subscribe dan simpan channel reference
    channel.subscribe((status) => {
      console.log('[Agent] Realtime status:', status);
    });

    channelRef.current = channel;

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (channelRef.current) {
        AppRealtime.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [calculateFundState, debouncedCalculate]);

  return {
    ...state,
    refetch: calculateFundState,
  };
}

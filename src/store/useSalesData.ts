import { create } from "zustand";

interface SalesDataState {
  salesData: unknown[];
  setSalesData: (data: unknown[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useSalesData = create<SalesDataState>((set) => ({
  salesData: [],
  setSalesData: (data) => set({ salesData: data }),
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));

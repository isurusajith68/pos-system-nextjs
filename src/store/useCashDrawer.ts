import { create } from "zustand";
interface CashDrawerState {
  isDayStarted: boolean;
  isDrawerOpen: boolean;
  isDayEnded: boolean;
  startingCash: string;
  declaredCash: string;
  expectedCash: number;
  variance: number;
  setIsDayStarted: (isDayStarted: boolean) => void;
  setIsDrawerOpen: (isDrawerOpen: boolean) => void;
  setIsDayEnded: (isDayEnded: boolean) => void;
  setStartingCash: (startingCash: string) => void;
  setDeclaredCash: (declaredCash: string) => void;
  setVariance: (variance: number) => void;
  setExpectedCash: (expectedCash: number) => void;
}

export const useCashDrawer = create<CashDrawerState>((set) => ({
  isDayStarted: false,
  isDrawerOpen: false,
  isDayEnded: false,
  startingCash: "",
  declaredCash: "",
  expectedCash: 0,
  variance: 0,
  setIsDayStarted: (isDayStarted) => set({ isDayStarted }),
  setIsDrawerOpen: (isDrawerOpen) => set({ isDrawerOpen }),
  setIsDayEnded: (isDayEnded) => set({ isDayEnded }),
  setStartingCash: (startingCash) => set({ startingCash }),
  setDeclaredCash: (declaredCash) => set({ declaredCash }),
  setExpectedCash: (expectedCash) => set({ expectedCash }),
  setVariance: (variance) => set({ variance }),
}));

import { create } from "zustand";
// totalRevenue 4780 totalBills 2 totalUsers 1 totalProducts 9 totalCategories 5

interface StatsState {
  totalRevenue: number;
  totalBills: number;
  totalUsers: number;
  totalProducts: number;
  totalCategories: number;
  totalSales: number;
  totalExpenses: number;
  totalProfit: number;
  setTotalRevenue: (totalRevenue: number) => void;
  setTotalBills: (totalBills: number) => void;
  setTotalUsers: (totalUsers: number) => void;
  setTotalProducts: (totalProducts: number) => void;
  setTotalCategories: (totalCategories: number) => void;
  setTotalSales: (totalSales: number) => void;
  setTotalExpenses: (totalExpenses: number) => void;
  setTotalProfit: (totalProfit: number) => void;
}

export const useStats = create<StatsState>((set) => ({
  totalRevenue: 0,
  totalBills: 0,
  totalUsers: 0,
  totalProducts: 0,
  totalCategories: 0,
  totalSales: 0,
  totalExpenses: 0,
  totalProfit: 0,
  setTotalRevenue: (totalRevenue) => set({ totalRevenue }),
  setTotalBills: (totalBills) => set({ totalBills }),
  setTotalUsers: (totalUsers) => set({ totalUsers }),
  setTotalProducts: (totalProducts) => set({ totalProducts }),
  setTotalCategories: (totalCategories) => set({ totalCategories }),
  setTotalSales: (totalSales) => set({ totalSales }),
  setTotalExpenses: (totalExpenses) => set({ totalExpenses }),
  setTotalProfit: (totalProfit) => set({ totalProfit }),
}));

import { getBills, getBillStats, getDailySales } from "../services/bill";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface Bill {
  refunded: boolean;
  cart: {
      id: any; _id: string; name: string; quantity: number; price: number 
}[];
  id: string;
  billNumber: string;
  date: string;
  time: string;
  cashier: string;
  total: number;
  subTotal: number;
  cash: number;
  change: number;
  discount: number;
  discountAmount: number;
  createdAt: string;
  refundedAt: string;
}

interface BillStore {
  billHistory: Bill[];
  setBillHistory: (bills: Bill[]) => void;
  fetchBills: () => Promise<void>;
  fetchDailyBills: () => Promise<void>;
}

export const useBillStore = create<BillStore>()(
  devtools((set) => ({
    billHistory: [],
    setBillHistory: (bills) => set({ billHistory: bills }),
    fetchBills: async () => {
      try {
        const result = await getBills();
        if (result.success) {
          set({ billHistory: result.bills });
        } else {
          console.error("Failed to fetch bills:", result.error);
        }
      } catch (error) {
        console.error("Error fetching bills:", error);
      }
    },
    fetchDailyBills: async () => {
      try {
        const result = await getDailySales();
        if (result.success) {
          set({ billHistory: result.bills });
        } else {
          console.error("Failed to fetch daily bills:", result.error);
        }
      } catch (error) {
        console.error("Error fetching daily bills:", error);
      }
    },
  }))
);

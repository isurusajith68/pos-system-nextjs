import { getBills, getBillStats } from "@/services/bill";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface Bill {
  cart: { _id: string; name: string; quantity: number; price: number }[];
  id: string;
  billNumber: string;
  date: string;
  time: string;
  cashier: string;
  total: number;
  cash: number;
  change: number;
  discount: number;
}

interface BillStore {
  billHistory: Bill[];
  setBillHistory: (bills: Bill[]) => void;
  fetchBills: () => Promise<void>;
}

export const useBillStore = create<BillStore>()(
  devtools((set) => ({
    billHistory: [],
    setBillHistory: (bills) => set({ billHistory: bills }),
    fetchBills: async () => {
      try {
        const result = await getBills();
        console.log(result);
        if (result.success) {
          set({ billHistory: result.bills });
        } else {
          console.error("Failed to fetch bills:", result.error);
        }
      } catch (error) {
        console.error("Error fetching bills:", error);
      }
    },
  }))
);

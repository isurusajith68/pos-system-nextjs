import { getProductsSales } from "@/services/bill";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface ProductSales {
  _id: string;
  productId: string;
  price: string;
  productName: string;
  quantity: number;
  salesDate: string;
}

interface ProductsSalesStore {
  productsSales: ProductSales[];
  setProductsSales: (productsSales: ProductSales[]) => void;
  fetchProductsSales: () => Promise<void>;
}

export const useProductsSalesStore = create<ProductsSalesStore>()(
  devtools((set) => ({
    productsSales: [],
    setProductsSales: (productsSales) => set({ productsSales }),
    fetchProductsSales: async () => {
      try {
        const result = await getProductsSales();
        if (result.success) {
          set({ productsSales: result.productsSales });
        } else {
          console.error("Failed to fetch products sales:", result.error);
        }
      } catch (error) {
        console.error("Error fetching products sales:", error);
      }
    },
  }))
);


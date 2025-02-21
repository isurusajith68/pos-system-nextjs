import { create } from "zustand";

interface CategoryStore {
  categories: { _id: string; name: string; image?: string }[];
  setCategories: (
    categories: { _id: string; name: string; image?: string }[]
  ) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const useCategoryStore = create<CategoryStore>((set) => ({
  categories: [],
  setCategories: (categories) => set({ categories }),
  loading: false,
  setLoading: (loading) => set({ loading }),
  error: null,
  setError: (error) => set({ error }),
}));

interface ProductStore {
  products: {
    _id: string;
    name: string;
    itemCode: string;
    price: number;
    category: string;
    stock: number;
    image?: string;
  }[];
  loadingProducts: boolean;
  setProducts: (
    products: {
      _id: string;
      name: string;
      itemCode: string;
      price: number;
      category: string;
      stock: number;
      image?: string;
    }[]
  ) => void;
  setLoadingProducts: (loading: boolean) => void;
  productImage: string | null;
  setProductImage: (image: string | null) => void;
  editingProduct: {
    _id: string;
    name: string;
    itemCode: string;
    price: number;
    category: string;
    stock: number;
    image?: string;
  } | null;
  setEditingProduct: (
    product: {
      _id: string;
      name: string;
      itemCode: string;
      price: number;
      category: string;
      stock: number;
      image?: string;
    } | null
  ) => void;
}

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  loadingProducts: false,
  productImage: null,
  editingProduct: null,

  setProducts: (products) => set({ products }),
  setLoadingProducts: (loading) => set({ loadingProducts: loading }),
  setProductImage: (image) => set({ productImage: image }),
  setEditingProduct: (product) => set({ editingProduct: product }),
}));

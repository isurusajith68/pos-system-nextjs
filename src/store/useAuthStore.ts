import { create } from "zustand";

export type User = {
  email: string;
  role: "admin" | "manager" | "cashier" | "user";
  username: string;
  id: string;
  createdAt: string;
};

export type AuthStore = {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user: user }),
  logout: () => set({ user: null }),
}));

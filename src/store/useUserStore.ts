import { create } from "zustand";
import {
  getAllUsers,
  deleteUser,
  updateUser as updateUserProfile,
} from "@/services/auth";

export interface User {
  id: string;
  email: string;
  username: string;
  role: "admin" | "manager" | "cashier" | "user";
  created_at: string;
  updated_at: string;
}

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  updateUser: (userId: string, data: Partial<User>) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  loading: false,
  error: null,
  fetchUsers: async () => {
    try {
      set({ loading: true, error: null });
      const response = await getAllUsers();
      const users = response.users;
      set({ users, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateUser: async (userId: string, data: Partial<User>) => {
    try {
      set({ loading: true, error: null });
      await updateUserProfile(userId, data);
      const users = get().users.map((user) =>
        user.id === userId ? { ...user, ...data } : user
      );
      set({ users, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));

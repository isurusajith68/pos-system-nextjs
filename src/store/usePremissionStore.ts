import { create } from "zustand";

type Permissions = {
  [key: string]: {
    actions: { [key: string]: boolean };
  };
};

interface PermissionStore {
  permissions: Permissions;
  setPermissions: (permissions: Permissions) => void;
}

export const usePermissionStore = create<PermissionStore>((set) => ({
  permissions: {},
  setPermissions: (permissions) => set({ permissions }),
}));

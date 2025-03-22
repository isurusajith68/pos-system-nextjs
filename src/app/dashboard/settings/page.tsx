"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, LogOut, Mail, Lock, User, Settings2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings } from "@/components/Setting";
import { Profile } from "@/components/Profile";
import { UserList } from "@/components/UserList";
import { MdPermIdentity } from "react-icons/md";
import Permission from "@/components/Permission";
import PermissionGuard from "@/components/PermissionGuard/PermissionGuard";
import { usePermissionStore } from "@/store/usePremissionStore";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

const UserManagement = () => {
  const { user: currentUser } = useAuthStore();

  return (
    <div className=" mx-auto  sm:p-4 space-y-4 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
        <h1 className="text-xl font-bold">Settings</h1>
      </div>

      <Tabs
        defaultValue={currentUser.role === "cashier" ? "profile" : "users"}
        className="space-y-4"
      >
        <div className="overflow-x-auto -mx-2 px-2 max-w-[calc(100vw-1rem)]">
            <TabsList className="h-auto p-1 flex-nowrap min-w-max max-sm:flex ">
              <TabsTrigger
                value="users"
                className="flex items-center text-xs sm:text-sm py-2 px-2 sm:px-4"
              >
                <Users className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="whitespace-nowrap">Users</span>
              </TabsTrigger>
              <TabsTrigger
                value="permissions"
                className="flex items-center text-xs sm:text-sm py-2 px-3 sm:px-4"
              >
                <MdPermIdentity className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="whitespace-nowrap">Permissions</span>
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="flex items-center text-xs sm:text-sm py-2 px-3 sm:px-4"
              >
                <User className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="whitespace-nowrap">Profile</span>
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="flex items-center text-xs sm:text-sm py-2 px-3 sm:px-4"
              >
                <Settings2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="whitespace-nowrap">Settings</span>
              </TabsTrigger>
            </TabsList>
        </div>

        <div className="mt-4 sm:mt-6">
          <TabsContent value="users" className="m-0">
            <PermissionGuard
              module="settings"
              action="view_users_list"
              screen={true}
            >
              <div className="bg-card rounded-lg  sm:p-4">
                <UserList />
              </div>
            </PermissionGuard>
          </TabsContent>
          <TabsContent value="permissions" className="m-0">
            <PermissionGuard
              module="settings"
              action="manage_permissions"
              screen={true}
            >
              <div className="bg-card rounded-lg sm:p-4">
                <Permission />
              </div>
            </PermissionGuard>
          </TabsContent>
          <TabsContent value="profile" className="m-0">
            <PermissionGuard
              module="settings"
              action="update_profile_settings"
              screen={true}
            >
              <div className="bg-card rounded-lg sm:p-4">
                <Profile currentUser={currentUser} />
              </div>
            </PermissionGuard>
          </TabsContent>
          <TabsContent value="settings" className="m-0">
            <PermissionGuard
              module="settings"
              action="view_settings"
              screen={true}
            >
              <div className="bg-card rounded-lg sm:p-4">
                <Settings />
              </div>
            </PermissionGuard>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default UserManagement;

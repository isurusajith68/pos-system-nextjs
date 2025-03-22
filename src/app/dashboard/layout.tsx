"use client";

import NavBar from "@/components/NavBar";
import Sidebar from "@/components/Sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import React, { Suspense, useEffect, useRef, useState } from "react";
import { useScrollStore } from "@/store/useScrollRef";
import { getUserFromCookie } from "@/services/auth";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { getRolePermissions } from "@/services/permission";
import { usePermissionStore } from "@/store/usePremissionStore";
import { Loader2 } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { setScrollRef } = useScrollStore();
  const { setUser, user } = useAuthStore();
  const { setPermissions } = usePermissionStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPermission, setIsLoadingPermission] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (scrollRef.current) {
      setScrollRef(scrollRef);
    }
  }, [setScrollRef]);

  useEffect(() => {
    const noSelectElements = document.querySelectorAll(".no-select");
    noSelectElements.forEach((element) => {
      element.addEventListener("selectstart", (e) => e.preventDefault());
      element.addEventListener("dragstart", (e) => e.preventDefault());
      element.addEventListener("contextmenu", (e) => e.preventDefault());
      element.addEventListener("copy", (e) => e.preventDefault());
      element.addEventListener("cut", (e) => e.preventDefault());
      element.addEventListener("paste", (e) => e.preventDefault());
      element.addEventListener("drop", (e) => e.preventDefault());
    });

    return () => {
      noSelectElements.forEach((element) => {
        element.removeEventListener("selectstart", (e) => e.preventDefault());
        element.removeEventListener("dragstart", (e) => e.preventDefault());
        element.removeEventListener("contextmenu", (e) => e.preventDefault());
        element.removeEventListener("copy", (e) => e.preventDefault());
        element.removeEventListener("cut", (e) => e.preventDefault());
        element.removeEventListener("paste", (e) => e.preventDefault());
        element.removeEventListener("drop", (e) => e.preventDefault());
      });
    };
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      try {
        const user = await getUserFromCookie();
        if (!user) {
          router.push("/");
          return;
        }
        setUser(user);
      } catch (error) {
        console.error("Error loading user:", error);
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    const loadPermissions = async () => {
      if (!user) {
        setIsLoadingPermission(false);
        return;
      }

      setIsLoadingPermission(true);
      try {
        const permissions = await getRolePermissions(user.role);
        setPermissions(permissions?.permissions || []);
      } catch (error) {
        console.error("Error loading permissions:", error);
      } finally {
        setIsLoadingPermission(false);
      }
    };

    loadPermissions();
  }, [user, setPermissions]);

  return (
    <div className="flex sm:h-screen flex-col h-dvh no-select">
      {isLoading || isLoadingPermission ? (
        <div className="flex items-center justify-center h-full w-full">
          <Loader2 size={48} className="text-primary animate-spin" />
        </div>
      ) : (
        <>
          <NavBar user={user} />
          <div className="flex flex-1">
            <Sidebar />
            <Suspense fallback={<div>Loading...</div>}>
              <ScrollArea
                ref={scrollRef}
                className="flex-1 p-4 overflow-y-auto rounded-tl-2xl bg-secondary"
                style={{ height: "calc(100dvh - 60px)" }}
              >
                {children}
              </ScrollArea>
            </Suspense>
          </div>
        </>
      )}
    </div>
  );
};

export default Layout;

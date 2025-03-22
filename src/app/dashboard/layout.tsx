"use client";

import NavBar from "@/components/NavBar";
import Sidebar from "@/components/Sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import React, { Suspense, useEffect, useRef } from "react";
import { useScrollStore } from "@/store/useScrollRef";
import { getUserFromCookie } from "@/services/auth";
import { redirect } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { getRolePermissions, savePermissions } from "@/services/permission";
import { usePermissionStore } from "@/store/usePremissionStore";
import { Loader2 } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { setScrollRef } = useScrollStore();
  const { setUser, user } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(true);
  const { setPermissions } = usePermissionStore();
  const [isLoadingPermission, setIsLoadingPermission] = React.useState(true);
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
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      try {
        const user = await getUserFromCookie();
        if (!user) {
          router.push("/");
          setIsLoading(false);
          return;
        }
        setUser(user);

        setIsLoading(false);
      } catch (error) {
        router.push("/");
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };

    // savePermissions();
    if (!user) {
      loadUser();
    }
  }, []);

  useEffect(() => {
    setIsLoadingPermission(true);
    const loadPermissions = async (role: string) => {
      try {
        const permissions = await getRolePermissions(role);
        setPermissions(permissions?.permissions);
        setIsLoadingPermission(false);
      } catch (error) {
        console.error(error);
        setIsLoadingPermission(false);
      }
    };

    if (user) {
      loadPermissions(user.role);
    } else {
      setIsLoadingPermission(false);
    }
  }, [user]);

  return (
    <div className="flex sm:h-screen flex-col h-dvh no-select">
      {isLoading || isLoadingPermission ? (
        <div className="flex items-center justify-center h-full w-full">
          <Loader2
            size={48}
            className="
          text-primary animate-spin
          "
          />
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

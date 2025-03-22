"use client";

import { useState, useEffect } from "react";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getUserFromCookie, logoutUser } from "@/services/auth";
import { useRouter } from "next/navigation";
import { IoReload, IoReloadCircle } from "react-icons/io5";
import { set } from "date-fns";
import { Lock, LogOut, Printer, User } from "lucide-react";
import Image from "next/image";
import { useAuthStore } from "@/store/useAuthStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

export default function Navbar({ user }) {
  const [darkMode, setDarkMode] = useState(false);
  const [printerOnline, setPrinterOnline] = useState(false);
  const [count, setCount] = useState(0);
  const [spin, setSpin] = useState(false);
  useEffect(() => {
    if (localStorage.getItem("theme") === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
    const newTheme = darkMode ? "light" : "dark";
    localStorage.setItem("theme", newTheme);
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    const fetchPrinterOnline = async () => {
      setSpin(true);
      try {
        const res = await fetch("http://localhost:5000/printer-online");
        const data = await res.json();

        if (data.success) {
          setPrinterOnline(true);

          setTimeout(() => {
            setSpin(false);
          }, 1000);
        } else {
          setPrinterOnline(false);

          setTimeout(() => {
            setSpin(false);
          }, 1000);

          setPrinterOnline(false);
        }
      } catch (error) {
        console.error("Error fetching printer status:", error);
        setPrinterOnline(false);

        setTimeout(() => {
          setSpin(false);
        }, 1000);
      }
    };

    fetchPrinterOnline();
  }, [count]);

  const router = useRouter();

  return (
    <header className="sm:h-16 h-14 flex justify-between items-center px-6 bg-background pt-2 pl-5 p-1">
      <div className="flex items-center gap-5">
        <div className="flex items-center">
          <Image
            src="/favicon.png"
            width={35}
            height={35}
            alt="logo"
            className="mr-2 rounded-full"
          />
          <span className="sm:text-lg uppercase font-extrabold  font-[family-name:var(--font-geist-sans)] text-primary">
            The Cadbury
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div
          onClick={() => setCount(count + 1)}
          className="p-2 rounded-full hidden sm:flex bg-white dark:bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition duration-200 ease-in-out  gap-2"
        >
          {printerOnline ? (
            <span className="text-green-500 text-xs flex items-center gap-2">
              <Printer size={16} /> Online
            </span>
          ) : (
            <span className="text-red-500 text-xs flex items-center gap-2">
              <Printer size={16} /> Offline
            </span>
          )}
          <IoReloadCircle className={spin ? "animate-spin" : ""} size={20} />
        </div>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-white dark:bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition duration-200 ease-in-out"
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <MdLightMode className="sm:w-4 w-4 h-4 sm:h-4" />
          ) : (
            <MdDarkMode className="sm:w-4 w-4 h-4 sm:h-4" />
          )}
        </button>

        <div className="flex items-center cursor-pointer border-l border-border sm:pl-4 gap-4">
          <div className="flex flex-col items-end  ml-2 ">
            <span className="ml-2  font-semibold text-foreground text-xs sm:text-base">
              {user?.username}
            </span>
            <span className="ml-2 font-thin sm:text-xs text-[0.6rem]">
              {user?.role}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="uppercase">
                    {user?.username
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push("/dashboard/settings")}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => router.push("/dashboard/settings")}
              >
                <Lock className="mr-2 h-4 w-4" />
                Change Password
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={async () => {
                  await logoutUser();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

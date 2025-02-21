"use client";

import { useState, useEffect } from "react";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getUserFromCookie } from "@/services/auth";
import { redirect } from "next/navigation";
import { IoReload, IoReloadCircle } from "react-icons/io5";
import { set } from "date-fns";
import { Printer } from "lucide-react";
import Image from "next/image";
import { useAuthStore } from "@/store/useAuthStore";

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(false);
  const { user, setUser } = useAuthStore();
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
    const loadUser = async () => {
      const user = await getUserFromCookie();
      if (!user) {
        redirect("/");
      }
      setUser(user);
      console.log(user);
    };

    loadUser();
  }, []);

  useEffect(() => {
    const fetchPrinterOnline = async () => {
      setSpin(true);
      try {
        const res = await fetch("http://localhost:5000/printer-online");
        const data = await res.json();
        console.log("Printer Status:", data);

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
          <Avatar className="sm:w-8 sm:h-8 h-6 w-6">
            <AvatarImage
              src="https://github.com/shadcn.png"
              alt="User avatar"
            />
            <AvatarFallback>
              {user?.username.slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}

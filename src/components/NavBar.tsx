"use client";

import { useState, useEffect } from "react";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getUserFromCookie } from "@/services/auth";
import { redirect } from "next/navigation";

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
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
        redirect("/login");
      }
      setUser(user);
      console.log(user);
    };
    loadUser();
  }, []);

  return (
    <header className="h-16 flex justify-between items-center px-6 bg-background pt-2 pl-5">
      <div className="flex items-center gap-5">
        <div className="flex items-center">
          {/* <Image
            src="/loho.png"
            width={35}
            height={35}
            alt="logo"
            className="mr-2 rounded-full"
          /> */}
          <span className="text-lg font-extrabold  font-[family-name:var(--font-geist-sans)] text-primary">
            POS SYSTEM
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-white dark:bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition duration-200 ease-in-out"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
        </button>

        <div className="flex items-center cursor-pointer border-l border-border pl-4 gap-4">
          <div className="flex flex-col items-end  ml-2 ">
            <span className="ml-2  font-semibold text-foreground">
              {user?.name}
            </span>
            <span className="ml-2 font-thin text-xs ">{user?.role}</span>
          </div>
          <Avatar className="w-8 h-8">
            <AvatarImage
              src="https://github.com/shadcn.png"
              alt="User avatar"
            />
            <AvatarFallback>
              {user?.name.slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}

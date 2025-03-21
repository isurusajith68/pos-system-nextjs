"use client";

import { BiSolidDashboard, BiCartAdd } from "react-icons/bi";
import { TbLogout2 } from "react-icons/tb";
import { RiArchiveDrawerFill, RiBillLine, RiStockFill } from "react-icons/ri";
import { MdOutlineFastfood } from "react-icons/md";
import { IoSettingsSharp } from "react-icons/io5";
import { MdOutlineLibraryAdd } from "react-icons/md";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import Link from "next/link";
import { logoutUser } from "../services/auth";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const path = usePathname();


  const menuItems = [
    {
      id: "Dashboard",
      icon: <BiSolidDashboard className="sm:w-10 w-6" />,
      label: "Dashboard",
      link: "/dashboard",
    },
    {
      id: "Menu",
      icon: <MdOutlineFastfood className="sm:w-10 w-6" />,
      label: "Menu",
      link: "/dashboard/menu",
    },
    {
      id: "Products",
      icon: <BiCartAdd className="sm:w-10 w-6" />,
      label: "Products",
      link: "/dashboard/products",
    },
    {
      id: "Category",
      icon: <MdOutlineLibraryAdd className="sm:w-10 w-6" />,
      label: "Category",
      link: "/dashboard/categories",
    },
    {
      id: "Purchases History",
      icon: <RiBillLine className="sm:w-10 w-6" />,
      label: "Purchases History",
      link: "/dashboard/history",
    },
    {
      id: "Drawer",
      icon: <RiArchiveDrawerFill className="sm:w-10 w-6" />,
      label: "Drawer",
      link: "/dashboard/drawer",
    },
    {
      id: "Stock",
      icon: <RiStockFill className="sm:w-10 w-6" />,
      label: "Stock",
      link: "/dashboard/stock",
    },
    {
      id: "Settings",
      icon: <IoSettingsSharp className="sm:w-10 w-6" />,
      label: "Settings",
      link: "/dashboard/settings",
    },
  ];

  return (
    <aside className="sm:w-20 h-full flex flex-col justify-between py-6 px-3 bg-background w-12">
      <nav className="flex flex-col space-y-4">
        {menuItems.map((item) => (
          <TooltipProvider key={item.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={item.link}
                  className={`flex justify-center items-center sm:h-12 w-full rounded-lg transition duration-200 ease-in-out h-8
                    ${
                      path === item.link
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                >
                  {item.icon}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" align="center" sideOffset={16}>
                <p className="font-medium">{item.label}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </nav>

      <div className="flex flex-col items-center">
        <hr className="w-3/4 border-border mb-4" />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={async () => {
                  await logoutUser();
                }}
                className="flex justify-center items-center w-12 h-12 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 transition duration-200 ease-in-out rounded-lg"
              >
                <TbLogout2 className="sm:w-8 w-6" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" align="center" sideOffset={16}>
              <p className="font-medium">Logout</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  );
};

export default Sidebar;

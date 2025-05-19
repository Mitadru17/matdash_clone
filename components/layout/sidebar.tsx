"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import {
  LayoutDashboard, 
  BarChart2, 
  Users, 
  ShoppingCart, 
  FileText,
  MessageSquare, 
  User,
  CalendarDays,
  Mail,
  FileStack,
  ChevronDown,
  ChevronRight,
  Upload
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavLink {
  title: string;
  href: string;
  icon: React.ReactNode;
  active?: boolean;
  hasDropdown?: boolean;
}

interface NavSection {
  title: string;
  links: NavLink[];
}

const mainNavItems: NavSection[] = [
  {
    title: "DASHBOARDS",
    links: [
      {
        title: "Dashboard1",
        href: "/",
        icon: <LayoutDashboard className="w-5 h-5" />,
        active: true
      },
      {
        title: "Dashboard2",
        href: "/dashboard2",
        icon: <BarChart2 className="w-5 h-5" />
      },
      {
        title: "Dashboard3",
        href: "/dashboard3",
        icon: <BarChart2 className="w-5 h-5" />
      },
    ],
  },
  {
    title: "APPS",
    links: [
      {
        title: "Contacts",
        href: "/contacts",
        icon: <Users className="w-5 h-5" />
      },
      {
        title: "Video Uploader",
        href: "/upload",
        icon: <Upload className="w-5 h-5" />
      },
      {
        title: "ECommerce",
        href: "/ecommerce",
        icon: <ShoppingCart className="w-5 h-5" />,
        hasDropdown: true
      },
      {
        title: "Blogs",
        href: "/blogs",
        icon: <FileText className="w-5 h-5" />,
        hasDropdown: true
      },
      {
        title: "Chats",
        href: "/chats",
        icon: <MessageSquare className="w-5 h-5" />
      },
      {
        title: "Users Profile",
        href: "/profile",
        icon: <User className="w-5 h-5" />,
        hasDropdown: true
      },
      {
        title: "Invoice",
        href: "/invoice",
        icon: <FileText className="w-5 h-5" />,
        hasDropdown: true
      },
      {
        title: "Notes",
        href: "/notes",
        icon: <FileStack className="w-5 h-5" />
      },
      {
        title: "Calendar",
        href: "/calendar",
        icon: <CalendarDays className="w-5 h-5" />
      },
      {
        title: "Email",
        href: "/email",
        icon: <Mail className="w-5 h-5" />
      }
    ],
  }
]

type SidebarProps = {
  isSidebarOpen?: boolean
}

export default function Sidebar({ isSidebarOpen = true }: SidebarProps) {
  const pathname = usePathname()
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({})
  const [mounted, setMounted] = useState(false)
  const { theme, resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleDropdown = (title: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [title]: !prev[title]
    }))
  }

  const currentTheme = mounted ? (resolvedTheme || theme) : "light";
  const isDark = currentTheme === "dark";

  return (
    <div className={`h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
      <div className="flex items-center h-16 px-6 border-b border-gray-200 dark:border-gray-700">
            <Link
              href="/"
          className={`flex items-center ${isSidebarOpen ? 'space-x-2' : 'justify-center'} text-violet-600 dark:text-violet-400 font-semibold text-xl`}
            >
          <div className="flex justify-center items-center w-8 h-8 rounded-lg bg-violet-600">
            <svg 
              viewBox="0 0 24 24" 
              className="w-5 h-5 text-white" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
          </div>
          {isSidebarOpen && <span>MatDash</span>}
        </Link>
        </div>

      <div className={`flex-1 overflow-y-auto py-2 ${isSidebarOpen ? 'px-3' : 'px-2'}`}>
        {mainNavItems.map((section, sIndex) => (
          <div key={sIndex} className="mb-6">
            {isSidebarOpen ? (
              <h3 className="px-4 text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                {section.title}
              </h3>
            ) : (
              <div className="h-4 mb-2"></div>
            )}
            <ul className="space-y-1">
              {section.links.map((link, lIndex) => (
                <li key={lIndex}>
                  {link.hasDropdown && isSidebarOpen ? (
                    <div className="space-y-1">
                      <button
                        onClick={() => toggleDropdown(link.title)}
                        className={cn(
                          "flex items-center justify-between w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200",
                          pathname === link.href
                            ? "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        )}
                      >
                        <div className="flex items-center">
                          <span className="mr-3 text-gray-500 dark:text-gray-400">
                            {link.icon}
                          </span>
                          {link.title}
                        </div>
                        {openDropdowns[link.title] ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      <AnimatePresence>
                        {openDropdowns[link.title] && (
                          <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="pl-10 overflow-hidden"
                          >
                            <li>
                              <Link
                                href={`${link.href}/list`}
                                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                              >
                                List
                              </Link>
                            </li>
                            <li>
                              <Link
                                href={`${link.href}/details`}
                                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                              >
                                Details
                              </Link>
                            </li>
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      href={link.href}
                      className={cn(
                        `flex items-center ${isSidebarOpen ? 'px-4' : 'px-2 justify-center'} py-2 text-sm font-medium rounded-lg transition-colors duration-200`,
                        pathname === link.href
                          ? "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}
                    >
                      <span className={`${isSidebarOpen ? 'mr-3' : ''} text-gray-500 dark:text-gray-400`}>
                        {link.icon}
                      </span>
                      {isSidebarOpen && link.title}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

export const useSidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return {
    isSidebarOpen,
    toggleSidebar,
  }
}

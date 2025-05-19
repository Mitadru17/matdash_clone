"use client"

import { useAuth } from "@/context/auth-context"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Button } from "@/components/ui/button"
import { Menu, Search, Grid3X3, Bell, Flag, User, LogOut, Settings, Moon, Sun, HelpCircle } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { cn, getAvatarUrl } from "@/lib/utils"

interface NavbarProps {
  toggleSidebar: () => void
  toggleMobileMenu?: () => void
}

export function Navbar({ toggleSidebar, toggleMobileMenu }: NavbarProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Ensure theme is only checked after mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <header className="bg-white dark:bg-gray-900 flex items-center justify-between px-4 py-3 h-16 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300 relative z-20">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="p-1 mr-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none hidden md:flex"
        >
          <Menu className="h-6 w-6" />
        </Button>
        {toggleMobileMenu && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            className="p-1 mr-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none md:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>
        )}
        <div className="relative hidden sm:block">
          <div className="flex items-center border border-gray-200 rounded-md bg-gray-100 dark:bg-gray-800 dark:border-gray-700 px-3 py-1.5">
            <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="ml-2 bg-transparent border-0 focus:outline-none text-sm text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 w-48"
            />
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          className="p-1 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none relative"
        >
          <Bell className="h-6 w-6" />
          <span className="absolute top-0 right-0 h-5 w-5 flex items-center justify-center">
            <span className="absolute w-full h-full bg-red-500 rounded-full animate-ping opacity-75"></span>
            <span className="relative h-3.5 w-3.5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
              1
            </span>
          </span>
        </Button>
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-700 dark:text-violet-300 font-medium overflow-hidden hover:ring-2 hover:ring-violet-500"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            {user?.avatar ? (
              <Image
                src={user.avatar}
                alt="User avatar"
                width={36}
                height={36}
                className="rounded-full"
              />
            ) : (
              <div className="h-9 w-9 rounded-full overflow-hidden">
                <Image
                  src={getAvatarUrl(user?.name || user?.email || "default-user", 72)}
                  alt="User avatar"
                  width={36}
                  height={36}
                  className="rounded-full object-cover"
                />
              </div>
            )}
          </Button>
          
          <AnimatePresence>
            {showProfileMenu && (
              <motion.div 
                className="absolute right-0 mt-2 w-60 bg-white dark:bg-gray-800 rounded-xl shadow-lg py-1 z-30 border border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden mr-3">
                      {user?.avatar ? (
                        <Image
                          src={user.avatar}
                          alt="User avatar"
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <Image
                          src={getAvatarUrl(user?.name || user?.email || "default-user", 80)}
                          alt="User avatar"
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{user?.name || "User"}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || "user@example.com"}</p>
                    </div>
                  </div>
                </div>
                
                <div className="py-2">
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => {
                      router.push('/profile')
                      setShowProfileMenu(false)
                    }}
                  >
                    <User className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                    Profile
                  </button>
                  
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => {
                      router.push('/settings')
                      setShowProfileMenu(false)
                    }}
                  >
                    <Settings className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                    Settings
                  </button>
                  
                  <button
                    className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => {
                      setTheme(theme === "dark" ? "light" : "dark")
                      setShowProfileMenu(false)
                    }}
                  >
                    <div className="flex items-center">
                      {theme === "dark" ? (
                        <Sun className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <Moon className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                      )}
                      {theme === "dark" ? "Light Mode" : "Dark Mode"}
                    </div>
                    <div className="h-4 w-8 rounded-full bg-gray-200 dark:bg-gray-700 relative">
                      <div 
                        className={`absolute top-0.5 h-3 w-3 rounded-full transition-all duration-300 ${
                          theme === "dark" ? "right-0.5 bg-violet-500" : "left-0.5 bg-gray-500"
                        }`}
                      />
                    </div>
                  </button>
                  
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <HelpCircle className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                    Help & Support
                  </button>
            </div>
                
                <div className="py-2 border-t border-gray-200 dark:border-gray-700">
            <button
                    onClick={() => {
                      handleLogout()
                      setShowProfileMenu(false)
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
                    <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}

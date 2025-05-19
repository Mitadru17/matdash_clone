"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import Sidebar from "@/components/layout/sidebar"
import { Navbar } from "@/components/layout/navbar"
import { motion } from "framer-motion"
import { Footer } from "@/components/layout/footer"
import { useAuth } from "@/context/auth-context"
import { Settings, Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [mounted, setMounted] = useState(false)
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  // Ensure theme is only checked after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Apply theme class directly to the document for components that don't use context
  useEffect(() => {
    if (mounted) {
      const root = window.document.documentElement;
      
      // Remove any existing theme classes first
      root.classList.remove("light", "dark");
      
      // Then add the correct one
      if (resolvedTheme) {
        root.classList.add(resolvedTheme);
        root.style.colorScheme = resolvedTheme;
      }
    }
  }, [resolvedTheme, mounted]);

  // Close mobile menu when window resizes to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isMobileMenuOpen])

  const isDark = mounted ? resolvedTheme === 'dark' : false;

  // Don't render content until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)]">
        <div className="flex h-screen overflow-hidden">
          <div className="flex-1">
            <div className="py-6 px-4 h-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <div 
          className={`hidden md:block transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'w-64' : 'w-20'
          }`}
        >
          <Sidebar isSidebarOpen={isSidebarOpen} />
        </div>
        
        {/* Mobile Sidebar */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity" 
              onClick={toggleMobileMenu}
            />
            
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 flex z-40">
              <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-900">
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={toggleMobileMenu}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <Sidebar isSidebarOpen={true} />
              </div>
              <div className="flex-shrink-0 w-14" aria-hidden="true">
                {/* Force sidebar to shrink to fit close icon */}
              </div>
            </div>
          </div>
        )}
        
        <div className={`flex flex-col flex-1 w-0 overflow-hidden transition-all duration-300 ${
          isSidebarOpen ? 'md:ml-0' : 'md:ml-0'
        }`}>
          <Navbar toggleSidebar={toggleSidebar} toggleMobileMenu={toggleMobileMenu} />
          
          <main 
            className="relative flex-1 overflow-y-auto overflow-x-hidden focus:outline-none"
            id="main-content"
          >
            <div className="py-2 px-2">
              {children}
            </div>
          </main>
          <Footer />
        </div>
      </div>
      
      {/* Settings Button */}
      <button className="fixed bottom-4 right-4 p-3 bg-violet-600 hover:bg-violet-700 text-white rounded-full shadow-lg transition-colors duration-200">
        <Settings className="h-6 w-6" />
      </button>
      
      {/* Theme Toggle Button */}
      <button 
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className="fixed bottom-4 right-20 p-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full shadow-lg transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-700"
        aria-label="Toggle theme"
      >
        {isDark ? (
          <Sun className="h-6 w-6" />
        ) : (
          <Moon className="h-6 w-6" />
        )}
      </button>
    </div>
  )
}

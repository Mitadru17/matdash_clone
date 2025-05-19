"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Add forced client-side only rendering to avoid hydration mismatch
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Apply a class to hide content until client-side JS takes over
  if (!mounted) {
    return (
      <div className="theme-provider-init">
        <style jsx global>{`
          :root {
            --bg-color: #ffffff;
            --text-color: #000000;
          }
          
          .dark {
            --bg-color: #1f2937;
            --text-color: #ffffff;
          }
          
          body {
            background-color: var(--bg-color);
            color: var(--text-color);
          }
          
          .theme-provider-init {
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          
          html.light, html.dark {
            color-scheme: light dark;
          }
        `}</style>
        <NextThemesProvider {...props}>{children}</NextThemesProvider>
      </div>
    )
  }

  return (
    <NextThemesProvider {...props}>
      <div className="transition-opacity duration-300 opacity-100">
        {children}
      </div>
    </NextThemesProvider>
  )
}

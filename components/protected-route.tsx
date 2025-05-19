"use client"

import type React from "react"

import { useAuth } from "@/context/auth-context"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Public routes that don't require authentication
    const publicRoutes = ["/login"]

    // If not authenticated and not on a public route, redirect to login
    if (!isAuthenticated && !publicRoutes.includes(pathname)) {
      router.push("/login")
    }

    // If authenticated and on login page, redirect to dashboard
    if (isAuthenticated && publicRoutes.includes(pathname)) {
      router.push("/")
    }
  }, [isAuthenticated, pathname, router])

  return <>{children}</>
}

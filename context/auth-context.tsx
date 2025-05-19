"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { getAvatarUrl } from "@/lib/utils"

// Expanded user type with additional profile properties
type User = {
  email: string
  name: string
  avatar?: string
  bio?: string
  location?: string
  role?: string
}

type AuthContextType = {
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  updateUser: (updatedUserData: User) => void
  user: User | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [user, setUser] = useState<User>({
    email: "demo@example.com",
    name: "David Smith",
    avatar: getAvatarUrl("David Smith"),
    role: "Product Designer",
    bio: "I'm a product designer focused on creating beautiful and functional interfaces for web and mobile applications.",
    location: "San Francisco, CA"
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if user is authenticated on initial load
    const storedAuth = localStorage.getItem("isAuthenticated")
    const storedUser = localStorage.getItem("user")

    if (storedAuth === "true" && storedUser) {
      setIsAuthenticated(true)
      setUser(JSON.parse(storedUser))
    } else {
      // Initialize localStorage with demo data for testing
      const demoUser = {
        email: "demo@example.com",
        name: "David Smith",
        avatar: getAvatarUrl("David Smith"),
        role: "Product Designer",
        bio: "I'm a product designer focused on creating beautiful and functional interfaces for web and mobile applications.",
        location: "San Francisco, CA"
      }
      localStorage.setItem("isAuthenticated", "true")
      localStorage.setItem("user", JSON.stringify(demoUser))
      setUser(demoUser)
    }

    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // Simple validation for demo purposes
    if (email === "demo@example.com" && password === "demo123") {
      const userData = {
        email: "demo@example.com",
        name: "David Smith",
        avatar: getAvatarUrl("David Smith"),
        role: "Product Designer",
        bio: "I'm a product designer focused on creating beautiful and functional interfaces for web and mobile applications.",
        location: "San Francisco, CA"
      }

      setIsAuthenticated(true)
      setUser(userData)

      localStorage.setItem("isAuthenticated", "true")
      localStorage.setItem("user", JSON.stringify(userData))

      return { success: true }
    }

    return {
      success: false,
      message: "Invalid email or password. Try demo@example.com / demo123",
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUser(null as unknown as User)
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("user")
  }

  const updateUser = (updatedUserData: User) => {
    setUser(updatedUserData)
    localStorage.setItem("user", JSON.stringify(updatedUserData))
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, updateUser, user }}>
      {!isLoading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

"use client"

import { Layout } from "@/components/layout/layout"
import { useAuth } from "@/context/auth-context"
import { useState, useEffect, useRef } from "react"
import { User, Camera, Edit, Save, X } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    location: "",
    role: ""
  })
  const [avatar, setAvatar] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        location: user.location || "",
        role: user.role || ""
      })
      setAvatar(user.avatar || null)
    }
  }, [user])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setAvatar(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // In a real app, this would be an API call
    updateUser({
      ...user,
      ...formData,
      avatar: avatar || user?.avatar
    })
    
    setIsEditing(false)
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-violet-500 to-purple-600 h-48 relative">
            <button 
              onClick={handleLogout}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm transition-colors"
            >
              Logout
            </button>
          </div>
          
          {/* Avatar */}
          <div className="px-6 sm:px-12 relative -mt-20">
            <div className="relative inline-block">
              <div className="h-32 w-32 rounded-full border-4 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                {avatar ? (
                  <Image
                    src={avatar}
                    alt="User avatar"
                    width={128}
                    height={128}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-violet-100 dark:bg-violet-900/30">
                    <User className="h-12 w-12 text-violet-500 dark:text-violet-300" />
                  </div>
                )}
              </div>
              
              {isEditing && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-violet-600 hover:bg-violet-700 text-white p-2 rounded-full transition-colors"
                >
                  <Camera className="h-4 w-4" />
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </button>
              )}
            </div>
          </div>
          
          {/* Profile Content */}
          <div className="px-6 sm:px-12 py-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {isEditing ? (
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name} 
                      onChange={handleInputChange}
                      className="bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-violet-500 dark:focus:border-violet-400 outline-none px-1 py-0.5 text-2xl font-bold w-full max-w-xs"
                    />
                  ) : (
                    user?.name || "User"
                  )}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {isEditing ? (
                    <input 
                      type="text" 
                      name="role"
                      value={formData.role} 
                      onChange={handleInputChange}
                      placeholder="Your role or title"
                      className="bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-violet-500 dark:focus:border-violet-400 outline-none px-1 py-0.5 w-full max-w-xs"
                    />
                  ) : (
                    user?.role || "Member"
                  )}
                </p>
              </div>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setIsEditing(false)} 
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                  <button 
                    onClick={handleSubmit} 
                    className="flex items-center space-x-2 px-4 py-2 bg-violet-600 rounded-lg text-white hover:bg-violet-700 transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                </div>
              )}
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div>
                  <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Account Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email
                      </label>
                      {isEditing ? (
                        <input 
                          type="email" 
                          name="email"
                          value={formData.email} 
                          onChange={handleInputChange}
                          className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      ) : (
                        <p className="text-gray-800 dark:text-white">{user?.email || "user@example.com"}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Location
                      </label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          name="location"
                          value={formData.location} 
                          onChange={handleInputChange}
                          placeholder="City, Country"
                          className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      ) : (
                        <p className="text-gray-800 dark:text-white">{user?.location || "Not specified"}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">About Me</h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Bio
                    </label>
                    {isEditing ? (
                      <textarea 
                        name="bio"
                        value={formData.bio} 
                        onChange={handleInputChange}
                        placeholder="Tell us about yourself"
                        rows={4}
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    ) : (
                      <p className="text-gray-800 dark:text-white">{user?.bio || "No bio provided yet."}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {isEditing && (
                <div className="mt-8 text-right">
                  <button 
                    type="submit" 
                    className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </form>
            
            <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Account Settings</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">Email Notifications</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive email updates about account activity</p>
                  </div>
                  <div className="h-6 w-12 rounded-full bg-gray-200 dark:bg-gray-700 relative cursor-pointer">
                    <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-violet-500 transition-all"></div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security to your account</p>
                  </div>
                  <button className="px-4 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    Enable
                  </button>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">Password</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Last changed 3 months ago</p>
                  </div>
                  <button className="px-4 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    Change
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
} 
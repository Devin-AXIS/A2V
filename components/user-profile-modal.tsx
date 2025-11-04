"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, User, Globe, Briefcase, Camera } from "lucide-react"

interface UserProfile {
  avatar: string
  name: string
  website: string
  profession: string
  bio: string
}

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (profile: UserProfile) => void
  initialProfile?: UserProfile | null
  isFirstTime?: boolean
}

export function UserProfileModal({
  isOpen,
  onClose,
  onSave,
  initialProfile,
  isFirstTime = false,
}: UserProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile>({
    avatar: initialProfile?.avatar || "",
    name: initialProfile?.name || "",
    website: initialProfile?.website || "",
    profession: initialProfile?.profession || "",
    bio: initialProfile?.bio || "",
  })

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile)
    }
  }, [initialProfile])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (profile.name.trim()) {
      onSave(profile)
      onClose()
    }
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfile({ ...profile, avatar: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl backdrop-blur-[40px] bg-gradient-to-br from-white/[0.12] via-white/[0.08] to-white/[0.04] border border-white/30 rounded-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.12),0_0_80px_rgba(79,209,197,0.08)] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[32px]">
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-br from-primary/15 via-primary/8 to-transparent rounded-full blur-[80px] opacity-60" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-cyan-400/12 via-blue-500/8 to-transparent rounded-full blur-[80px] opacity-50" />
        </div>

        <div className="relative backdrop-blur-xl bg-white/5 border-b border-white/10 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shadow-[0_4px_16px_rgba(79,209,197,0.15)]">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {isFirstTime ? "Complete Your Profile" : "Edit Profile"}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {isFirstTime ? "Set up your profile to get started" : "Update your profile information"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 transition-all duration-300 group"
          >
            <X className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="relative p-8 space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden backdrop-blur-xl bg-white/5 border-2 border-white/20 shadow-[0_4px_24px_rgba(0,0,0,0.1)] flex items-center justify-center">
                {profile.avatar ? (
                  <img src={profile.avatar || "/placeholder.svg"} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-gray-400" />
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer">
                <Camera className="w-6 h-6 text-white" />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>
            <p className="text-xs text-gray-400">Click to upload avatar</p>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-300">
              <User className="w-3.5 h-3.5 text-primary" />
              Name *
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="Enter your name"
              required
              className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
            />
          </div>

          {/* Website */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-300">
              <Globe className="w-3.5 h-3.5 text-primary" />
              Website
            </label>
            <input
              type="url"
              value={profile.website}
              onChange={(e) => setProfile({ ...profile, website: e.target.value })}
              placeholder="https://yourwebsite.com"
              className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
            />
          </div>

          {/* Profession */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-300">
              <Briefcase className="w-3.5 h-3.5 text-primary" />
              Profession
            </label>
            <input
              type="text"
              value={profile.profession}
              onChange={(e) => setProfile({ ...profile, profession: e.target.value })}
              placeholder="e.g., Blockchain Developer"
              className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-300">
              <User className="w-3.5 h-3.5 text-primary" />
              Bio
            </label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!profile.name.trim()}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-cyan-400 text-black text-sm font-semibold hover:shadow-[0_4px_24px_rgba(79,209,197,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isFirstTime ? "Finish" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

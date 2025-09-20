'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUserProfile } from '@/lib/api/profiles'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '@/lib/types/database.types'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null)
      return
    }

    try {
      let userProfile = await getCurrentUserProfile()

      // 프로필이 없으면 생성 (회원가입 직후)
      if (!userProfile && user.user_metadata) {
        const { username, full_name } = user.user_metadata
        if (username) {
          const { createProfile } = await import('@/lib/api/profiles')
          userProfile = await createProfile({
            id: user.id,
            username,
            full_name: full_name || null,
            avatar_url: null,
            bio: null,
          })
        }
      }

      setProfile(userProfile)
    } catch (error) {
      console.error('Failed to fetch/create profile:', error)
      setProfile(null)
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      setSession(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  useEffect(() => {
    // 초기 세션 가져오기
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 인증 상태 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      if (session?.user) {
        // 사용자가 로그인하면 프로필 정보 가져오기
        await refreshProfile()
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // 사용자가 변경되면 프로필 새로고침
  useEffect(() => {
    if (user && !loading) {
      refreshProfile()
    }
  }, [user, loading])

  const value = {
    user,
    profile,
    session,
    loading,
    signOut,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
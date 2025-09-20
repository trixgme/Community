'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUserProfile } from '@/lib/api/profiles'
import { handleAuthError } from '@/lib/api'
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
      handleAuthError(error)
      setProfile(null)
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      setSession(null)
      // 로컬 스토리지도 정리
      localStorage.clear()
    } catch (error) {
      console.error('Error signing out:', error)
      // 에러가 발생해도 로컬 상태는 정리
      setUser(null)
      setProfile(null)
      setSession(null)
      localStorage.clear()
    }
  }

  useEffect(() => {
    // 초기 세션 가져오기
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session error:', error)
        handleAuthError(error)
        // 세션 에러가 있으면 로그아웃 처리
        setSession(null)
        setUser(null)
        setProfile(null)
      } else {
        setSession(session)
        setUser(session?.user ?? null)
      }
      setLoading(false)
    })

    // 인증 상태 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id)

      // TOKEN_REFRESHED 이벤트에서도 에러가 있을 수 있음
      if (event === 'TOKEN_REFRESHED' && !session) {
        console.log('Token refresh failed, signing out')
        await signOut()
        return
      }

      // SIGNED_OUT 이벤트나 세션이 null인 경우 처리
      if (event === 'SIGNED_OUT' || !session) {
        setSession(null)
        setUser(null)
        setProfile(null)
        setLoading(false)
        return
      }

      // 정상적인 세션인 경우
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      if (session?.user) {
        // 사용자가 로그인하면 프로필 정보 가져오기
        await refreshProfile()
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
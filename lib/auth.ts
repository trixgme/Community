import { supabase } from './supabase'
import { createProfile } from './api/profiles'
import type { User } from '@supabase/supabase-js'

export interface SignUpData {
  email: string
  password: string
  username: string
  fullName?: string
}

export interface SignInData {
  email: string
  password: string
}

// 회원가입
export async function signUp({ email, password, username, fullName }: SignUpData) {
  try {
    // 1. Supabase Auth에 사용자 생성 (메타데이터에 추가 정보 포함)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: fullName || null,
        }
      }
    })

    if (error) throw error

    // 2. 사용자가 생성되고 세션이 있으면 프로필 생성
    if (data.user && data.session) {
      // 잠시 대기 후 프로필 생성 (세션 설정 완료 대기)
      setTimeout(async () => {
        try {
          await createProfile({
            id: data.user!.id,
            username,
            full_name: fullName || null,
            avatar_url: null,
            bio: null,
          })
        } catch {
          console.log('Profile creation will be handled by trigger or on login')
        }
      }, 1000)
    }

    return { user: data.user, session: data.session }
  } catch (error) {
    throw error
  }
}

// 로그인
export async function signIn({ email, password }: SignInData) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return { user: data.user, session: data.session }
}

// 로그아웃
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// 현재 사용자 정보 가져오기
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// 세션 정보 가져오기
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// 비밀번호 재설정 요청
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })

  if (error) throw error
}

// 비밀번호 업데이트
export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password })
  if (error) throw error
}
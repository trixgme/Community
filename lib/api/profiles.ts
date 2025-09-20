import { supabase } from '../supabase'
import type { Profile, ProfileInsert, ProfileUpdate } from '../types/database.types'

// 프로필 조회 (by ID)
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
  return data;
}

// 프로필 조회 (by username)
export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// 새 프로필 생성 (회원가입 시)
export async function createProfile(profile: ProfileInsert): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .insert([profile])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 프로필 수정
export async function updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 현재 로그인한 사용자의 프로필 조회
export async function getCurrentUserProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  return getProfile(user.id);
}

// 사용자명 중복 확인
export async function checkUsernameAvailable(username: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single();

  if (error && error.code === 'PGRST116') return true; // 사용 가능
  if (error) throw error;

  return false; // 이미 존재함
}
import { supabase } from '../supabase'
import type { Post, PostInsert, PostWithProfile } from '../types/database.types'

// 모든 포스트 조회 (프로필 정보 포함)
export async function getPosts(): Promise<PostWithProfile[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles:user_id (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// 특정 사용자의 포스트 조회
export async function getUserPosts(userId: string): Promise<PostWithProfile[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles:user_id (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// 새 포스트 생성
export async function createPost(post: PostInsert): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .insert([post])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 포스트 수정
export async function updatePost(id: string, updates: Partial<PostInsert>): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 포스트 삭제
export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
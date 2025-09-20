import { supabase } from '../supabase'
import type { Like, LikeInsert } from '../types/database.types'

// 포스트 좋아요 추가
export async function likePost(userId: string, postId: string): Promise<Like> {
  const { data, error } = await supabase
    .from('likes')
    .insert([{ user_id: userId, post_id: postId }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 포스트 좋아요 취소
export async function unlikePost(userId: string, postId: string): Promise<void> {
  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('user_id', userId)
    .eq('post_id', postId);

  if (error) throw error;
}

// 사용자가 특정 포스트에 좋아요를 눌렀는지 확인
export async function checkUserLikedPost(userId: string, postId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
  return !!data;
}

// 포스트의 좋아요 목록 조회
export async function getPostLikes(postId: string): Promise<Like[]> {
  const { data, error } = await supabase
    .from('likes')
    .select(`
      *,
      profiles:user_id (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// 좋아요 토글 (있으면 삭제, 없으면 추가)
export async function toggleLike(userId: string, postId: string): Promise<boolean> {
  try {
    const isLiked = await checkUserLikedPost(userId, postId);

    if (isLiked) {
      await unlikePost(userId, postId);
      return false; // 좋아요 취소됨
    } else {
      await likePost(userId, postId);
      return true; // 좋아요 추가됨
    }
  } catch (error) {
    throw error;
  }
}
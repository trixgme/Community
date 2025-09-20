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

// 여러 포스트의 좋아요 상태를 한 번에 확인
export async function checkMultipleLikeStatus(userId: string, postIds: string[]): Promise<Record<string, boolean>> {
  try {
    const { data, error } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', userId)
      .in('post_id', postIds);

    if (error) {
      console.error('checkMultipleLikeStatus error:', error)
      return {}
    }

    // 결과를 객체 형태로 변환
    const likeStatusMap: Record<string, boolean> = {}

    // 모든 포스트를 false로 초기화
    postIds.forEach(postId => {
      likeStatusMap[postId] = false
    })

    // 좋아요한 포스트들을 true로 설정
    data?.forEach(like => {
      likeStatusMap[like.post_id] = true
    })

    return likeStatusMap
  } catch (error) {
    console.error('checkMultipleLikeStatus failed:', error)
    return {}
  }
}

// 좋아요 변경사항 실시간 구독
export function subscribeToLikeChanges(
  postId: string,
  callback: (payload: {
    eventType: 'INSERT' | 'DELETE' | 'UPDATE'
    new: Like | null
    old: Like | null
  }) => void
) {
  const subscription = supabase
    .channel(`likes:post:${postId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'likes',
        filter: `post_id=eq.${postId}`
      },
      (payload: any) => {
        callback({
          eventType: payload.eventType,
          new: payload.new,
          old: payload.old
        })
      }
    )
    .subscribe()

  return subscription
}
// API 함수들을 한 곳에서 export
export * from './posts'
export * from './likes'
export * from './comments'
export * from './profiles'

// 실시간 구독 유틸리티
import { supabase } from '../supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

// 포스트 실시간 구독
export function subscribeToPostChanges(
  callback: (payload: { eventType: string; new: unknown; old: unknown }) => void
): RealtimeChannel {
  return supabase
    .channel('posts-channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'posts'
      },
      callback
    )
    .subscribe();
}

// 좋아요 실시간 구독
export function subscribeToLikeChanges(
  postId: string,
  callback: (payload: { eventType: string; new: unknown; old: unknown }) => void
): RealtimeChannel {
  return supabase
    .channel(`likes-${postId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'likes',
        filter: `post_id=eq.${postId}`
      },
      callback
    )
    .subscribe();
}

// 댓글 실시간 구독
export function subscribeToCommentChanges(
  postId: string,
  callback: (payload: { eventType: string; new: unknown; old: unknown }) => void
): RealtimeChannel {
  return supabase
    .channel(`comments-${postId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `post_id=eq.${postId}`
      },
      callback
    )
    .subscribe();
}

// 구독 해제
export function unsubscribe(channel: RealtimeChannel): void {
  supabase.removeChannel(channel);
}
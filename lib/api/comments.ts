import { supabase } from '../supabase'
import type { Comment, CommentInsert, CommentWithProfile } from '../types/database.types'

// 포스트의 댓글 조회
export async function getPostComments(postId: string): Promise<CommentWithProfile[]> {
  const { data, error } = await supabase
    .from('comments')
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
    .order('created_at', { ascending: true }); // 댓글은 시간순으로

  if (error) throw error;
  return data || [];
}

// 새 댓글 생성
export async function createComment(comment: CommentInsert): Promise<Comment> {
  const { data, error } = await supabase
    .from('comments')
    .insert([comment])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 댓글 수정
export async function updateComment(id: string, content: string): Promise<Comment> {
  const { data, error } = await supabase
    .from('comments')
    .update({ content })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 댓글 삭제
export async function deleteComment(id: string): Promise<void> {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// 사용자의 모든 댓글 조회
export async function getUserComments(userId: string): Promise<CommentWithProfile[]> {
  const { data, error } = await supabase
    .from('comments')
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
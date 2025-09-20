'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getPostComments, createComment, subscribeToCommentChanges } from '@/lib/api/comments'
import type { CommentWithProfile } from '@/lib/types/database.types'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface CommentsSectionProps {
  postId: string
  isOpen: boolean
}

export default function CommentsSection({ postId, isOpen }: CommentsSectionProps) {
  const { user, profile } = useAuth()
  const [comments, setComments] = useState<CommentWithProfile[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const commentsEndRef = useRef<HTMLDivElement>(null)

  // 시간 포맷팅 함수
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return '방금 전'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes}분 전`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours}시간 전`
    } else {
      const days = Math.floor(diffInSeconds / 86400)
      if (days < 7) {
        return `${days}일 전`
      } else {
        return date.toLocaleDateString('ko-KR', {
          month: 'short',
          day: 'numeric'
        })
      }
    }
  }

  // 댓글 로드
  const loadComments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const fetchedComments = await getPostComments(postId)
      setComments(fetchedComments)
    } catch (error: unknown) {
      console.error('Failed to load comments:', error)
      setError('댓글을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [postId])

  // 댓글 작성
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !profile || !newComment.trim() || submitting) {
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      // 댓글 생성
      const newCommentData = await createComment({
        post_id: postId,
        user_id: user.id,
        content: newComment.trim(),
      })

      // 즉시 UI에 댓글 추가 (낙관적 업데이트)
      const optimisticComment: CommentWithProfile = {
        ...newCommentData,
        profiles: profile
      }

      setComments(prev => [...prev, optimisticComment])
      setNewComment('')

      // 스크롤을 맨 아래로 이동
      setTimeout(scrollToBottom, 100)

    } catch (error: unknown) {
      console.error('Failed to create comment:', error)
      setError(error instanceof Error ? error.message : '댓글 작성에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  // 댓글 목록 끝으로 스크롤
  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // 컴포넌트가 열릴 때 댓글 로드 및 실시간 구독
  useEffect(() => {
    if (isOpen && postId) {
      loadComments()
    }
  }, [isOpen, postId, loadComments])

  // 실시간 댓글 변경사항 구독
  useEffect(() => {
    let subscription: RealtimeChannel | null = null

    if (isOpen && postId) {
      subscription = subscribeToCommentChanges(postId, async (payload) => {
        console.log('Comment change detected:', payload)

        if (payload.eventType === 'INSERT') {
          // 새 댓글이 다른 사용자에 의해 추가된 경우만 처리
          // 현재 사용자가 작성한 댓글은 이미 낙관적 업데이트로 추가됨
          if (payload.new && user && (payload.new as { user_id: string })?.user_id !== user.id) {
            // 다른 사용자의 댓글은 전체 목록을 다시 로드해서 프로필 정보 포함
            await loadComments()
            setTimeout(scrollToBottom, 100)
          }
        } else if (payload.eventType === 'DELETE') {
          // 댓글 삭제 시 목록에서 제거
          setComments(prev => prev.filter(comment => comment.id !== payload.old?.id))
        } else if (payload.eventType === 'UPDATE') {
          // 댓글 수정 시 목록 업데이트 (MVP에서는 미사용)
          await loadComments()
        }
      })
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [isOpen, postId, user, loadComments])

  // 새 댓글 추가 시 스크롤
  useEffect(() => {
    if (comments.length > 0) {
      setTimeout(scrollToBottom, 100)
    }
  }, [comments.length])

  // 컴포넌트가 닫혀있으면 렌더링하지 않음
  if (!isOpen) {
    return null
  }

  return (
    <div className="border-t border-gray-100 bg-gray-50">
      {/* 댓글 목록 */}
      <div className="max-h-96 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">댓글 로딩 중...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <p>{error}</p>
            <button
              onClick={loadComments}
              className="mt-2 text-blue-500 hover:text-blue-600 underline"
            >
              다시 시도
            </button>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>첫 번째 댓글을 작성해보세요!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                {/* 프로필 사진 */}
                <img
                  src={comment.profiles?.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"}
                  alt={comment.profiles?.username || 'User'}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />

                {/* 댓글 내용 */}
                <div className="flex-1 min-w-0">
                  <div className="bg-white rounded-lg px-3 py-2 shadow-sm">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-sm text-gray-900">
                        {comment.profiles?.full_name || comment.profiles?.username || 'Unknown User'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-800 text-sm leading-relaxed break-words">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={commentsEndRef} />
          </div>
        )}
      </div>

      {/* 댓글 작성 폼 */}
      {user && profile ? (
        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleSubmitComment} className="flex space-x-3">
            {/* 사용자 프로필 사진 */}
            <img
              src={profile.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"}
              alt={profile.username}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />

            {/* 댓글 입력 */}
            <div className="flex-1 flex space-x-2">
              <textarea
                ref={textareaRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 입력하세요..."
                className="flex-1 p-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
                rows={1}
                maxLength={500}
                disabled={submitting}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmitComment(e)
                  }
                }}
              />

              {/* 전송 버튼 */}
              <button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </form>

          {/* 에러 메시지 */}
          {error && (
            <div className="mt-2 text-sm text-red-500">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 bg-white border-t border-gray-100 text-center text-gray-500">
          댓글을 작성하려면 로그인이 필요합니다.
        </div>
      )}
    </div>
  )
}
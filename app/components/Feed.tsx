'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import FeedPost from "./FeedPost";
import PostComposer from "./PostComposer";
import { getPosts } from '@/lib/api/posts'
import { subscribeToPostChanges } from '@/lib/api'
import { checkMultipleLikeStatus } from '@/lib/api/likes'
import type { PostWithProfile, FeedPostData } from '@/lib/types/database.types'
import type { RealtimeChannel } from '@supabase/supabase-js'

export default function Feed() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<PostWithProfile[]>([])
  const [likeStatus, setLikeStatus] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

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
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days}일 전`
    } else {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  }

  // 포스트 데이터를 FeedPost 컴포넌트 형식으로 변환
  const transformPostData = (post: PostWithProfile): FeedPostData => {
    return {
      id: post.id,
      author: {
        id: post.user_id,
        name: post.profiles?.full_name || post.profiles?.username || 'Unknown User',
        username: post.profiles?.username || 'unknown',
        avatar: post.profiles?.avatar_url || null,
      },
      timestamp: formatTimeAgo(post.created_at),
      content: post.content,
      image: post.image_url,
      likes: post.likes_count,
      comments: post.comments_count,
      shares: 0, // 공유 기능은 나중에 추가
      isLiked: Boolean(likeStatus[post.id]),
    }
  }

  // 포스트 목록 로드
  const loadPosts = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const fetchedPosts = await getPosts()
      setPosts(fetchedPosts)

      // 사용자가 로그인되어 있으면 좋아요 상태 확인
      if (user && fetchedPosts.length > 0) {
        try {
          const postIds = fetchedPosts.map(post => post.id)
          const userLikeStatus = await checkMultipleLikeStatus(user.id, postIds)
          console.log('Loaded like status:', userLikeStatus)
          setLikeStatus(userLikeStatus)
        } catch (likeError) {
          console.error('Failed to load like status:', likeError)
          // 좋아요 상태 로드 실패는 전체 로딩을 실패시키지 않음
        }
      } else {
        setLikeStatus({})
      }
    } catch (error: unknown) {
      console.error('Failed to load posts:', error)
      setError(error instanceof Error ? error.message : '포스트를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user])

  // 새 포스트 생성 시 호출되는 함수
  const handlePostCreated = useCallback(() => {
    loadPosts(true)
  }, [loadPosts])

  // 수동 새로고침
  const handleRefresh = useCallback(() => {
    loadPosts(true)
  }, [loadPosts])

  // 초기 로딩 및 실시간 구독
  useEffect(() => {
    loadPosts()

    // 실시간 포스트 변경사항 구독
    let subscription: RealtimeChannel | null = null

    // 포스트 변경사항 실시간 감지
    subscription = subscribeToPostChanges((payload) => {
      console.log('Post change detected:', payload)

      // 새 포스트 추가, 수정, 삭제 시 전체 목록 새로고침
      if (payload.eventType === 'INSERT' ||
          payload.eventType === 'UPDATE' ||
          payload.eventType === 'DELETE') {
        loadPosts(true)
      }
    })

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [loadPosts])

  // 로딩 상태
  if (loading && !refreshing) {
    return (
      <div className="max-w-2xl mx-auto">
        <PostComposer onPostCreated={handlePostCreated} />

        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-gray-500">포스트를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  // 에러 상태
  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <PostComposer onPostCreated={handlePostCreated} />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* 포스트 작성 영역 */}
      <PostComposer onPostCreated={handlePostCreated} />

      {/* 새로고침 버튼 */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="text-sm">{refreshing ? '새로고침 중...' : '새로고침'}</span>
        </button>
      </div>

      {/* 피드 포스트들 */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500 text-lg mb-2">아직 포스트가 없습니다</p>
          <p className="text-gray-400">첫 번째 포스트를 작성해보세요!</p>
        </div>
      ) : (
        <div className="space-y-0">
          {posts.map((post) => (
            <FeedPost
              key={post.id}
              {...transformPostData(post)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
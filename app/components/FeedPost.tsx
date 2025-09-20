'use client'

import { useState, useEffect } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { toggleLike, subscribeToLikeChanges } from '@/lib/api/likes';
import { subscribeToCommentChanges } from '@/lib/api/comments';
import CommentsSection from './CommentsSection';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface FeedPostProps {
  id: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string | null;
  };
  timestamp: string;
  content: string;
  image?: string | null;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
}

export default function FeedPost({
  id,
  author,
  timestamp,
  content,
  image,
  likes: initialLikes,
  comments,
  shares,
  isLiked: initialIsLiked
}: FeedPostProps) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isTogglingLike, setIsTogglingLike] = useState(false);
  const [commentsCount, setCommentsCount] = useState(comments);
  const [showComments, setShowComments] = useState(false);

  // props 변경 시 로컬 상태 동기화
  useEffect(() => {
    console.log(`Post ${id}: Updating like status from ${isLiked} to ${initialIsLiked}, likes from ${likes} to ${initialLikes}`);
    setIsLiked(initialIsLiked);
    setLikes(initialLikes);
  }, [initialIsLiked, initialLikes, id, isLiked, likes]);

  // 댓글 수 변경 시 동기화
  useEffect(() => {
    setCommentsCount(comments);
  }, [comments]);

  // 좋아요 토글 핸들러
  const handleLikeToggle = async () => {
    if (!user || isTogglingLike) return;

    // 현재 상태 저장 (롤백용)
    const currentIsLiked = isLiked;
    const currentLikes = likes;

    // 낙관적 업데이트 (Optimistic Update)
    const newIsLiked = !isLiked;
    const newLikes = newIsLiked ? likes + 1 : likes - 1;

    setIsLiked(newIsLiked);
    setLikes(newLikes);
    setIsTogglingLike(true);

    try {
      await toggleLike(user.id, id);
    } catch (error: unknown) {
      console.error('좋아요 토글 실패:', error);

      // 실패 시 이전 상태로 롤백
      setIsLiked(currentIsLiked);
      setLikes(currentLikes);

      // 사용자에게 알림 (선택적)
      // alert(error instanceof Error ? error.message : '좋아요 처리 중 오류가 발생했습니다.');
    } finally {
      setIsTogglingLike(false);
    }
  };

  // 댓글 섹션 토글
  const handleCommentsToggle = () => {
    setShowComments(!showComments);
  };

  // 실시간 좋아요 변경사항 구독
  useEffect(() => {
    let subscription: RealtimeChannel | null = null;

    if (id) {
      subscription = subscribeToLikeChanges(id, (payload) => {
        console.log('Like change detected for post:', id, payload);

        if (payload.eventType === 'INSERT') {
          // 새로운 좋아요 추가
          setLikes(prev => prev + 1);
          // 현재 사용자가 좋아요를 눌렀는지 확인
          if (user && payload.new?.user_id === user.id) {
            setIsLiked(true);
          }
        } else if (payload.eventType === 'DELETE') {
          // 좋아요 취소
          setLikes(prev => Math.max(0, prev - 1));
          // 현재 사용자가 좋아요를 취소했는지 확인
          if (user && payload.old?.user_id === user.id) {
            setIsLiked(false);
          }
        }
      });
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [id, user]);

  // 실시간 댓글 변경사항 구독 (댓글 개수 업데이트)
  useEffect(() => {
    let commentSubscription: RealtimeChannel | null = null;

    if (id) {
      commentSubscription = subscribeToCommentChanges(id, (payload) => {
        console.log('Comment change detected for post:', id, payload);

        if (payload.eventType === 'INSERT') {
          // 새 댓글 추가 시 개수 증가
          setCommentsCount(prev => prev + 1);
        } else if (payload.eventType === 'DELETE') {
          // 댓글 삭제 시 개수 감소
          setCommentsCount(prev => Math.max(0, prev - 1));
        }
      });
    }

    return () => {
      if (commentSubscription) {
        commentSubscription.unsubscribe();
      }
    };
  }, [id]);
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
      {/* 포스트 헤더 */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src={author.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"}
            alt={author.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{author.name}</h3>
            <p className="text-sm text-gray-500">{timestamp}</p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <MoreHorizontal className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* 포스트 내용 */}
      <div className="px-4 pb-3">
        <p className="text-gray-800 leading-relaxed">{content}</p>
      </div>

      {/* 이미지 */}
      {image && (
        <div className="mb-3">
          <img
            src={image}
            alt="포스트 이미지"
            className="w-full max-h-96 object-cover"
          />
        </div>
      )}

      {/* 좋아요/댓글 수 */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <Heart className="w-3 h-3 text-white fill-current" />
              </div>
              <span className="ml-2">{likes.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span>댓글 {commentsCount.toLocaleString()}개</span>
            <span>공유 {shares.toLocaleString()}개</span>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex items-center justify-around border-t border-gray-100 pt-3">
          <button
            onClick={handleLikeToggle}
            disabled={isTogglingLike || !user}
            className={`flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors flex-1 justify-center disabled:opacity-50 ${
              isLiked ? 'text-red-500' : 'text-gray-600'
            }`}
          >
            <Heart className={`w-5 h-5 transition-all ${
              isLiked ? 'text-red-500 fill-red-500' : 'text-gray-600'
            } ${isTogglingLike ? 'scale-110' : ''}`} />
            <span className={`font-medium transition-colors ${
              isLiked ? 'text-red-500' : 'text-gray-600'
            }`}>
              {isLiked ? '좋아요 취소' : '좋아요'}
            </span>
          </button>
          <button
            onClick={handleCommentsToggle}
            className={`flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors flex-1 justify-center ${
              showComments ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
            }`}
          >
            <MessageCircle className={`w-5 h-5 ${
              showComments ? 'text-blue-600' : 'text-gray-600'
            }`} />
            <span className={`font-medium ${
              showComments ? 'text-blue-600' : 'text-gray-600'
            }`}>
              {showComments ? '댓글 닫기' : '댓글'}
            </span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors flex-1 justify-center">
            <Share2 className="w-5 h-5 text-gray-600" />
            <span className="text-gray-600 font-medium">공유</span>
          </button>
        </div>
      </div>

      {/* 댓글 섹션 */}
      <CommentsSection
        postId={id}
        isOpen={showComments}
      />
    </div>
  );
}
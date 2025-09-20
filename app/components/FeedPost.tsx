'use client'

import { useState, useEffect } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal, Edit3, Trash2, X } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { toggleLike, subscribeToLikeChanges } from '@/lib/api/likes';
import { subscribeToCommentChanges } from '@/lib/api/comments';
import { updatePost, deletePost } from '@/lib/api/posts';
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
  onPostDeleted?: (postId: string) => void;
  onPostUpdated?: (postId: string, newContent: string) => void;
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
  isLiked: initialIsLiked,
  onPostDeleted,
  onPostUpdated
}: FeedPostProps) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isTogglingLike, setIsTogglingLike] = useState(false);
  const [commentsCount, setCommentsCount] = useState(comments);
  const [showComments, setShowComments] = useState(false);

  // 수정/삭제 관련 상태
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [currentContent, setCurrentContent] = useState(content); // 현재 표시되는 내용
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 현재 사용자가 게시글 작성자인지 확인
  const isOwner = user?.id === author.id;

  // props 변경 시 로컬 상태 동기화
  useEffect(() => {
    setIsLiked(initialIsLiked);
    setLikes(initialLikes);
  }, [initialIsLiked, initialLikes]);

  // 댓글 수 변경 시 동기화
  useEffect(() => {
    setCommentsCount(comments);
  }, [comments]);

  // 게시글 내용 변경 시 동기화
  useEffect(() => {
    setCurrentContent(content);
    setEditContent(content);
  }, [content]);

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

  // 게시글 수정 함수
  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(currentContent);
    setShowMenu(false);
  };

  // 게시글 수정 취소
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(currentContent);
  };

  // 게시글 수정 저장
  const handleSaveEdit = async () => {
    if (!editContent.trim() || isSaving) return;

    setIsSaving(true);
    try {
      await updatePost(id, { content: editContent.trim() });

      // 즉시 로컬 상태 업데이트
      setCurrentContent(editContent.trim());
      setIsEditing(false);

      // 부모 컴포넌트에도 알림
      onPostUpdated?.(id, editContent.trim());

    } catch (error: unknown) {
      console.error('게시글 수정 실패:', error);
      alert('게시글 수정에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 게시글 삭제 확인
  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(true);
    setShowMenu(false);
  };

  // 게시글 삭제 실행
  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      await deletePost(id);
      onPostDeleted?.(id);
      setShowDeleteConfirm(false);
    } catch (error: unknown) {
      console.error('게시글 삭제 실패:', error);
      alert('게시글 삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  // 실시간 좋아요 변경사항 구독
  useEffect(() => {
    let subscription: RealtimeChannel | null = null;

    if (id) {
      subscription = subscribeToLikeChanges(id, (payload) => {

        if (payload.eventType === 'INSERT') {
          // 새로운 좋아요 추가 - 다른 사용자의 경우에만 좋아요 수 증가
          if (!user || payload.new?.user_id !== user.id) {
            setLikes(prev => prev + 1);
          }
          // 현재 사용자가 좋아요를 누른 경우는 이미 낙관적 업데이트로 처리됨
        } else if (payload.eventType === 'DELETE') {
          // 좋아요 취소 - 다른 사용자의 경우에만 좋아요 수 감소
          if (!user || payload.old?.user_id !== user.id) {
            setLikes(prev => Math.max(0, prev - 1));
          }
          // 현재 사용자가 좋아요를 취소한 경우는 이미 낙관적 업데이트로 처리됨
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

        {/* 더보기 메뉴 (작성자만 표시) */}
        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <MoreHorizontal className="w-5 h-5 text-gray-500" />
            </button>

            {/* 드롭다운 메뉴 */}
            {showMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg border z-50">
                <button
                  onClick={handleEdit}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-md"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  수정
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-md"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  삭제
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 포스트 내용 */}
      <div className="px-4 pb-3">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-500"
              rows={3}
              placeholder="게시글 내용을 입력하세요..."
              disabled={isSaving}
            />
            <div className="flex space-x-2">
              <button
                onClick={handleSaveEdit}
                disabled={!editContent.trim() || isSaving}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors text-sm"
              >
                {isSaving ? '저장 중...' : '저장'}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm"
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-800 leading-relaxed">{currentContent}</p>
        )}
      </div>

      {/* 이미지 */}
      {image && (
        <div className="mb-3">
          <div className="w-full max-h-[500px] rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
            <img
              src={image}
              alt="포스트 이미지"
              className="max-w-full max-h-full object-contain"
              style={{
                maxHeight: '500px',
                width: 'auto',
                height: 'auto'
              }}
            />
          </div>
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

      {/* 메뉴 외부 클릭 처리 */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              게시글 삭제
            </h3>
            <p className="text-gray-600 mb-6">
              정말로 이 게시글을 삭제하시겠습니까? 삭제된 게시글은 복구할 수 없습니다.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg transition-colors"
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
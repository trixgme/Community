'use client'

import { useState, useRef } from 'react'
import { Image, X, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { createPost } from '@/lib/api/posts'
import { uploadImage, isImageFile, formatFileSize } from '@/lib/api/storage'

interface PostComposerProps {
  onPostCreated?: () => void
}

export default function PostComposer({ onPostCreated }: PostComposerProps) {
  const { user, profile } = useAuth()
  const [content, setContent] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 로그인하지 않은 사용자에게는 표시하지 않음
  if (!user || !profile) {
    return null
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 형식 검증
    if (!isImageFile(file)) {
      setError('지원하는 이미지 형식: JPG, PNG, GIF, WebP, SVG')
      return
    }

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(`이미지 크기는 5MB 이하여야 합니다. 현재 크기: ${formatFileSize(file.size)}`)
      return
    }

    setSelectedImage(file)
    setError(null)

    // 이미지 미리보기 생성
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      setError('내용을 입력해주세요.')
      return
    }

    if (!user) {
      setError('로그인이 필요합니다.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // 이미지 업로드 처리
      let imageUrl: string | null = null

      if (selectedImage) {
        try {
          console.log('이미지 업로드 시작:', selectedImage.name)
          setIsUploadingImage(true)
          imageUrl = await uploadImage(selectedImage)
          console.log('이미지 업로드 완료:', imageUrl)
        } catch (uploadError: any) {
          console.error('이미지 업로드 실패:', uploadError)
          setError(uploadError.message || '이미지 업로드에 실패했습니다.')
          return
        } finally {
          setIsUploadingImage(false)
        }
      }

      // 포스트 생성
      await createPost({
        user_id: user.id,
        content: content.trim(),
        image_url: imageUrl,
      })

      // 폼 초기화
      setContent('')
      setSelectedImage(null)
      setImagePreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // 부모 컴포넌트에 알림 (피드 새로고침용)
      onPostCreated?.()

    } catch (error: any) {
      console.error('Post creation error:', error)
      setError(error.message || '포스트 작성 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isValid = content.trim().length > 0

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 p-4">
      <form onSubmit={handleSubmit}>
        {/* 프로필과 입력창 */}
        <div className="flex space-x-3 mb-4">
          <img
            src={profile.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"}
            alt={profile.username}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`${profile.full_name || profile.username}님, 무슨 생각을 하고 계신가요?`}
              className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              rows={3}
              maxLength={2000}
              disabled={isSubmitting || isUploadingImage}
            />

            {/* 글자 수 카운터 */}
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-500">
                {content.length}/2000
              </span>
            </div>
          </div>
        </div>

        {/* 이미지 미리보기 */}
        {imagePreview && (
          <div className="relative mb-4">
            <img
              src={imagePreview}
              alt="미리보기"
              className={`w-full max-h-64 object-cover rounded-lg border border-gray-200 transition-opacity ${
                isUploadingImage ? 'opacity-50' : ''
              }`}
            />

            {/* 업로드 진행 표시 */}
            {isUploadingImage && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
                <div className="bg-white px-3 py-2 rounded-lg flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  <span className="text-sm font-medium">이미지 업로드 중...</span>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={removeImage}
              disabled={isUploadingImage}
              className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full text-white transition-colors disabled:opacity-30"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* 구분선 */}
        <div className="border-t border-gray-100 pt-3">
          {/* 액션 버튼들 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* 이미지 업로드 버튼 */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting || isUploadingImage}
                className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <Image className="w-5 h-5 text-green-500" />
                <span className="text-gray-600 font-medium">사진/동영상</span>
              </button>

              {/* 숨겨진 파일 입력 */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

            </div>

            {/* 게시 버튼 */}
            <button
              type="submit"
              disabled={!isValid || isSubmitting || isUploadingImage}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              {(isSubmitting || isUploadingImage) && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>
                {isUploadingImage ? '이미지 업로드 중...' : isSubmitting ? '게시 중...' : '게시'}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { updateProfile } from '@/lib/api/profiles'
import { uploadImage, isImageFile, formatFileSize } from '@/lib/api/storage'
import { Camera, Save, ArrowLeft, Loader2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // 폼 상태
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
    avatar_url: profile?.avatar_url || ''
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // 로그인하지 않은 경우 홈으로 리다이렉트
  useEffect(() => {
    if (!user || !profile) {
      router.push('/')
    }
  }, [user, profile, router])

  // 프로필 데이터가 로드되면 폼 데이터 업데이트
  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || ''
      })
    }
  }, [profile])

  // 로딩 중이거나 로그인하지 않은 경우
  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
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

  const handleSave = async () => {
    if (!user || !profile) return

    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      let avatarUrl = formData.avatar_url

      // 새 이미지 업로드 처리
      if (selectedImage) {
        setIsUploadingImage(true)
        try {
          avatarUrl = await uploadImage(selectedImage)
        } catch (uploadError: unknown) {
          console.error('이미지 업로드 실패:', uploadError)
          setError(uploadError instanceof Error ? uploadError.message : '이미지 업로드에 실패했습니다.')
          return
        } finally {
          setIsUploadingImage(false)
        }
      }

      // 프로필 업데이트
      await updateProfile(profile.id, {
        username: formData.username.trim(),
        full_name: formData.full_name.trim() || null,
        bio: formData.bio.trim() || null,
        avatar_url: avatarUrl
      })

      // 프로필 새로고침
      await refreshProfile()

      setSuccess('프로필이 성공적으로 업데이트되었습니다.')
      setIsEditing(false)
      setSelectedImage(null)
      setImagePreview(null)

    } catch (error: unknown) {
      console.error('프로필 업데이트 실패:', error)
      setError(error instanceof Error ? error.message : '프로필 업데이트에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      username: profile?.username || '',
      full_name: profile?.full_name || '',
      bio: profile?.bio || '',
      avatar_url: profile?.avatar_url || ''
    })
    setSelectedImage(null)
    setImagePreview(null)
    setError(null)
    setSuccess(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const currentAvatarUrl = imagePreview || formData.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face"

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto pt-8 pb-16">
        {/* 헤더 */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>돌아가기</span>
          </button>

          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">프로필 설정</h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                편집
              </button>
            )}
          </div>
        </div>

        {/* 프로필 카드 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* 성공/에러 메시지 */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* 프로필 이미지 */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <img
                src={currentAvatarUrl}
                alt="프로필 이미지"
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
              />

              {isEditing && (
                <>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSaving || isUploadingImage}
                    className="absolute bottom-0 right-0 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors disabled:opacity-50"
                  >
                    <Camera className="w-5 h-5" />
                  </button>

                  {selectedImage && (
                    <button
                      type="button"
                      onClick={removeImage}
                      disabled={isSaving || isUploadingImage}
                      className="absolute top-0 right-0 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}

              {/* 업로드 진행 표시 */}
              {isUploadingImage && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                </div>
              )}
            </div>

            {isEditing && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <p className="text-sm text-gray-500 mt-2 text-center">
                  클릭하여 프로필 이미지 변경<br />
                  (최대 5MB, JPG/PNG/GIF/WebP/SVG)
                </p>
              </>
            )}
          </div>

          {/* 프로필 정보 */}
          <div className="space-y-6">
            {/* 사용자명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사용자명
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="사용자명을 입력하세요"
                  disabled={isSaving || isUploadingImage}
                />
              ) : (
                <p className="px-3 py-2 text-gray-900 bg-gray-50 rounded-lg">
                  {profile.username}
                </p>
              )}
            </div>

            {/* 이름 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이름
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="실제 이름을 입력하세요"
                  disabled={isSaving || isUploadingImage}
                />
              ) : (
                <p className="px-3 py-2 text-gray-900 bg-gray-50 rounded-lg">
                  {profile.full_name || '이름 없음'}
                </p>
              )}
            </div>

            {/* 자기소개 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                자기소개
              </label>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-500"
                  placeholder="자기소개를 입력하세요..."
                  maxLength={500}
                  disabled={isSaving || isUploadingImage}
                />
              ) : (
                <p className="px-3 py-2 text-gray-900 bg-gray-50 rounded-lg min-h-[100px] whitespace-pre-wrap">
                  {profile.bio || '자기소개가 없습니다.'}
                </p>
              )}
              {isEditing && (
                <div className="flex justify-end mt-1">
                  <span className="text-sm text-gray-500">
                    {formData.bio.length}/500
                  </span>
                </div>
              )}
            </div>

            {/* 이메일 (읽기 전용) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <p className="px-3 py-2 text-gray-600 bg-gray-50 rounded-lg">
                {user.email}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                이메일은 변경할 수 없습니다.
              </p>
            </div>
          </div>

          {/* 편집 모드 버튼들 */}
          {isEditing && (
            <div className="flex space-x-3 mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={handleCancel}
                disabled={isSaving || isUploadingImage}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || isUploadingImage || !formData.username.trim()}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                {(isSaving || isUploadingImage) && <Loader2 className="w-4 h-4 animate-spin" />}
                <Save className="w-4 h-4" />
                <span>
                  {isUploadingImage ? '이미지 업로드 중...' : isSaving ? '저장 중...' : '저장'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
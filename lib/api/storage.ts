import { supabase } from '@/lib/supabase'

/**
 * 이미지를 Supabase Storage에 업로드
 */
export async function uploadImage(file: File): Promise<string> {
  if (!file) {
    throw new Error('파일이 선택되지 않았습니다.')
  }

  // 파일 검증
  if (!file.type.startsWith('image/')) {
    throw new Error('이미지 파일만 업로드할 수 있습니다.')
  }

  // 파일 크기 검증 (5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('파일 크기는 5MB 이하여야 합니다.')
  }

  // 파일명 생성 (timestamp + random + original extension)
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `posts/${fileName}`

  try {
    // Supabase Storage에 파일 업로드
    const { data, error } = await supabase.storage
      .from('post-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      })

    if (error) {
      console.error('Storage upload error:', error)
      throw new Error(`이미지 업로드에 실패했습니다: ${error.message}`)
    }

    // 공개 URL 생성
    const { data: publicUrlData } = supabase.storage
      .from('post-images')
      .getPublicUrl(data.path)

    if (!publicUrlData?.publicUrl) {
      throw new Error('이미지 URL을 생성할 수 없습니다.')
    }

    return publicUrlData.publicUrl
  } catch (error: unknown) {
    console.error('Image upload failed:', error)
    throw error
  }
}

/**
 * 이미지를 Storage에서 삭제
 */
export async function deleteImage(url: string): Promise<boolean> {
  try {
    // URL에서 파일 경로 추출
    const urlParts = url.split('/post-images/')
    if (urlParts.length !== 2) {
      console.error('Invalid image URL format:', url)
      return false
    }

    const filePath = urlParts[1]

    const { error } = await supabase.storage
      .from('post-images')
      .remove([filePath])

    if (error) {
      console.error('Storage delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Image deletion failed:', error)
    return false
  }
}

/**
 * 파일 크기를 읽기 쉬운 형태로 변환
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 이미지 파일인지 검증
 */
export function isImageFile(file: File): boolean {
  const validImageTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ]

  return validImageTypes.includes(file.type)
}

/**
 * 이미지 압축 (선택적 기능)
 */
export function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // 원본 비율 유지하며 최대 너비 설정
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio

      // 캔버스에 이미지 그리기
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)

      // 압축된 이미지를 Blob으로 변환
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            reject(new Error('이미지 압축에 실패했습니다.'))
          }
        },
        'image/jpeg',
        quality
      )
    }

    img.onerror = () => reject(new Error('이미지를 로드할 수 없습니다.'))
    img.src = URL.createObjectURL(file)
  })
}
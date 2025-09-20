'use client'

import { useState } from 'react'
import { signUp } from '@/lib/auth'
import { checkUsernameAvailable } from '@/lib/api/profiles'
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react'

interface SignupFormProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
}

export default function SignupForm({ onSuccess, onSwitchToLogin }: SignupFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    fullName: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const validateForm = async () => {
    const newErrors: Record<string, string> = {}

    // 이메일 검증
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요'
    }

    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요'
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다'
    }

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다'
    }

    // 사용자명 검증
    if (!formData.username) {
      newErrors.username = '사용자명을 입력해주세요'
    } else if (formData.username.length < 3) {
      newErrors.username = '사용자명은 최소 3자 이상이어야 합니다'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = '사용자명은 영문, 숫자, 밑줄만 사용 가능합니다'
    } else {
      // 사용자명 중복 확인
      try {
        const isAvailable = await checkUsernameAvailable(formData.username)
        if (!isAvailable) {
          newErrors.username = '이미 사용 중인 사용자명입니다'
        }
      } catch {
        newErrors.username = '사용자명 확인 중 오류가 발생했습니다'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    const isValid = await validateForm()

    if (!isValid) {
      setLoading(false)
      return
    }

    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        username: formData.username,
        fullName: formData.fullName || undefined,
      })

      onSuccess?.()
    } catch (error: unknown) {
      setErrors({
        submit: (error as Error).message || '회원가입 중 오류가 발생했습니다'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 해당 필드의 에러 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">회원가입</h2>
        <p className="text-gray-600 mt-2">새 계정을 만들어보세요</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 이메일 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            이메일
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="이메일을 입력하세요"
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* 사용자명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            사용자명
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleChange('username', e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500 ${
                errors.username ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="사용자명을 입력하세요"
            />
          </div>
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">{errors.username}</p>
          )}
        </div>

        {/* 이름 (선택사항) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            이름 (선택사항)
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
            placeholder="실제 이름을 입력하세요"
          />
        </div>

        {/* 비밀번호 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            비밀번호
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="비밀번호를 입력하세요"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5 text-gray-400" />
              ) : (
                <Eye className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        {/* 비밀번호 확인 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            비밀번호 확인
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500 ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="비밀번호를 다시 입력하세요"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5 text-gray-400" />
              ) : (
                <Eye className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        {errors.submit && (
          <p className="text-red-500 text-sm text-center">{errors.submit}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-2 px-4 rounded-lg font-medium transition-colors"
        >
          {loading ? '회원가입 중...' : '회원가입'}
        </button>
      </form>

      <div className="text-center mt-4">
        <span className="text-gray-600">이미 계정이 있으신가요? </span>
        <button
          onClick={onSwitchToLogin}
          className="text-blue-500 hover:text-blue-600 font-medium"
        >
          로그인
        </button>
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { signIn } from '@/lib/auth'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'

interface LoginFormProps {
  onSuccess?: () => void
  onSwitchToSignup?: () => void
  onForgotPassword?: () => void
}

export default function LoginForm({
  onSuccess,
  onSwitchToSignup,
  onForgotPassword
}: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요'
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      await signIn({
        email: formData.email,
        password: formData.password,
      })

      onSuccess?.()
    } catch (error: any) {
      setErrors({
        submit: error.message === 'Invalid login credentials'
          ? '이메일 또는 비밀번호가 올바르지 않습니다'
          : error.message || '로그인 중 오류가 발생했습니다'
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
        <h2 className="text-2xl font-bold text-gray-900">로그인</h2>
        <p className="text-gray-600 mt-2">계정에 로그인하세요</p>
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
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="이메일을 입력하세요"
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
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
              className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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

        {/* 비밀번호 찾기 */}
        <div className="text-right">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            비밀번호를 잊으셨나요?
          </button>
        </div>

        {errors.submit && (
          <p className="text-red-500 text-sm text-center">{errors.submit}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-2 px-4 rounded-lg font-medium transition-colors"
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <div className="text-center mt-4">
        <span className="text-gray-600">계정이 없으신가요? </span>
        <button
          onClick={onSwitchToSignup}
          className="text-blue-500 hover:text-blue-600 font-medium"
        >
          회원가입
        </button>
      </div>
    </div>
  )
}
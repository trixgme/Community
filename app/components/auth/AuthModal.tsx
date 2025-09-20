'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'

type AuthMode = 'login' | 'signup'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: AuthMode
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login'
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode)

  if (!isOpen) return null

  const handleSuccess = () => {
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="relative bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* 컨텐츠 */}
        <div className="p-6">
          {mode === 'login' ? (
            <LoginForm
              onSuccess={handleSuccess}
              onSwitchToSignup={() => setMode('signup')}
              onForgotPassword={() => {
                // TODO: 비밀번호 재설정 모달 구현
                alert('비밀번호 재설정 기능은 곧 추가될 예정입니다.')
              }}
            />
          ) : (
            <SignupForm
              onSuccess={handleSuccess}
              onSwitchToLogin={() => setMode('login')}
            />
          )}
        </div>
      </div>
    </div>
  )
}
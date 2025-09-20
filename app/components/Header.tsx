'use client'

import { useState } from 'react'
import { Search, Home, Users, Bell, MessageCircle, LogOut, Settings } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import AuthModal from './auth/AuthModal'

export default function Header() {
  const { user, profile, signOut } = useAuth()
  const router = useRouter()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const handleProfileClick = () => {
    if (user) {
      setShowProfileMenu(!showProfileMenu)
    } else {
      setShowAuthModal(true)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setShowProfileMenu(false)
  }

  const handleSettingsClick = () => {
    router.push('/profile')
    setShowProfileMenu(false)
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 로고 및 검색 */}
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-blue-600">Community</h1>
            {user && (
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="검색"
                  className="pl-10 pr-4 py-2 bg-gray-100 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 text-gray-900 placeholder:text-gray-500"
                />
              </div>
            )}
          </div>

          {/* 네비게이션 */}
          <div className="flex items-center space-x-2">
            {user ? (
              <>
                {/* 로그인된 사용자용 네비게이션 */}
                <button className="p-3 hover:bg-gray-100 rounded-lg transition-colors">
                  <Home className="w-6 h-6 text-gray-700" />
                </button>
                <button className="p-3 hover:bg-gray-100 rounded-lg transition-colors">
                  <Users className="w-6 h-6 text-gray-700" />
                </button>
                <button className="p-3 hover:bg-gray-100 rounded-lg transition-colors">
                  <MessageCircle className="w-6 h-6 text-gray-700" />
                </button>
                <button className="p-3 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bell className="w-6 h-6 text-gray-700" />
                </button>

                {/* 프로필 드롭다운 */}
                <div className="relative ml-3">
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg p-2 transition-colors"
                  >
                    <img
                      src={profile?.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"}
                      alt="프로필"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="hidden sm:block text-sm font-medium text-gray-700">
                      {profile?.username}
                    </span>
                  </button>

                  {/* 프로필 메뉴 */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-50">
                      <div className="p-2">
                        <div className="px-3 py-2 text-sm text-gray-500 border-b">
                          {profile?.full_name && (
                            <div className="font-medium text-gray-900">{profile.full_name}</div>
                          )}
                          <div>@{profile?.username}</div>
                        </div>
                        <button
                          onClick={handleSettingsClick}
                          className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded mt-1"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          설정
                        </button>
                        <button
                          onClick={handleSignOut}
                          className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          로그아웃
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* 로그인되지 않은 사용자용 */
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  로그인
                </button>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                >
                  회원가입
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 인증 모달 */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="login"
      />

      {/* 프로필 메뉴 닫기 (외부 클릭) */}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </header>
  )
}
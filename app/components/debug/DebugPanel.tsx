'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { getCurrentUserProfile } from '@/lib/api/profiles'

export default function DebugPanel() {
  const { user, profile, session, loading } = useAuth()
  const [debugData, setDebugData] = useState<any>(null)

  const checkDatabase = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')

      const { data: { session: currentSession } } = await supabase.auth.getSession()

      setDebugData({
        profiles: profiles || [],
        profilesError: error?.message,
        currentSession: currentSession ? {
          userId: currentSession.user.id,
          email: currentSession.user.email,
          metadata: currentSession.user.user_metadata
        } : null,
        authContextData: {
          user: user ? { id: user.id, email: user.email } : null,
          profile,
          hasSession: !!session,
          loading
        }
      })
    } catch (err: any) {
      setDebugData({ error: err.message })
    }
  }

  useEffect(() => {
    checkDatabase()
  }, [user, profile])

  const testProfileCreation = async () => {
    if (!user) {
      alert('로그인이 필요합니다')
      return
    }

    try {
      const { createProfile } = await import('@/lib/api/profiles')
      const newProfile = await createProfile({
        id: user.id,
        username: user.user_metadata?.username || `user_${user.id.slice(0, 8)}`,
        full_name: user.user_metadata?.full_name || null,
        avatar_url: null,
        bio: null,
      })
      alert('프로필 생성 성공!')
      checkDatabase()
    } catch (error: any) {
      alert(`프로필 생성 실패: ${error.message}`)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md max-h-96 overflow-y-auto z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">Debug Panel</h3>
        <button
          onClick={checkDatabase}
          className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
        >
          새로고침
        </button>
      </div>

      <div className="text-xs space-y-2">
        <div>
          <strong>Auth Context:</strong>
          <pre className="bg-gray-100 p-1 text-xs overflow-x-auto">
            {JSON.stringify(debugData?.authContextData, null, 2)}
          </pre>
        </div>

        <div>
          <strong>Current Session:</strong>
          <pre className="bg-gray-100 p-1 text-xs overflow-x-auto">
            {JSON.stringify(debugData?.currentSession, null, 2)}
          </pre>
        </div>

        <div>
          <strong>Profiles in DB ({debugData?.profiles?.length || 0}):</strong>
          {debugData?.profilesError && (
            <p className="text-red-500 text-xs">{debugData.profilesError}</p>
          )}
          <pre className="bg-gray-100 p-1 text-xs overflow-x-auto max-h-32 overflow-y-auto">
            {JSON.stringify(debugData?.profiles, null, 2)}
          </pre>
        </div>

        {user && (
          <button
            onClick={testProfileCreation}
            className="w-full text-xs bg-green-500 text-white px-2 py-1 rounded"
          >
            수동 프로필 생성 테스트
          </button>
        )}

        {debugData?.error && (
          <p className="text-red-500 text-xs">{debugData.error}</p>
        )}
      </div>
    </div>
  )
}
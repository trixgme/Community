import { Search, Home, Users, Bell, MessageCircle } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 로고 및 검색 */}
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-blue-600">Community</h1>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="검색"
                className="pl-10 pr-4 py-2 bg-gray-100 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
          </div>

          {/* 네비게이션 */}
          <div className="flex items-center space-x-2">
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

            {/* 프로필 */}
            <div className="ml-3">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
                alt="프로필"
                className="w-8 h-8 rounded-full object-cover cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
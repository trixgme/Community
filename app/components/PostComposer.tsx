import { Image, Smile, MapPin } from "lucide-react";

export default function PostComposer() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 p-4">
      {/* 프로필과 입력창 */}
      <div className="flex space-x-3 mb-4">
        <img
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
          alt="내 프로필"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <textarea
            placeholder="무슨 생각을 하고 계신가요?"
            className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
        </div>
      </div>

      {/* 구분선 */}
      <div className="border-t border-gray-100 pt-3">
        {/* 액션 버튼들 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors">
              <Image className="w-5 h-5 text-green-500" />
              <span className="text-gray-600 font-medium">사진/동영상</span>
            </button>
            <button className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors">
              <Smile className="w-5 h-5 text-yellow-500" />
              <span className="text-gray-600 font-medium">기분/활동</span>
            </button>
            <button className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors">
              <MapPin className="w-5 h-5 text-red-500" />
              <span className="text-gray-600 font-medium">체크인</span>
            </button>
          </div>

          {/* 게시 버튼 */}
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            게시
          </button>
        </div>
      </div>
    </div>
  );
}
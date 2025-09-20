import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";

interface FeedPostProps {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  timestamp: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
}

export default function FeedPost({
  author,
  timestamp,
  content,
  image,
  likes,
  comments,
  shares
}: FeedPostProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
      {/* 포스트 헤더 */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src={author.avatar}
            alt={author.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{author.name}</h3>
            <p className="text-sm text-gray-500">{timestamp}</p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <MoreHorizontal className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* 포스트 내용 */}
      <div className="px-4 pb-3">
        <p className="text-gray-800 leading-relaxed">{content}</p>
      </div>

      {/* 이미지 */}
      {image && (
        <div className="mb-3">
          <img
            src={image}
            alt="포스트 이미지"
            className="w-full max-h-96 object-cover"
          />
        </div>
      )}

      {/* 좋아요/댓글 수 */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <Heart className="w-3 h-3 text-white fill-current" />
              </div>
              <span className="ml-2">{likes.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span>댓글 {comments.toLocaleString()}개</span>
            <span>공유 {shares.toLocaleString()}개</span>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex items-center justify-around border-t border-gray-100 pt-3">
          <button className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors flex-1 justify-center">
            <Heart className="w-5 h-5 text-gray-600" />
            <span className="text-gray-600 font-medium">좋아요</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors flex-1 justify-center">
            <MessageCircle className="w-5 h-5 text-gray-600" />
            <span className="text-gray-600 font-medium">댓글</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors flex-1 justify-center">
            <Share2 className="w-5 h-5 text-gray-600" />
            <span className="text-gray-600 font-medium">공유</span>
          </button>
        </div>
      </div>
    </div>
  );
}
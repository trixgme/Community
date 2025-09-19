import FeedPost from "./FeedPost";
import PostComposer from "./PostComposer";

const mockPosts = [
  {
    id: "1",
    author: {
      name: "SBS 뉴스",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
    },
    timestamp: "1일 전",
    content: "아이폰17 안 살래요...영포티 밈 난리난 이유 #reels",
    image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=400&fit=crop",
    likes: 462,
    comments: 208,
    shares: 63
  },
  {
    id: "2",
    author: {
      name: "김철수",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
    },
    timestamp: "3시간 전",
    content: "오늘 날씨가 정말 좋네요! 모두들 좋은 하루 보내세요 😊",
    likes: 24,
    comments: 5,
    shares: 2
  },
  {
    id: "3",
    author: {
      name: "이영희",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face"
    },
    timestamp: "5시간 전",
    content: "새로운 카페를 발견했어요! 커피도 맛있고 분위기도 너무 좋아요. 추천드립니다!",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop",
    likes: 89,
    comments: 12,
    shares: 7
  },
  {
    id: "4",
    author: {
      name: "박민수",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face"
    },
    timestamp: "1일 전",
    content: "주말에 등산 다녀왔습니다. 정상에서 바라본 풍경이 정말 멋있었어요!",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
    likes: 156,
    comments: 23,
    shares: 15
  }
];

export default function Feed() {
  return (
    <div className="max-w-2xl mx-auto">
      {/* 포스트 작성 영역 */}
      <PostComposer />

      {/* 피드 포스트들 */}
      <div className="space-y-0">
        {mockPosts.map((post) => (
          <FeedPost key={post.id} {...post} />
        ))}
      </div>
    </div>
  );
}
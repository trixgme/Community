export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: ProfileInsert
        Update: ProfileUpdate
      }
      posts: {
        Row: Post
        Insert: PostInsert
        Update: PostUpdate
      }
      likes: {
        Row: Like
        Insert: LikeInsert
        Update: LikeUpdate
      }
      comments: {
        Row: Comment
        Insert: CommentInsert
        Update: CommentUpdate
      }
    }
  }
}

export interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

export interface ProfileInsert {
  id: string
  username: string
  full_name?: string | null
  avatar_url?: string | null
  bio?: string | null
}

export interface ProfileUpdate {
  username?: string
  full_name?: string | null
  avatar_url?: string | null
  bio?: string | null
}

export interface Post {
  id: string
  user_id: string
  content: string
  image_url: string | null
  likes_count: number
  comments_count: number
  created_at: string
  updated_at: string
}

export interface PostInsert {
  user_id: string
  content: string
  image_url?: string | null
}

export interface PostUpdate {
  content?: string
  image_url?: string | null
}

export interface Like {
  id: string
  user_id: string
  post_id: string
  created_at: string
}

export interface LikeInsert {
  user_id: string
  post_id: string
}

export interface LikeUpdate {
  // Likes typically don't get updated
}

export interface Comment {
  id: string
  user_id: string
  post_id: string
  content: string
  created_at: string
  updated_at: string
}

export interface CommentInsert {
  user_id: string
  post_id: string
  content: string
}

export interface CommentUpdate {
  content?: string
}

// Extended types with joins
export interface PostWithProfile extends Post {
  profiles: Profile
}

export interface CommentWithProfile extends Comment {
  profiles: Profile
}

// Utility types for components
export interface FeedPostData {
  id: string
  author: {
    id: string
    name: string
    username: string
    avatar: string | null
  }
  timestamp: string
  content: string
  image?: string | null
  likes: number
  comments: number
  shares: number
  isLiked?: boolean
}

export interface CommentData {
  id: string
  author: {
    id: string
    name: string
    username: string
    avatar: string | null
  }
  content: string
  timestamp: string
}
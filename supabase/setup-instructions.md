# Supabase 데이터베이스 설정 가이드

이 파일들을 사용해서 Supabase 프로젝트에 데이터베이스를 설정하세요.

## 🚀 설정 순서

### 1. Supabase 프로젝트 생성
1. [supabase.com](https://supabase.com)에서 새 프로젝트 생성
2. 프로젝트 설정에서 Database URL과 anon key 확인

### 2. SQL 마이그레이션 실행
Supabase Dashboard의 SQL Editor에서 다음 순서로 실행:

1. **001_create_profiles.sql** - 사용자 프로필 테이블
2. **002_create_posts.sql** - 포스트 테이블
3. **003_create_likes.sql** - 좋아요 테이블
4. **004_create_comments.sql** - 댓글 테이블
5. **005_create_functions.sql** - 데이터베이스 함수 및 트리거
6. **006_create_storage.sql** - 이미지 저장소 버킷

### 3. Authentication 설정
1. Authentication > Settings에서 다음 설정:
   - Enable email confirmations: OFF (개발용)
   - Enable phone confirmations: OFF
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

### 4. 환경 변수 설정
`.env.local` 파일 생성:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📁 생성된 파일 구조

```
supabase/
├── migrations/
│   ├── 001_create_profiles.sql
│   ├── 002_create_posts.sql
│   ├── 003_create_likes.sql
│   ├── 004_create_comments.sql
│   ├── 005_create_functions.sql
│   └── 006_create_storage.sql
└── setup-instructions.md

lib/
└── types/
    └── database.types.ts
```

## 🔒 보안 기능

- **Row Level Security (RLS)** 모든 테이블에 활성화
- **인증 기반 정책** 사용자는 본인 데이터만 수정 가능
- **공개 읽기** 모든 포스트/댓글/프로필은 공개적으로 읽기 가능
- **이미지 저장소** 사용자별 폴더 구조로 보안 관리

## 🎯 주요 기능

### 자동 카운터 업데이트
- 좋아요 추가/삭제 시 `posts.likes_count` 자동 업데이트
- 댓글 추가/삭제 시 `posts.comments_count` 자동 업데이트

### 타임스탬프 관리
- `created_at` 자동 설정
- `updated_at` 자동 업데이트 트리거

### 이미지 저장소
- `avatars` 버킷: 프로필 이미지
- `posts` 버킷: 포스트 이미지
- 공개 접근 가능, 사용자별 업로드 권한

## ✅ 테스트 방법

1. Supabase Dashboard에서 Table Editor로 데이터 확인
2. Authentication > Users에서 테스트 사용자 생성
3. SQL Editor에서 쿼리 테스트:

```sql
-- 프로필 생성 테스트
SELECT * FROM profiles;

-- 포스트 생성 테스트
SELECT * FROM posts;

-- 좋아요 기능 테스트
SELECT * FROM likes;
```

## 🔄 다음 단계

1. Supabase 클라이언트 라이브러리 설치
2. 인증 시스템 구현
3. CRUD API 함수 작성
4. React 컴포넌트와 연동

이제 모든 데이터베이스 구조가 준비되었습니다! 🎉
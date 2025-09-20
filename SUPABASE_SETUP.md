# 🚀 Supabase 수동 설정 가이드

MCP 연결 문제로 인해 수동으로 Supabase를 설정하는 방법입니다.

## 📋 설정 순서

### 1. Supabase Dashboard 접속
1. https://supabase.com/dashboard 접속
2. 프로젝트 `xhcmmejinybnmpaztsyw` 선택 (또는 새 프로젝트 생성)

### 2. 환경 변수 설정
1. `.env.local.example` 파일을 `.env.local`로 복사
2. Supabase Dashboard → Settings → API에서 키 복사:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xhcmmejinybnmpaztsyw.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[여기에 anon public key 붙여넣기]
   ```

### 3. 데이터베이스 테이블 생성
Supabase Dashboard → SQL Editor에서 `supabase/migrations/` 폴더의 파일들을 순서대로 실행:

1. **001_create_profiles.sql** 실행
2. **002_create_posts.sql** 실행
3. **003_create_likes.sql** 실행
4. **004_create_comments.sql** 실행
5. **005_create_functions.sql** 실행
6. **006_create_storage.sql** 실행

### 4. 인증 설정
Dashboard → Authentication → Settings:
- **Site URL**: `http://localhost:3000`
- **Redirect URLs**: `http://localhost:3000/auth/callback`
- **Email confirmations**: OFF (개발용)

### 5. 테스트
```bash
npm run dev
```

개발 서버 실행 후 브라우저에서 http://localhost:3000 확인

## 🛠️ 문제 해결

### API 키를 찾을 수 없는 경우
1. Supabase Dashboard → Settings → API
2. "Project API keys" 섹션에서 복사
3. `anon` `public` 키는 클라이언트용
4. `service_role` `secret` 키는 서버용 (주의해서 관리)

### 테이블 생성 실패시
1. SQL Editor에서 한 번에 하나씩 실행
2. 에러 메시지 확인
3. 기존 테이블이 있다면 DROP 후 재생성

### 권한 오류시
1. RLS (Row Level Security) 정책 확인
2. 인증 설정 확인
3. API 키가 올바른지 확인

## ✅ 완료 체크리스트

- [ ] .env.local 파일 생성 및 API 키 설정
- [ ] 6개 SQL 마이그레이션 파일 실행 완료
- [ ] 인증 설정 완료
- [ ] 개발 서버 실행 및 접속 확인
- [ ] @supabase/supabase-js 패키지 설치 완료

모든 단계가 완료되면 Supabase와 Next.js 앱이 연결됩니다! 🎉
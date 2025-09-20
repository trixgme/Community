# 🔧 Supabase 인증 설정 문제 해결

## 🎯 현재 문제
1. 회원가입은 되지만 profiles 테이블에 데이터가 저장되지 않음
2. 로그인 세션이 유지되지 않음

## 🛠️ Supabase Dashboard 설정 확인

### 1. Authentication 설정
**URL**: https://supabase.com/dashboard/project/ovuzjusxrvwkxvvjddwo/auth/users

**Settings → Authentication → Settings**에서 다음 확인:

```
✅ Enable email confirmations: OFF (개발용)
✅ Enable phone confirmations: OFF
✅ Enable custom SMTP: OFF (개발용)
✅ Site URL: http://localhost:3000
✅ Redirect URLs: http://localhost:3000/auth/callback
```

### 2. RLS 정책 수정 (가장 중요!)

**SQL Editor**에서 다음 실행:

```sql
-- 기존 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- 기존 INSERT 정책 제거
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;

-- 새로운 관대한 정책 생성
CREATE POLICY "Allow profile creation for authenticated users"
ON profiles FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- UPDATE 정책도 확인
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);
```

### 3. 테이블 권한 확인

```sql
-- profiles 테이블 권한 확인
SELECT * FROM information_schema.table_privileges
WHERE table_name = 'profiles';

-- RLS 상태 확인
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'profiles';
```

## 🧪 테스트 단계

### 1. 브라우저에서 확인
1. **http://localhost:3000** 접속
2. **우측 하단 Debug Panel** 확인
3. **회원가입 시도**
4. **Debug Panel에서 데이터 확인**

### 2. 수동 프로필 생성 테스트
Debug Panel에서 "수동 프로필 생성 테스트" 버튼 클릭

### 3. SQL에서 직접 확인
```sql
-- 사용자 확인 (auth 테이블)
SELECT id, email, created_at FROM auth.users;

-- 프로필 확인
SELECT * FROM profiles;

-- 현재 사용자 확인 (RLS 적용)
SELECT auth.uid(), auth.role();
```

## 🚨 가능한 문제들

### 문제 1: 이메일 확인 대기
- **증상**: 회원가입 후 이메일 확인 대기 상태
- **해결**: Authentication Settings에서 "Enable email confirmations" OFF

### 문제 2: RLS 정책 너무 엄격
- **증상**: "new row violates row-level security policy" 에러
- **해결**: 위의 RLS 정책 수정 SQL 실행

### 문제 3: 세션 쿠키 문제
- **증상**: 새로고침 시 로그인 상태 해제
- **해결**: 브라우저 쿠키 허용 확인

## 📝 체크리스트

- [ ] Email confirmations OFF
- [ ] Site URL 올바름 (http://localhost:3000)
- [ ] RLS 정책 수정 완료
- [ ] Debug Panel에서 실시간 데이터 확인
- [ ] 브라우저 콘솔 에러 확인
- [ ] 쿠키/세션 저장 허용

## 🎯 다음 단계

모든 설정이 완료되면:
1. 새로운 이메일로 회원가입 시도
2. Debug Panel에서 profiles 테이블 확인
3. 성공하면 Debug Panel 제거하고 실제 기능 구현
-- Fix profiles RLS policies and add automatic profile creation

-- 기존 정책 제거
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- 새로운 정책: 회원가입 시 프로필 생성 허용
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- 또는 더 안전한 방법: 프로필 생성을 자동화하는 트리거 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거: auth.users에 새 사용자가 추가되면 자동으로 프로필 생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 기존 INSERT 정책을 더 관대하게 변경 (선택적)
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Enable insert for authenticated users only"
ON profiles FOR INSERT
WITH CHECK (auth.role() = 'authenticated');
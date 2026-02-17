# Vercel 배포 가이드

Policenthief 프로젝트를 Vercel에 배포하는 가이드입니다.

---

## 🚀 배포 전 준비사항

### ✅ 체크리스트

배포하기 전에 다음 사항을 확인하세요:

- [ ] Firebase 설정 완료 (SETUP.md 참고)
- [ ] `.env.local` 파일에 모든 환경 변수 설정
- [ ] 로컬에서 테스트 완료 (`npm run dev`)
- [ ] 빌드 테스트 성공 (`npm run build`)
- [ ] PWA 아이콘 생성 (icon-192.png, icon-512.png)
- [ ] Service Worker 설정 (선택 사항)
- [ ] Git 저장소 생성

---

## 1️⃣ Git 저장소 준비

### 1.1 Git 초기화 (아직 안 했다면)

```bash
cd /Users/jm/Documents/policenthief

# Git 초기화
git init

# .gitignore 확인
cat .gitignore
# 다음 항목들이 포함되어 있어야 함:
# node_modules/
# .next/
# .env.local
# .vercel/
```

### 1.2 첫 커밋

```bash
# 모든 파일 스테이징
git add .

# 커밋
git commit -m "Initial commit: Policenthief game"
```

### 1.3 GitHub에 푸시 (옵션 1)

```bash
# GitHub에서 새 저장소 생성 후
git remote add origin https://github.com/YOUR_USERNAME/policenthief.git
git branch -M main
git push -u origin main
```

### 1.4 또는 Vercel Git 사용 (옵션 2)

Vercel에서 자동으로 Git 저장소 생성 가능 (추천)

---

## 2️⃣ Vercel 계정 생성

### 2.1 회원가입

1. https://vercel.com 접속
2. **"Sign Up"** 클릭
3. **GitHub / GitLab / Bitbucket** 중 하나로 연동 (권장: GitHub)
4. 이메일 인증 완료

### 2.2 팀 생성 (선택)

- 개인 프로젝트: Hobby 플랜 (무료)
- 팀 프로젝트: Pro 플랜 ($20/월)

> ℹ️ Hobby 플랜으로 충분합니다!

---

## 3️⃣ Vercel 프로젝트 생성

### 방법 1: Vercel 대시보드 (GUI)

#### 3.1 새 프로젝트 생성

1. Vercel 대시보드 접속
2. **"Add New..." > Project"** 클릭
3. GitHub 저장소 연동
4. **"Import"** 버튼 클릭

#### 3.2 프로젝트 설정

**Framework Preset**: Next.js (자동 감지)

**Build and Output Settings**:
- Build Command: `npm run build` (기본값)
- Output Directory: `.next` (기본값)
- Install Command: `npm install` (기본값)

**Root Directory**: `./` (기본값)

#### 3.3 환경 변수 설정

**Environment Variables** 섹션에서:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=policenthief-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=policenthief-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=policenthief-xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef...
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://policenthief-xxxxx...
```

> ⚠️ **주의**:
> - `.env.local` 파일 내용을 그대로 복사
> - **Environment**: Production, Preview, Development 모두 체크
> - API 키는 공개되어도 괜찮음 (Firebase 보안 규칙으로 보호)

#### 3.4 배포

**"Deploy"** 버튼 클릭

배포 진행 상황 확인:
- Installing dependencies (1~2분)
- Building (1~2분)
- Uploading (30초)
- **Success! 🎉**

---

### 방법 2: Vercel CLI (터미널)

#### 3.1 Vercel CLI 설치

```bash
npm install -g vercel
```

#### 3.2 로그인

```bash
vercel login
```

이메일 입력 > 이메일로 받은 인증 링크 클릭

#### 3.3 배포

```bash
cd /Users/jm/Documents/policenthief

# 첫 배포 (대화형 설정)
vercel

# 질문에 답변:
# Set up and deploy? Y
# Which scope? [당신의 계정 선택]
# Link to existing project? N
# What's your project's name? policenthief
# In which directory is your code located? ./
# Want to override settings? N
```

#### 3.4 환경 변수 추가

```bash
# 환경 변수 추가 (하나씩)
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY

# 또는 .env.local에서 일괄 추가
vercel env pull .env.production.local
```

#### 3.5 프로덕션 배포

```bash
# 프로덕션 배포
vercel --prod
```

---

## 4️⃣ 배포 후 설정

### 4.1 도메인 확인

배포 완료 후 URL이 표시됩니다:
```
https://policenthief-xxxxx.vercel.app
```

### 4.2 Firebase Authorized Domains 추가

Firebase Console > **Authentication** > **Settings** > **Authorized domains**:

1. **"도메인 추가"** 클릭
2. Vercel URL 입력 (예: `policenthief-xxxxx.vercel.app`)
3. **"추가"** 클릭

### 4.3 커스텀 도메인 설정 (선택)

Vercel 대시보드 > 프로젝트 > **Settings** > **Domains**:

1. **"Add"** 클릭
2. 도메인 입력 (예: `policenthief.com`)
3. DNS 설정 안내에 따라 설정
4. 인증 완료 후 자동 HTTPS 적용

---

## 5️⃣ PWA 설정

### 5.1 PWA 아이콘 생성

아이콘이 없다면 생성해야 합니다:

#### 옵션 1: 온라인 도구 사용

1. https://realfavicongenerator.net/ 접속
2. 기존 SVG 업로드 (`public/icons/icon.svg`)
3. 설정 조정
4. 다운로드 후 `public/icons/` 폴더에 배치

#### 옵션 2: ImageMagick 사용

```bash
# ImageMagick 설치 (Mac)
brew install imagemagick

# SVG를 PNG로 변환
convert -background none -size 192x192 public/icons/icon.svg public/icons/icon-192.png
convert -background none -size 512x512 public/icons/icon.svg public/icons/icon-512.png
```

#### 옵션 3: 임시 아이콘 (빠른 테스트용)

```bash
cd /Users/jm/Documents/policenthief/public/icons

# 단색 PNG 생성 (임시)
convert -size 192x192 xc:#3b82f6 -gravity center -pointsize 100 -fill white -annotate +0+0 "🚔" icon-192.png
convert -size 512x512 xc:#3b82f6 -gravity center -pointsize 300 -fill white -annotate +0+0 "🚔" icon-512.png
```

### 5.2 manifest.json 확인

`public/manifest.json` 파일이 올바른지 확인:

```json
{
  "name": "경찰과 도둑",
  "short_name": "경도",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 5.3 Service Worker (선택 사항)

간단한 Service Worker 추가:

`public/sw.js` 생성:

```javascript
// 캐시 이름
const CACHE_NAME = 'policenthief-v1';

// 캐시할 파일 목록
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// 설치
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// 활성화
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 요청 가로채기
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

`src/app/layout.tsx`에 등록 코드 추가:

```typescript
// useEffect 추가
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
}, []);
```

---

## 6️⃣ 배포 테스트

### 6.1 기능 테스트

배포된 URL에 접속하여:

- [ ] 메인 페이지 로딩
- [ ] 방 생성
- [ ] 초대 링크로 참여
- [ ] 위치 권한 요청
- [ ] 지도 표시
- [ ] 게임 시작
- [ ] 플레이어 위치 실시간 업데이트
- [ ] 체포/구출 기능

### 6.2 PWA 설치 테스트

**모바일 (iOS)**:
1. Safari에서 배포 URL 접속
2. 공유 버튼 > "홈 화면에 추가"
3. 앱 아이콘 확인
4. 앱 실행

**모바일 (Android)**:
1. Chrome에서 배포 URL 접속
2. "설치" 팝업 또는 메뉴 > "홈 화면에 추가"
3. 앱 아이콘 확인
4. 앱 실행

**데스크톱 (Chrome)**:
1. 주소창 오른쪽 "설치" 아이콘 클릭
2. PWA 창으로 실행

### 6.3 성능 테스트

**Lighthouse 실행**:

1. 배포 URL 접속
2. 개발자 도구 (F12) > **Lighthouse** 탭
3. **"Analyze page load"** 클릭
4. 점수 확인:
   - Performance: 90+ 목표
   - Accessibility: 90+ 목표
   - Best Practices: 90+ 목표
   - SEO: 80+ 목표
   - PWA: 모든 항목 통과 목표

---

## 7️⃣ 지속적 배포 (CI/CD)

### 7.1 자동 배포 설정

GitHub 저장소 연동 시 자동으로 설정됨:

- **main 브랜치**: 프로덕션 배포
- **다른 브랜치**: 프리뷰 배포
- **Pull Request**: 프리뷰 자동 생성

### 7.2 배포 워크플로우

```bash
# 로컬에서 작업
git checkout -b feature/new-feature
# 코드 수정

# 커밋 및 푸시
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# GitHub에서 Pull Request 생성
# Vercel이 자동으로 프리뷰 배포

# 테스트 후 main에 병합
# 자동으로 프로덕션 배포
```

### 7.3 배포 후 확인

Vercel 대시보드 > 프로젝트 > **Deployments**:
- 배포 상태 확인
- 로그 확인
- 이전 버전으로 롤백 가능

---

## 8️⃣ 모니터링

### 8.1 Vercel Analytics

Vercel 대시보드 > 프로젝트 > **Analytics**:
- 페이지 뷰
- 고유 방문자
- 로딩 시간
- 지역별 트래픽

### 8.2 Vercel Speed Insights

```bash
# Speed Insights 추가
npm install @vercel/speed-insights
```

`src/app/layout.tsx`:
```typescript
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### 8.3 Firebase 사용량 확인

Firebase Console > **Usage and billing**:
- Firestore 쿼리 횟수
- Realtime Database 전송량
- 동시 접속자 수
- 비용 예측

---

## 9️⃣ 문제 해결

### 빌드 실패

**증상**: "Build failed" 오류

**원인**: 
- TypeScript 오류
- 누락된 환경 변수
- 의존성 오류

**해결**:
```bash
# 로컬에서 빌드 테스트
npm run build

# 오류 확인 후 수정
# 다시 푸시
```

### 환경 변수가 작동하지 않음

**증상**: Firebase 연결 실패

**원인**: 환경 변수 미설정 또는 오타

**해결**:
1. Vercel 대시보드 > 프로젝트 > **Settings** > **Environment Variables**
2. 모든 `NEXT_PUBLIC_*` 변수 확인
3. 오타 수정
4. **Redeploy** 클릭

### 위치 권한 요청이 나타나지 않음

**증상**: 지도가 표시되지 않음

**원인**: HTTPS 필요 (Vercel은 자동 HTTPS)

**해결**:
- Vercel 배포 URL은 자동으로 HTTPS
- 커스텀 도메인도 자동 인증서 발급
- HTTP에서는 Geolocation API 작동 안 함

### PWA 설치 버튼이 나타나지 않음

**증상**: "설치" 옵션 없음

**원인**:
- manifest.json 오류
- 아이콘 누락
- HTTPS 미적용

**해결**:
1. 브라우저 개발자 도구 > **Application** > **Manifest**
2. 오류 확인
3. 아이콘 파일 존재 확인
4. HTTPS 확인

### 500 Internal Server Error

**증상**: 일부 페이지에서 500 오류

**원인**:
- 서버 사이드 렌더링 오류
- 환경 변수 미설정

**해결**:
1. Vercel 대시보드 > 프로젝트 > **Deployments** > 로그 확인
2. 오류 메시지 확인
3. 코드 수정 후 재배포

---

## 🔄 업데이트 배포

### 코드 변경 시

```bash
# 변경 사항 커밋
git add .
git commit -m "Update: ..."
git push

# Vercel이 자동으로 배포
```

### 환경 변수 변경 시

1. Vercel 대시보드에서 환경 변수 수정
2. **Redeploy** 필요 (자동 배포 안 됨)
3. 최신 배포 선택 > **Redeploy** 클릭

---

## 📊 성능 최적화

### 1. 이미지 최적화

Next.js `Image` 컴포넌트 사용:

```typescript
import Image from 'next/image';

<Image src="/icons/icon.svg" width={100} height={100} alt="Logo" />
```

### 2. 코드 스플리팅

동적 import 사용:

```typescript
import dynamic from 'next/dynamic';

const GameMap = dynamic(() => import('@/components/GameMap'), {
  ssr: false,
  loading: () => <div>지도 로딩 중...</div>
});
```

### 3. CDN 활용

Vercel은 자동으로 전 세계 CDN 배포:
- 정적 파일 캐싱
- 엣지 네트워크
- 자동 압축

---

## 💰 비용 관리

### Vercel 무료 플랜 한도

- **대역폭**: 100GB/월
- **빌드 시간**: 100시간/월 (Hobby)
- **서버리스 함수**: 100GB-시간/월
- **도메인**: 무제한

### 예상 비용

**일일 100게임 기준**:
- Vercel: $0 (무료 범위 내)
- Firebase: $0 (무료 범위 내)
- 도메인: $10~15/년 (선택 사항)

### 비용 초과 시

1. Firebase: Blaze 플랜 (종량제)
2. Vercel: Pro 플랜 ($20/월)

---

## 🎯 배포 체크리스트

배포 완료 확인:

- [ ] Vercel 프로젝트 생성
- [ ] 환경 변수 설정
- [ ] 첫 배포 성공
- [ ] 도메인 접속 확인
- [ ] Firebase Authorized Domains 추가
- [ ] 기능 테스트 완료
- [ ] PWA 설치 테스트 (모바일)
- [ ] Lighthouse 점수 확인
- [ ] 자동 배포 설정 확인
- [ ] 모니터링 설정

---

## 📚 참고 자료

- [Vercel 공식 문서](https://vercel.com/docs)
- [Next.js 배포](https://nextjs.org/docs/deployment)
- [PWA 가이드](https://web.dev/progressive-web-apps/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

---

## 🎉 배포 완료!

이제 친구들에게 링크를 공유하고 함께 게임을 즐기세요!

**배포 URL 공유 방법**:
- 카카오톡으로 링크 공유
- QR 코드 생성하여 스캔
- SNS에 게시

**피드백 받기**:
- GitHub Issues
- 사용자 설문
- 실제 게임 플레이 테스트

즐거운 개발 되세요! 🚀

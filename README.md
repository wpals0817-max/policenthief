# 🚔🏃 경찰과 도둑 (Policenthief)

친구들과 함께하는 실시간 GPS 기반 야외 술래잡기 게임

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Firebase](https://img.shields.io/badge/Firebase-11.x-orange)

---

## 📱 프로젝트 소개

**경찰과 도둑**은 어린 시절 즐겼던 술래잡기를 GPS와 실시간 통신 기술로 재해석한 모바일 웹 게임입니다.

### 주요 기능

- 🗺️ **실시간 위치 추적**: 모든 플레이어의 위치를 지도에서 실시간으로 확인
- 🎮 **간편한 방 생성**: 링크 공유만으로 친구 초대
- 👮 **팀 플레이**: 경찰 팀 vs 도둑 팀
- ⛓️ **체포 & 구출**: 거리 기반 자동 체포 및 동료 구출
- 🌍 **활동 범위 설정**: 게임 구역을 자유롭게 설정
- 📊 **게임 기록**: 플레이 통계 및 전적 저장
- 📱 **PWA 지원**: 앱처럼 설치하여 사용 가능

---

## 🛠️ 기술 스택

### Frontend
- **Next.js 16** (App Router, React 19)
- **TypeScript** (타입 안정성)
- **Tailwind CSS** (스타일링)
- **Leaflet** (지도)

### Backend & Database
- **Firebase Authentication** (익명 로그인)
- **Firebase Firestore** (방 정보, 사용자 프로필)
- **Firebase Realtime Database** (실시간 위치 동기화)

### State Management
- **Zustand** (전역 상태 관리)
- **Zustand Persist** (로컬 저장)

### PWA
- **Service Worker** (오프라인 지원)
- **Web Manifest** (앱 설치)

---

## 🚀 빠른 시작

### 필수 요구사항

- Node.js 18.17 이상
- npm 또는 yarn
- Firebase 프로젝트

### 설치

```bash
# 저장소 클론
git clone https://github.com/YOUR_USERNAME/policenthief.git
cd policenthief

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 열어 Firebase 설정 값 입력

# 개발 서버 실행
npm run dev
```

브라우저에서 http://localhost:3000 접속

### Firebase 설정

Firebase 설정은 **[SETUP.md](./SETUP.md)**를 참고하세요.

---

## 📖 사용 방법

### 1. 방 만들기

1. 메인 화면에서 **닉네임 입력**
2. **"방 만들기"** 버튼 클릭
3. 게임 설정 조정:
   - 최대 인원
   - 경찰/도둑 비율
   - 숨는 시간
   - 게임 시간
   - 활동 반경
4. **"방 만들기"** 완료

### 2. 친구 초대

- **초대 링크 복사** 버튼 클릭
- 카카오톡, 문자 등으로 공유
- 친구들이 링크를 통해 자동 입장

### 3. 게임 시작

1. 방장이 **"게임 시작"** 버튼 클릭
2. **숨는 시간** 시작:
   - 경찰: 눈 감고 대기
   - 도둑: 빨리 도망!
3. **추격전** 시작:
   - 경찰: 도둑을 찾아 체포
   - 도둑: 살아남거나 동료 구출

### 4. 승리 조건

- **경찰 승리**: 제한 시간 내 모든 도둑 체포
- **도둑 승리**: 제한 시간까지 한 명이라도 생존

---

## 📂 프로젝트 구조

```
policenthief/
├── src/
│   ├── app/                    # Next.js 페이지
│   │   ├── page.tsx           # 메인 페이지 (방 검색/생성)
│   │   ├── create/            # 방 만들기
│   │   ├── join/[code]/       # 방 참여
│   │   ├── room/[code]/       # 대기실
│   │   ├── game/[code]/       # 게임 화면
│   │   ├── result/[code]/     # 결과 화면
│   │   └── profile/           # 프로필 & 기록
│   ├── components/            # 재사용 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── GameMap.tsx        # Leaflet 지도
│   │   ├── Timer.tsx
│   │   └── PlayerList.tsx
│   ├── hooks/                 # 커스텀 훅
│   │   └── useGeolocation.ts  # 위치 추적
│   ├── lib/                   # 라이브러리 & 유틸
│   │   ├── firebase.ts        # Firebase 초기화
│   │   ├── roomService.ts     # 방 CRUD
│   │   ├── roomUtils.ts       # 유틸리티 함수
│   │   └── realtimeService.ts # 실시간 동기화
│   ├── store/                 # Zustand 스토어
│   │   └── gameStore.ts
│   └── types/                 # TypeScript 타입
│       └── index.ts
├── public/
│   ├── icons/                 # PWA 아이콘
│   ├── manifest.json          # PWA 매니페스트
│   └── sw.js                  # Service Worker
├── scripts/
│   └── generate-icons.sh      # 아이콘 생성 스크립트
├── .env.example               # 환경 변수 템플릿
├── .env.local                 # 환경 변수 (Git 제외)
├── SETUP.md                   # Firebase 설정 가이드
├── DEPLOY.md                  # 배포 가이드
├── REVIEW.md                  # 코드 리뷰 결과
├── TODO.md                    # 남은 작업 목록
└── README.md                  # 이 문서
```

---

## 🎮 게임 룰

### 기본 룰

1. **팀 구성**: 참가자를 경찰과 도둑으로 나눔 (경찰은 소수)
2. **숨는 시간**: 게임 시작 전 도둑에게 숨을 시간 제공
3. **체포**: 경찰이 도둑에게 5m 이내 접근 시 자동 체포
4. **구출**: 살아있는 도둑이 감옥에 3m 접근 시 구출 가능
5. **경계**: 지정된 범위를 벗어나면 15초 후 자동 탈락

### 승리 조건

- **경찰 승리**: 제한 시간 내 모든 도둑 체포
- **도둑 승리**: 제한 시간까지 1명 이상 생존

### 특수 룰

- **다방구**: "다방구" 외치며 손 끊기로 구출 (선택)
- **원격 생성**: 하루 3회까지 멀리서 방 생성 가능

---

## 🔧 개발 가이드

### 빌드

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 실행
npm start
```

### 코드 품질

```bash
# ESLint 실행
npm run lint

# TypeScript 타입 체크
npx tsc --noEmit
```

### PWA 아이콘 생성

```bash
# ImageMagick 설치 (Mac)
brew install imagemagick

# 아이콘 생성 스크립트 실행
./scripts/generate-icons.sh
```

---

## 🚀 배포

### Vercel 배포 (권장)

자세한 배포 방법은 **[DEPLOY.md](./DEPLOY.md)**를 참고하세요.

```bash
# Vercel CLI 설치
npm install -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

### 환경 변수

배포 시 다음 환경 변수를 설정해야 합니다:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_DATABASE_URL
```

---

## 📊 프로젝트 상태

### 완성도

- ✅ 프로젝트 구조 (100%)
- ✅ UI/UX 디자인 (95%)
- ⚠️ 핵심 기능 (60%)
  - ✅ 방 생성/참여
  - ✅ 지도 표시
  - ⚠️ 실시간 위치 동기화 (구현 중)
  - ❌ 자동 체포/구출 (미완성)
  - ❌ 경계 이탈 탈락 (미완성)
- ⚠️ PWA 기능 (70%)
  - ✅ Manifest
  - ✅ Service Worker
  - ⚠️ 아이콘 (임시)

### 알려진 이슈

자세한 내용은 **[TODO.md](./TODO.md)** 참고

---

## 🤝 기여 방법

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

## 📞 문의

문제가 있거나 제안 사항이 있다면 [Issues](https://github.com/YOUR_USERNAME/policenthief/issues)에 등록해주세요.

---

## 🙏 감사의 말

- [Next.js](https://nextjs.org/)
- [Firebase](https://firebase.google.com/)
- [Leaflet](https://leafletjs.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://github.com/pmndrs/zustand)

---

**즐거운 게임 되세요!** 🎉

Made with ❤️ by Policenthief Team

# 🔥 Firebase 설정 가이드

## 1. Firebase 프로젝트 생성

1. **Firebase Console 접속**
   - https://console.firebase.google.com/
   - Google 계정으로 로그인

2. **새 프로젝트 생성**
   - "프로젝트 추가" 클릭
   - 프로젝트 이름 입력 (예: `policenthief`)
   - Google Analytics 사용 여부 선택 (선택사항)
   - "프로젝트 만들기" 클릭

## 2. Firebase 앱 등록

1. **웹 앱 추가**
   - 프로젝트 개요 페이지에서 `</>` (웹) 아이콘 클릭
   - 앱 닉네임 입력 (예: `Police n Thief Web`)
   - "Firebase Hosting도 설정" 체크 해제 (선택사항)
   - "앱 등록" 클릭

2. **Firebase SDK 구성 정보 복사**
   - 표시되는 `firebaseConfig` 객체 정보를 복사해둠
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc...",
     databaseURL: "https://your-project.firebaseio.com"
   };
   ```

## 3. Realtime Database 활성화

1. **데이터베이스 생성**
   - 좌측 메뉴 > "Realtime Database" 클릭
   - "데이터베이스 만들기" 클릭
   - 위치 선택 (아시아-태평양: `asia-southeast1` 권장)
   - 보안 규칙: **"테스트 모드에서 시작"** 선택 (나중에 변경 가능)
   - "사용 설정" 클릭

2. **데이터베이스 URL 확인**
   - 생성 후 표시되는 URL 복사 (예: `https://your-project-default-rtdb.asia-southeast1.firebasedatabase.app/`)

## 4. 보안 규칙 설정 (중요!)

1. **Realtime Database 규칙 탭** 이동
2. 아래 규칙으로 교체:

```json
{
  "rules": {
    "games": {
      "$roomCode": {
        ".read": "auth != null || true",
        ".write": "auth != null || true",
        "players": {
          "$playerId": {
            ".validate": "newData.hasChildren(['name', 'status'])"
          }
        }
      }
    }
  }
}
```

⚠️ **주의**: 위 규칙은 개발/테스트용입니다. 프로덕션에서는 더 엄격한 규칙 사용을 권장합니다.

**프로덕션 권장 규칙**:
```json
{
  "rules": {
    "games": {
      "$roomCode": {
        ".read": "data.child('players').child(auth.uid).exists()",
        ".write": "data.child('players').child(auth.uid).exists()",
        "players": {
          "$playerId": {
            ".write": "$playerId === auth.uid",
            ".validate": "newData.hasChildren(['name', 'status'])"
          }
        }
      }
    }
  }
}
```

## 5. Authentication 설정

1. **익명 로그인 활성화**
   - 좌측 메뉴 > "Authentication" 클릭
   - "시작하기" 클릭
   - "Sign-in method" 탭으로 이동
   - "익명" 제공업체 찾아서 클릭
   - "사용 설정" 토글 ON
   - "저장" 클릭

## 6. 환경 변수 설정

1. **프로젝트 루트의 `.env.local` 파일 열기**

2. **Firebase 설정 값 교체**:

```bash
# Firebase 설정 (위에서 복사한 값으로 교체)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc...
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.asia-southeast1.firebasedatabase.app
```

⚠️ **주의사항**:
- 모든 `demo-*` 값을 실제 값으로 교체해야 합니다
- `NEXT_PUBLIC_FIREBASE_DATABASE_URL`은 Realtime Database URL입니다 (Firestore URL이 아님!)
- `.env.local` 파일은 Git에 커밋하지 마세요 (`.gitignore`에 이미 추가됨)

## 7. 개발 서버 재시작

```bash
# 개발 서버 종료 (Ctrl+C)
# 다시 시작
npm run dev
```

환경 변수 변경 후 개발 서버를 재시작해야 적용됩니다!

## 8. 연결 테스트

1. **브라우저에서 앱 열기**: http://localhost:3000

2. **콘솔 확인**:
   - F12 (개발자 도구) 열기
   - Console 탭에서 에러 확인
   - Firebase 연결 에러가 없어야 정상

3. **실시간 동기화 테스트**:
   - 방 만들기 → 참가하기
   - 다른 브라우저/탭에서도 같은 방 참가
   - Firebase Console > Realtime Database에서 데이터 실시간 확인 가능

## 9. 배포 시 설정 (Vercel 예시)

1. **Vercel 대시보드**에서 프로젝트 선택
2. **Settings > Environment Variables** 이동
3. `.env.local`의 모든 변수를 하나씩 추가:
   - Key: `NEXT_PUBLIC_FIREBASE_API_KEY`
   - Value: `AIzaSy...`
   - Environment: `Production`, `Preview`, `Development` 모두 체크
4. "Save" 클릭
5. 모든 변수 추가 후 재배포

## 10. 문제 해결

### 🔴 "Firebase: Error (auth/operation-not-allowed)"
- Authentication > Sign-in method에서 "익명" 제공업체를 활성화하세요

### 🔴 "Permission denied"
- Realtime Database 보안 규칙을 확인하세요
- 테스트 모드에서는 `.read`와 `.write`가 모두 `true`여야 합니다

### 🔴 "Database URL이 없음"
- `.env.local`에 `NEXT_PUBLIC_FIREBASE_DATABASE_URL` 추가했는지 확인
- Realtime Database를 생성했는지 확인 (Firestore와 다름!)

### 🔴 "환경 변수가 적용 안됨"
- 개발 서버를 재시작하세요 (`npm run dev`)
- 환경 변수 이름이 `NEXT_PUBLIC_`으로 시작하는지 확인
- `.env.local` 파일이 프로젝트 루트에 있는지 확인

## 11. 무료 플랜 제한사항

Firebase Spark (무료) 플랜:
- ✅ Realtime Database: 1GB 저장소, 10GB/월 다운로드
- ✅ Authentication: 익명 사용자 무제한
- ✅ 동시 연결: 100명
- ⚠️ 실시간 게임에는 충분하지만, 대규모 사용자는 유료 플랜 필요

**예상 사용량** (플레이어 10명 기준):
- 위치 업데이트: 2초마다 → ~1.5MB/게임/시간
- 하루 10게임 → ~15MB/일
- 한 달 → ~450MB (무료 플랜 충분)

---

## ✅ 완료 체크리스트

- [ ] Firebase 프로젝트 생성
- [ ] 웹 앱 등록 및 SDK 정보 확인
- [ ] Realtime Database 생성
- [ ] 보안 규칙 설정
- [ ] 익명 Authentication 활성화
- [ ] `.env.local` 파일 업데이트
- [ ] 개발 서버 재시작
- [ ] 연결 테스트 (방 생성/참가)
- [ ] 실시간 동기화 확인 (여러 창에서 테스트)

---

설정 완료 후 바로 게임 플레이가 가능합니다! 🎮🔥

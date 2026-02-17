# Firebase 설정 가이드

Policenthief 프로젝트를 실행하기 위한 Firebase 설정 가이드입니다.

---

## 1️⃣ Firebase 프로젝트 생성

### 1.1 Firebase Console 접속
1. https://console.firebase.google.com/ 접속
2. Google 계정으로 로그인
3. **"프로젝트 추가"** 클릭

### 1.2 프로젝트 정보 입력
1. **프로젝트 이름**: `policenthief` (또는 원하는 이름)
2. **Google Analytics**: 선택 사항 (권장: 사용 안 함)
3. **프로젝트 만들기** 클릭
4. 약 30초 후 프로젝트 생성 완료

---

## 2️⃣ Firebase 서비스 활성화

### 2.1 Authentication (익명 로그인)

1. 좌측 메뉴 **"Build"** > **"Authentication"** 클릭
2. **"시작하기"** 버튼 클릭
3. **"Sign-in method"** 탭 선택
4. **"익명"** 클릭
5. **"사용 설정"** 토글 활성화
6. **"저장"** 클릭

> ℹ️ **익명 로그인을 사용하는 이유**:
> - 사용자 등록 없이 바로 게임 참여 가능
> - 각 플레이어에게 고유 ID 자동 부여
> - Firebase 보안 규칙 적용 가능

### 2.2 Firestore Database (방 정보 저장)

1. 좌측 메뉴 **"Firestore Database"** 클릭
2. **"데이터베이스 만들기"** 클릭
3. **위치 선택**: `asia-northeast3 (Seoul)` 권장
4. **보안 규칙**: **"테스트 모드로 시작"** 선택 (나중에 변경)
5. **"다음"** > **"사용 설정"** 클릭

### 2.3 Realtime Database (실시간 위치 공유)

1. 좌측 메뉴 **"Realtime Database"** 클릭
2. **"데이터베이스 만들기"** 클릭
3. **위치 선택**: `asia-southeast1 (Singapore)` 권장
   - ⚠️ 서울 리전 없음 - 싱가포르가 가장 가까움
4. **보안 규칙**: **"테스트 모드로 시작"** 선택
5. **"사용 설정"** 클릭

> ℹ️ **Firestore vs Realtime Database**:
> - **Firestore**: 방 정보, 설정, 플레이어 목록 (덜 자주 변경)
> - **Realtime Database**: 플레이어 위치, 게임 상태 (초 단위 업데이트)

---

## 3️⃣ Firebase 설정 값 가져오기

### 3.1 웹 앱 추가

1. Firebase 프로젝트 홈 화면으로 이동
2. **"</>"** (웹 앱 아이콘) 클릭
3. **앱 닉네임**: `policenthief-web` 입력
4. **Firebase Hosting 설정**: 체크 안 함 (Vercel 사용 예정)
5. **"앱 등록"** 클릭

### 3.2 설정 값 복사

다음과 같은 설정이 표시됩니다:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "policenthief-xxxxx.firebaseapp.com",
  projectId: "policenthief-xxxxx",
  storageBucket: "policenthief-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop",
  databaseURL: "https://policenthief-xxxxx-default-rtdb.asia-southeast1.firebasedatabase.app"
};
```

> ⚠️ **databaseURL이 없다면?**
> 
> 1. 좌측 메뉴 **"Realtime Database"** 클릭
> 2. 상단 URL 복사 (예: `https://프로젝트명.firebaseio.com`)
> 3. 이 URL을 `databaseURL`로 사용

---

## 4️⃣ 환경 변수 설정

### 4.1 `.env.local` 파일 생성

프로젝트 루트에 `.env.local` 파일을 만듭니다:

```bash
cd /Users/jm/Documents/policenthief
cp .env.example .env.local
```

### 4.2 설정 값 입력

`.env.local` 파일을 열고 Firebase 설정 값을 입력합니다:

```env
# Firebase 설정
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=policenthief-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=policenthief-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=policenthief-xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdefghijklmnop
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://policenthief-xxxxx-default-rtdb.asia-southeast1.firebasedatabase.app
```

> ⚠️ **주의사항**:
> - 모든 환경 변수는 `NEXT_PUBLIC_` 접두사가 있어야 클라이언트에서 접근 가능
> - `.env.local` 파일은 `.gitignore`에 포함되어 Git에 올라가지 않음
> - 실제 값으로 교체해야 함 (예시 값 그대로 사용 불가)

### 4.3 환경 변수 확인

```bash
# 개발 서버 재시작
npm run dev
```

개발 서버를 시작하고 브라우저 콘솔에서 확인:

```javascript
// 브라우저 개발자 도구 콘솔에서
console.log(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
// 올바른 프로젝트 ID가 출력되어야 함
```

---

## 5️⃣ Firebase 보안 규칙 설정

### 5.1 Firestore 보안 규칙

Firebase Console > **Firestore Database** > **규칙** 탭:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 방 정보
    match /rooms/{roomId} {
      // 누구나 방 목록 읽기 가능 (주변 게임 검색)
      allow read: if true;
      
      // 로그인한 사용자만 방 생성 가능
      allow create: if request.auth != null;
      
      // 방장만 방 정보 수정/삭제 가능
      allow update, delete: if request.auth.uid == resource.data.hostId;
    }
    
    // 사용자 프로필
    match /users/{userId} {
      // 자신의 프로필만 읽기/쓰기 가능
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

**"게시"** 버튼 클릭하여 적용

### 5.2 Realtime Database 보안 규칙

Firebase Console > **Realtime Database** > **규칙** 탭:

```json
{
  "rules": {
    "games": {
      "$roomCode": {
        // 누구나 게임 상태 읽기 가능
        ".read": true,
        
        "players": {
          "$playerId": {
            // 자신의 위치만 쓰기 가능
            ".write": "auth != null",
            
            // 위치 데이터 형식 검증
            ".validate": "newData.hasChildren(['latitude', 'longitude', 'timestamp'])",
            
            "latitude": {
              ".validate": "newData.isNumber() && newData.val() >= -90 && newData.val() <= 90"
            },
            "longitude": {
              ".validate": "newData.isNumber() && newData.val() >= -180 && newData.val() <= 180"
            },
            "timestamp": {
              ".validate": "newData.isNumber()"
            }
          }
        },
        
        "status": {
          // 게임 상태는 누구나 업데이트 가능 (간단한 규칙)
          ".write": true
        }
      }
    }
  }
}
```

**"게시"** 버튼 클릭하여 적용

> ⚠️ **보안 주의사항**:
> - 위 규칙은 기본적인 보안만 제공
> - 실제 운영 시 더 엄격한 규칙 필요
> - 방장 확인, 타임스탬프 검증 등 추가 권장

---

## 6️⃣ 할당량 및 제한

### 무료 플랜 (Spark) 한도

| 서비스 | 무료 한도 | 초과 시 |
|--------|-----------|---------|
| Firestore 읽기 | 50,000/일 | 차단 |
| Firestore 쓰기 | 20,000/일 | 차단 |
| Firestore 저장 | 1GB | 차단 |
| Realtime DB | 10GB 전송/월 | 차단 |
| Realtime DB 저장 | 1GB | 차단 |
| 동시 접속 | 100명 | 차단 |

### 예상 사용량 (게임 1회 기준)

**플레이어 10명, 게임 15분**:
- Firestore 읽기: ~50회 (방 정보, 플레이어 목록)
- Firestore 쓰기: ~20회 (방 생성, 상태 변경)
- Realtime DB 쓰기: ~900회 (위치 업데이트 2초마다 × 10명 × 15분)
- Realtime DB 데이터 전송: ~1MB

**일일 게임 횟수**:
- **Firestore**: 약 1,000게임/일까지 가능
- **Realtime DB**: 약 10,000게임/일까지 가능 (10GB / 1MB)

> ℹ️ **무료 플랜으로 충분한가?**
> - 테스트 및 소규모 운영: ✅ 충분
> - 일 100게임 이하: ✅ 안전
> - 동시 접속 100명 이하: ✅ 문제없음
> - 대규모 운영: ⚠️ Blaze 플랜 필요

### Blaze 플랜 (종량제)

업그레이드가 필요한 경우:
- Firestore: $0.06 / 100,000 읽기
- Realtime DB: $1 / GB (전송)
- 실제 사용량만큼만 과금

---

## 7️⃣ 테스트 및 검증

### 7.1 로컬 테스트

```bash
# 개발 서버 실행
npm run dev
```

브라우저에서 http://localhost:3000 접속 후:

1. **이름 입력** > **"방 만들기"** 클릭
2. 방 생성 확인 (Firebase Console > Firestore에서 확인)
3. 초대 링크 복사 > 시크릿 창에서 참여
4. 두 브라우저에서 플레이어 목록 동기화 확인

### 7.2 Firebase Console에서 확인

#### Firestore 데이터
```
rooms (컬렉션)
  └─ ABC123 (문서)
      ├─ code: "ABC123"
      ├─ name: "테스트 게임"
      ├─ status: "waiting"
      ├─ players: {...}
      └─ settings: {...}
```

#### Realtime Database 데이터
```
games
  └─ ABC123
      ├─ status: "playing"
      └─ players
          ├─ player_xxx
          │   ├─ latitude: 37.5665
          │   ├─ longitude: 126.9780
          │   └─ timestamp: 1707638400000
          └─ player_yyy
              └─ ...
```

### 7.3 문제 해결

#### "Permission denied" 오류
- **원인**: 보안 규칙이 너무 엄격하거나 익명 로그인 미활성화
- **해결**: Authentication > Sign-in method > 익명 활성화 확인

#### 위치가 공유되지 않음
- **원인**: Realtime Database URL 미설정
- **해결**: `.env.local`에 `NEXT_PUBLIC_FIREBASE_DATABASE_URL` 확인

#### "Quota exceeded" 오류
- **원인**: 무료 한도 초과
- **해결**: Firebase Console에서 사용량 확인 > 필요시 Blaze 플랜 업그레이드

---

## 8️⃣ 배포 시 추가 설정

### 8.1 도메인 화이트리스트

Firebase Console > **Authentication** > **Settings** > **Authorized domains**:

```
localhost (기본 포함)
yourapp.vercel.app
yourdomain.com (커스텀 도메인)
```

### 8.2 Vercel 환경 변수

Vercel 대시보드 > 프로젝트 > **Settings** > **Environment Variables**:

모든 `NEXT_PUBLIC_` 환경 변수를 동일하게 입력

> ⚠️ **주의**: Production, Preview, Development 모두 체크

---

## 9️⃣ 모니터링 및 유지보수

### 9.1 사용량 확인

Firebase Console > 프로젝트 홈 > **Usage and billing**:
- Firestore 읽기/쓰기 횟수
- Realtime Database 전송량
- 동시 접속자 수

### 9.2 로그 확인

Firebase Console > **Firestore** > **Usage** 탭:
- 오류 로그
- 느린 쿼리
- 병목 지점

### 9.3 백업 설정 (선택)

Blaze 플랜에서만 가능:
- Firestore 자동 백업
- Realtime Database 스냅샷

---

## 🎯 체크리스트

설정 완료 확인:

- [ ] Firebase 프로젝트 생성
- [ ] Authentication (익명) 활성화
- [ ] Firestore Database 생성
- [ ] Realtime Database 생성
- [ ] 웹 앱 등록
- [ ] `.env.local` 파일 생성 및 설정
- [ ] 보안 규칙 설정 (Firestore)
- [ ] 보안 규칙 설정 (Realtime Database)
- [ ] 로컬 테스트 성공
- [ ] 데이터 동기화 확인

모든 항목을 체크했다면 Firebase 설정 완료! 🎉

---

## 📚 참고 자료

- [Firebase 공식 문서](https://firebase.google.com/docs)
- [Firestore 시작하기](https://firebase.google.com/docs/firestore/quickstart)
- [Realtime Database 가이드](https://firebase.google.com/docs/database/web/start)
- [Firebase 보안 규칙](https://firebase.google.com/docs/rules)
- [Next.js + Firebase 통합](https://firebase.google.com/docs/web/setup#next.js)

---

## 💬 문제가 있나요?

1. Firebase Console에서 오류 로그 확인
2. 브라우저 개발자 도구 콘솔 확인
3. `.env.local` 파일 내용 재확인
4. 서버 재시작 (`npm run dev`)

그래도 해결되지 않으면 REVIEW.md의 "문제 해결" 섹션을 참고하세요.

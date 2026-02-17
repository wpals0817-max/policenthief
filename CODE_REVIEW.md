# 🚨 Police n Thief - 코드 리뷰 보고서

**검토일**: 2025-01-20  
**프로젝트**: GPS 기반 실시간 멀티플레이어 술래잡기 게임  
**Tech Stack**: Next.js 16, TypeScript, Firebase, Leaflet, Zustand, Tailwind CSS

---

## ✅ 완성된 기능

### 1. 🎨 UI/UX (100% 완성)
- ✅ 홈 화면 (방 만들기/검색)
- ✅ 방 생성 폼 (설정 옵션)
- ✅ 방 검색 및 참가
- ✅ 대기실 (플레이어 목록, 팀 배정)
- ✅ 게임 화면 (지도, 타이머, 플레이어 마커)
- ✅ 결과 화면 (승패, 통계)
- ✅ 반응형 모바일 디자인

### 2. 🏠 방 관리 (100% 완성)
- ✅ 방 생성 (`createRoom`)
- ✅ 방 참가 (`joinRoom`)
- ✅ 방 검색 (`searchRooms`)
- ✅ 코드 기반 빠른 참가
- ✅ 호스트 권한 관리
- ✅ 플레이어 추방 기능

### 3. 👥 팀 & 역할 관리 (100% 완성)
- ✅ 경찰/도둑 팀 자동 배정
- ✅ 호스트가 팀 변경 가능
- ✅ 플레이어 목록 실시간 표시
- ✅ 팀 밸런스 유지

### 4. 📍 위치 추적 (80% 완성)
- ✅ GPS 위치 가져오기 (`useGeolocation`)
- ✅ 거리 계산 (Haversine 공식)
- ✅ 지도에 플레이어 마커 표시
- ✅ 내 위치 자동 업데이트
- ⚠️ **Firebase에 위치 실시간 전송 누락**

### 5. ⏱️ 게임 로직 (60% 완성)
- ✅ 타이머 카운트다운
- ✅ 게임 상태 관리 (waiting/playing/finished)
- ✅ 게임 시작/종료 플로우
- ❌ **자동 잡기/구출 감지 없음**
- ❌ **실시간 플레이어 동기화 없음**

### 6. 💾 데이터 관리 (70% 완성)
- ✅ Zustand 상태 관리
- ✅ localStorage 폴백
- ✅ Firebase 기본 구조
- ⚠️ **Firebase 환경변수 설정 안됨 (데모 값 사용중)**
- ❌ **실시간 데이터베이스 구독 누락**

---

## ❌ 치명적 누락 기능 (프로덕션 필수)

### 🔴 Priority 1: 실시간 동기화
**파일**: `src/app/game/[code]/page.tsx`

```typescript
// ❌ 현재: subscribeToRoom 호출 안함
useEffect(() => {
  // TODO: 실시간 구독 필요!
}, [roomCode]);

// ✅ 필요한 코드:
useEffect(() => {
  if (!roomCode) return;
  
  const unsubscribe = subscribeToRoom(roomCode, (updatedRoom) => {
    setRoom(updatedRoom);
    // 플레이어 위치 업데이트
    // 게임 상태 동기화
  });
  
  return () => unsubscribe();
}, [roomCode]);
```

**영향**: 게임 중 다른 플레이어 움직임이 안보임 🚨

---

### 🔴 Priority 2: GPS 자동 감지
**파일**: `src/app/game/[code]/page.tsx`

```typescript
// ❌ 현재: 수동 버튼만 있음
<button onClick={handleCatch}>잡기</button>

// ✅ 필요한 로직:
useEffect(() => {
  if (!location || !room) return;
  
  const checkProximity = () => {
    room.players.forEach(player => {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        player.location.lat,
        player.location.lng
      );
      
      // 10m 이내 자동 감지
      if (distance < 0.01) { // 10m
        if (myRole === 'police' && player.role === 'thief') {
          handleCatch(player.id);
        }
        if (myRole === 'thief' && player.role === 'thief') {
          handleRescue(player.id);
        }
      }
    });
  };
  
  const interval = setInterval(checkProximity, 1000);
  return () => clearInterval(interval);
}, [location, room, myRole]);
```

**영향**: 수동으로만 잡기/구출 가능, 실제 GPS 게임 불가능 🚨

---

### 🔴 Priority 3: Firebase 실시간 위치 업데이트
**파일**: `src/lib/firebase.ts`

```typescript
// ❌ 현재: updateRoom으로 전체 방 업데이트 (비효율)

// ✅ 필요한 함수:
export async function updatePlayerLocation(
  roomCode: string,
  playerId: string,
  location: { lat: number; lng: number }
) {
  const db = getDatabase();
  await update(ref(db, `rooms/${roomCode}/players/${playerId}`), {
    location,
    lastUpdate: Date.now()
  });
}

// 게임 페이지에서 호출:
useEffect(() => {
  if (!location || !roomCode || !playerId) return;
  
  const interval = setInterval(() => {
    updatePlayerLocation(roomCode, playerId, {
      lat: location.latitude,
      lng: location.longitude
    });
  }, 2000); // 2초마다 위치 전송
  
  return () => clearInterval(interval);
}, [location, roomCode, playerId]);
```

**영향**: 다른 플레이어가 내 위치를 못봄 🚨

---

### 🟡 Priority 4: Firebase 환경 설정
**파일**: `.env.local` (생성 필요)

```bash
# ❌ 현재: firebase.ts에 데모 값 하드코딩됨

# ✅ 필요:
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

**영향**: 실제 서버에 배포 불가, 데이터 손실 위험 🚨

---

### 🟡 Priority 5: PWA 기능
**파일**: `public/sw.js` (생성 필요)

```javascript
// Service Worker for offline support
const CACHE_NAME = 'policenthief-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  // 필요한 assets
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

**파일**: `src/app/layout.tsx` (수정 필요)

```typescript
// Service Worker 등록
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
}, []);
```

**영향**: 오프라인 지원 없음, PWA 설치 불가 ⚠️

---

### 🟢 Priority 6: 에러 핸들링
**전역 에러 처리 부족**

```typescript
// ✅ 추가 필요:
// 1. 네트워크 에러 토스트
// 2. GPS 권한 거부 처리
// 3. Firebase 연결 실패 폴백
// 4. 게임 중 연결 끊김 복구
```

---

## 📊 완성도 평가

| 항목 | 완성도 | 상태 |
|------|--------|------|
| UI/UX | 100% | ✅ 완료 |
| 방 관리 | 100% | ✅ 완료 |
| 팀 관리 | 100% | ✅ 완료 |
| 위치 추적 | 80% | ⚠️ Firebase 연동 필요 |
| 게임 로직 | 60% | ❌ 자동 감지 구현 필요 |
| 실시간 동기화 | 30% | ❌ 구독 로직 누락 |
| 프로덕션 준비 | 40% | ❌ 환경 설정 필요 |

**전체 완성도**: **~70%**

---

## 🚀 프로덕션 체크리스트

### 필수 (Must Have)
- [ ] 실시간 플레이어 동기화 구현
- [ ] GPS 자동 잡기/구출 감지
- [ ] Firebase 위치 업데이트 (2초 간격)
- [ ] Firebase 환경변수 설정
- [ ] 네트워크 에러 핸들링

### 권장 (Should Have)
- [ ] Service Worker 및 PWA 기능
- [ ] 오프라인 지원 (캐시 전략)
- [ ] GPS 권한 안내 개선
- [ ] 게임 중 연결 끊김 복구

### 선택 (Nice to Have)
- [ ] 플레이어 이동 경로 기록
- [ ] 게임 히스토리/통계
- [ ] 친구 초대 링크
- [ ] 음향 효과 (잡기/구출 시)

---

## 💡 다음 단계

1. **즉시**: Firebase 실시간 구독 구현 (Priority 1)
2. **오늘**: GPS 자동 감지 로직 추가 (Priority 2)
3. **내일**: Firebase 환경 설정 및 배포 준비 (Priority 3-4)
4. **이번 주**: PWA 기능 및 최종 테스트 (Priority 5-6)

---

## 🔥 긴급 수정 필요 파일

1. `src/app/game/[code]/page.tsx` - 실시간 구독 + 자동 감지
2. `src/lib/firebase.ts` - 위치 업데이트 함수 추가
3. `.env.local` - Firebase 설정 (새로 생성)
4. `public/sw.js` - Service Worker (새로 생성)
5. `src/app/layout.tsx` - SW 등록 추가

---

**검토자**: j-mac 🤖  
**결론**: 기본 구조는 훌륭하지만, **실시간 동기화가 누락**되어 현재 상태로는 멀티플레이어 게임이 불가능합니다. Priority 1-3를 먼저 해결하면 MVP 출시 가능합니다.

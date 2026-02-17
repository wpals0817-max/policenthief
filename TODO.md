# TODO - 남은 작업 목록

**프로젝트**: Policenthief  
**최종 업데이트**: 2026-02-11

---

## 🔴 긴급 (Critical) - 게임 작동에 필수

### 1. Firebase Realtime Database 위치 동기화 구현
**예상 시간**: 3시간  
**우선순위**: 최고  
**상태**: ❌ 미완성

**작업 내용**:
- [ ] `src/lib/realtimeService.ts` 파일 생성
- [ ] 위치 업데이트 함수 구현 (`updatePlayerLocation`)
- [ ] 위치 구독 함수 구현 (`subscribeToPlayerLocations`)
- [ ] `src/app/game/[code]/page.tsx`에 통합
- [ ] 다중 플레이어 테스트

**참고 코드**:
```typescript
import { ref, set, onValue } from "firebase/database";
import { rtdb } from "./firebase";

export async function updatePlayerLocation(
  roomCode: string,
  playerId: string,
  location: Location
) {
  await set(ref(rtdb, `games/${roomCode}/players/${playerId}/location`), {
    latitude: location.latitude,
    longitude: location.longitude,
    timestamp: location.timestamp,
  });
}

export function subscribeToPlayerLocations(
  roomCode: string,
  callback: (locations: Record<string, Location>) => void
) {
  const locationsRef = ref(rtdb, `games/${roomCode}/players`);
  return onValue(locationsRef, (snapshot) => {
    const data = snapshot.val() || {};
    const locations: Record<string, Location> = {};
    
    Object.entries(data).forEach(([playerId, playerData]: [string, any]) => {
      if (playerData.location) {
        locations[playerId] = playerData.location;
      }
    });
    
    callback(locations);
  });
}
```

---

### 2. 거리 기반 자동 체포 시스템
**예상 시간**: 2시간  
**우선순위**: 최고  
**상태**: ❌ 미완성

**작업 내용**:
- [ ] 상수 정의 (`CATCH_DISTANCE = 5` 미터)
- [ ] 거리 체크 루프 추가 (2초마다)
- [ ] 경찰-도둑 간 거리 계산
- [ ] 자동 체포 로직 구현
- [ ] 알림 및 UI 업데이트
- [ ] Firebase 동기화

**참고 코드**:
```typescript
const CATCH_DISTANCE = 5; // 5미터 이내 체포

useEffect(() => {
  if (gameStatus !== 'playing' || !currentPlayer) return;
  
  const interval = setInterval(() => {
    checkAutoCatch();
  }, 2000);
  
  return () => clearInterval(interval);
}, [gameStatus, currentPlayer, players]);

function checkAutoCatch() {
  if (currentPlayer.team !== 'police' || currentPlayer.status !== 'alive') return;
  
  const myLocation = location;
  if (!myLocation) return;
  
  Object.values(players).forEach((thief) => {
    if (thief.team !== 'thief' || thief.status !== 'alive') return;
    if (!thief.location) return;
    
    const distance = calculateDistance(
      myLocation.latitude,
      myLocation.longitude,
      thief.location.latitude,
      thief.location.longitude
    );
    
    if (distance <= CATCH_DISTANCE) {
      handleCatch(thief);
    }
  });
}
```

---

### 3. 거리 기반 자동 구출 시스템
**예상 시간**: 1.5시간  
**우선순위**: 최고  
**상태**: ❌ 미완성

**작업 내용**:
- [ ] 상수 정의 (`RESCUE_DISTANCE = 3` 미터)
- [ ] 감옥 위치 필수 설정
- [ ] 도둑-감옥 간 거리 계산
- [ ] 자동 구출 로직 구현
- [ ] "다방구" 모드 처리

**참고 코드**:
```typescript
const RESCUE_DISTANCE = 3;

function checkAutoRescue() {
  if (currentPlayer.team !== 'thief' || currentPlayer.status !== 'alive') return;
  if (!currentRoom.settings.rescueEnabled) return;
  if (!currentRoom.settings.jailLocation) return;
  
  const myLocation = location;
  if (!myLocation) return;
  
  const distanceToJail = calculateDistance(
    myLocation.latitude,
    myLocation.longitude,
    currentRoom.settings.jailLocation.latitude,
    currentRoom.settings.jailLocation.longitude
  );
  
  if (distanceToJail <= RESCUE_DISTANCE) {
    // 감옥에 있는 도둑 찾기
    const caughtThieves = Object.values(players).filter(
      (p) => p.team === 'thief' && p.status === 'caught'
    );
    
    if (caughtThieves.length > 0) {
      if (currentRoom.settings.rescueMethod === 'dabanggu') {
        // 다방구 UI 표시
        showDabangguPrompt(caughtThieves);
      } else {
        // 자동 구출
        caughtThieves.forEach((thief) => handleRescue(thief));
      }
    }
  }
}
```

---

### 4. 경계 이탈 자동 탈락 완성
**예상 시간**: 1시간  
**우선순위**: 높음  
**상태**: ⚠️ 부분 구현 (경고만 있음)

**작업 내용**:
- [ ] 경계 밖 시간 추적 상태 추가
- [ ] 15초 초과 시 자동 탈락
- [ ] 플레이어 상태 `disconnected`로 변경
- [ ] 탈락 알림 전체 플레이어에게 전송
- [ ] Firebase 동기화

**참고 코드**:
```typescript
const [outOfBoundsDuration, setOutOfBoundsDuration] = useState(0);
const OUT_OF_BOUNDS_LIMIT = 15; // 15초

useEffect(() => {
  if (gameStatus !== 'playing') return;
  
  const interval = setInterval(() => {
    if (!currentRoom.centerLocation || !location) return;
    
    const withinBoundary = isWithinBoundary(
      location,
      currentRoom.centerLocation,
      currentRoom.settings.boundaryRadius + currentRoom.settings.autoEliminationDistance
    );
    
    if (!withinBoundary) {
      setOutOfBoundsDuration((prev) => {
        const newDuration = prev + 1;
        
        if (newDuration >= OUT_OF_BOUNDS_LIMIT) {
          handleElimination();
          return 0;
        }
        
        return newDuration;
      });
      setOutOfBoundsWarning(true);
    } else {
      setOutOfBoundsDuration(0);
      setOutOfBoundsWarning(false);
    }
  }, 1000);
  
  return () => clearInterval(interval);
}, [gameStatus, location, currentRoom]);

function handleElimination() {
  if (!currentPlayer) return;
  
  const updatedPlayer = {
    ...currentPlayer,
    status: 'disconnected' as const,
  };
  
  updatePlayerStatus(currentRoom.code, currentPlayer.id, 'disconnected');
  addNotification('경계를 벗어나 탈락했습니다!');
}
```

---

### 5. PWA 아이콘 생성
**예상 시간**: 30분  
**우선순위**: 높음  
**상태**: ❌ 미완성

**작업 내용**:
- [ ] 192x192 PNG 아이콘 생성
- [ ] 512x512 PNG 아이콘 생성
- [ ] `public/icons/` 폴더에 배치
- [ ] manifest.json 경로 확인
- [ ] 배포 후 PWA 설치 테스트

**명령어**:
```bash
# ImageMagick 설치
brew install imagemagick

# SVG → PNG 변환
convert -background none -size 192x192 public/icons/icon.svg public/icons/icon-192.png
convert -background none -size 512x512 public/icons/icon.svg public/icons/icon-512.png

# 또는 온라인 도구 사용
# https://realfavicongenerator.net/
```

---

## 🟡 중요 (Important) - 배포 전 필수

### 6. Service Worker 설정
**예상 시간**: 1.5시간  
**우선순위**: 중간  
**상태**: ❌ 미완성

**작업 내용**:
- [ ] `public/sw.js` 파일 생성
- [ ] 캐싱 전략 구현
- [ ] `src/app/layout.tsx`에 등록 코드 추가
- [ ] 오프라인 페이지 생성
- [ ] 배포 후 테스트

---

### 7. 에러 처리 강화
**예상 시간**: 2시간  
**우선순위**: 중간  
**상태**: ⚠️ 부분 구현

**작업 내용**:
- [ ] 전역 에러 바운더리 추가
- [ ] Firebase 오류별 사용자 메시지
- [ ] 네트워크 오류 감지 및 재시도
- [ ] 위치 권한 거부 시 안내 UI
- [ ] Sentry 또는 에러 로깅 통합 (선택)

**참고 코드**:
```typescript
// src/components/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">오류가 발생했습니다</h1>
            <p className="text-gray-400 mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl"
            >
              다시 시도
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

### 8. Firebase 보안 규칙 작성
**예상 시간**: 1시간  
**우선순위**: 중간  
**상태**: ❌ 미완성

**작업 내용**:
- [ ] Firestore 보안 규칙 작성
- [ ] Realtime Database 보안 규칙 작성
- [ ] Firebase Console에 적용
- [ ] 권한 테스트

**파일 위치**: SETUP.md에 예시 코드 있음

---

### 9. .env.local 설정 및 문서화
**예상 시간**: 15분  
**우선순위**: 중간  
**상태**: ⚠️ .env.example만 있음

**작업 내용**:
- [ ] 로컬 `.env.local` 파일 생성
- [ ] Firebase 설정 값 입력
- [ ] README.md에 설정 안내 추가
- [ ] 팀원에게 설정 방법 공유

---

## 🟢 권장 (Recommended) - 사용자 경험 개선

### 10. 플레이어 연결 상태 모니터링
**예상 시간**: 2시간  
**우선순위**: 중간  
**상태**: ❌ 미완성

**작업 내용**:
- [ ] Realtime Database `onDisconnect()` 사용
- [ ] 플레이어 `lastSeen` 타임스탬프 추적
- [ ] 30초 이상 업데이트 없으면 `disconnected` 표시
- [ ] 재접속 시 복구

---

### 11. 게임 기록 자동 저장
**예상 시간**: 1.5시간  
**우선순위**: 낮음  
**상태**: ⚠️ profileStore만 있음

**작업 내용**:
- [ ] 게임 종료 시 자동 저장
- [ ] `GameRecord` 생성 및 저장
- [ ] Firestore에 업로드 (선택)
- [ ] 프로필 페이지에 기록 표시

---

### 12. 알림 시스템 개선
**예상 시간**: 1시간  
**우선순위**: 낮음  
**상태**: ⚠️ 기본 구현만

**작업 내용**:
- [ ] 알림 중복 방지
- [ ] 우선순위별 스타일링
- [ ] 자동 사라짐 시간 조절
- [ ] 소리/진동 옵션

---

### 13. 위치 권한 재요청 UI
**예상 시간**: 1시간  
**우선순위**: 낮음  
**상태**: ❌ 미완성

**작업 내용**:
- [ ] 권한 거부 감지
- [ ] iOS/Android 설정 안내
- [ ] 단계별 가이드 모달
- [ ] 재요청 버튼

---

## 🔵 선택 (Optional) - 부가 기능

### 14. 음향 효과
**예상 시간**: 2시간  
**우선순위**: 낮음  
**상태**: ❌ 미완성

**작업 내용**:
- [ ] 사운드 파일 준비 (체포, 구출, 알림)
- [ ] `howler.js` 또는 Web Audio API
- [ ] 설정에서 음소거 옵션
- [ ] 배경음악 (선택)

---

### 15. 진동 피드백
**예상 시간**: 30분  
**우선순위**: 낮음  
**상태**: ❌ 미완성

**작업 내용**:
- [ ] Vibration API 사용
- [ ] 체포 시 짧은 진동
- [ ] 구출 시 긴 진동
- [ ] 경고 시 패턴 진동

**참고 코드**:
```typescript
// 체포 시
navigator.vibrate([100, 50, 100]);

// 구출 시
navigator.vibrate(200);

// 경고 시
navigator.vibrate([50, 50, 50, 50, 50]);
```

---

### 16. 튜토리얼/온보딩
**예상 시간**: 3시간  
**우선순위**: 낮음  
**상태**: ❌ 미완성

**작업 내용**:
- [ ] 첫 방문자 감지
- [ ] 단계별 가이드 모달
- [ ] 인터랙티브 튜토리얼
- [ ] 스킵 옵션

---

### 17. 다크/라이트 모드 토글
**예상 시간**: 1시간  
**우선순위**: 낮음  
**상태**: ⚠️ 다크 모드만

**작업 내용**:
- [ ] 테마 토글 컴포넌트
- [ ] 로컬 저장소에 설정 저장
- [ ] CSS 변수로 색상 관리
- [ ] 시스템 설정 자동 감지

---

### 18. 리더보드
**예상 시간**: 4시간  
**우선순위**: 낮음  
**상태**: ❌ 미완성

**작업 내용**:
- [ ] 전체 사용자 통계 수집
- [ ] Firestore 쿼리 최적화
- [ ] 순위 페이지 UI
- [ ] 필터링 (주간/월간/전체)

---

## 🐛 알려진 버그

### 버그 1: 지도 마커 중복 생성
**심각도**: 중간  
**재현 방법**: 플레이어 위치 빠르게 변경 시  
**해결 방법**: `GameMap.tsx`에서 기존 마커 업데이트로 변경  
**상태**: ⚠️ 수정 필요

### 버그 2: 방 나가기 시 데이터 미정리
**심각도**: 낮음  
**재현 방법**: 방 나가기 후 다시 들어가면 이전 데이터 남음  
**해결 방법**: `reset()` 함수 호출 추가  
**상태**: ⚠️ 수정 필요

### 버그 3: 게임 시간 종료 후 알림 중복
**심각도**: 낮음  
**재현 방법**: 타이머 종료 시  
**해결 방법**: 알림 중복 방지 로직 추가  
**상태**: ⚠️ 수정 필요

---

## 📝 코드 품질 개선

### 리팩토링
- [ ] Magic Number 상수화
- [ ] 중복 함수 제거 (`formatDistance` 통합)
- [ ] 긴 함수 분리 (100줄 이상)
- [ ] `useCallback` / `useMemo` 최적화

### 테스트
- [ ] Jest 설정
- [ ] 유틸리티 함수 단위 테스트
- [ ] 컴포넌트 테스트 (React Testing Library)
- [ ] E2E 테스트 (Playwright, 선택)

### 문서화
- [ ] JSDoc 주석 추가
- [ ] README.md 완성
- [ ] API 문서 (주요 함수)
- [ ] 아키텍처 다이어그램

---

## 📅 작업 일정 제안

### Week 1: 핵심 기능 완성
- [ ] Day 1-2: Firebase Realtime Database 통합
- [ ] Day 3: 자동 체포/구출
- [ ] Day 4: 경계 이탈 탈락
- [ ] Day 5: 통합 테스트

### Week 2: PWA 및 배포
- [ ] Day 1: PWA 아이콘 및 Service Worker
- [ ] Day 2: 에러 처리 강화
- [ ] Day 3: Firebase 보안 규칙
- [ ] Day 4: Vercel 배포
- [ ] Day 5: 버그 수정

### Week 3: 개선 및 최적화
- [ ] 선택 기능 구현
- [ ] 성능 최적화
- [ ] 사용자 피드백 반영
- [ ] 테스트 및 문서화

---

## 🎯 완료 기준

각 작업 완료 시 다음을 확인:

- [ ] 기능 정상 작동
- [ ] 다중 플레이어 테스트 완료
- [ ] 오류 처리 구현
- [ ] Firebase 동기화 확인
- [ ] 코드 리뷰 완료
- [ ] 문서 업데이트

---

## 📊 진행 상황

**전체 진행률**: 60% (기본 구조 완성)

| 카테고리 | 완료 | 진행 중 | 미완성 | 진행률 |
|---------|------|---------|--------|--------|
| 긴급 | 0 | 1 | 4 | 20% |
| 중요 | 0 | 2 | 2 | 50% |
| 권장 | 0 | 1 | 3 | 25% |
| 선택 | 0 | 0 | 5 | 0% |

**총 작업 수**: 18개  
**완료**: 0개  
**진행 중**: 4개  
**미완성**: 14개

---

## 💡 다음 단계

**즉시 시작해야 할 작업**:
1. Firebase Realtime Database 위치 동기화
2. 자동 체포/구출 시스템
3. PWA 아이콘 생성

**이 3가지만 완성되면 실제 게임 플레이 가능!**

작업 중 질문이나 문제가 있으면 REVIEW.md를 참고하세요.

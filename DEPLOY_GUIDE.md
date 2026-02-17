# 🚀 경도 v1.0 배포 가이드

**작성일**: 2026-02-17  
**목표**: 내일 아침 즉시 출시!

---

## 📋 준비 사항 체크리스트

### ✅ 완료된 것
- [x] 앱 98% 완성
- [x] 모든 기능 작동 확인
- [x] PWA 지원 (Service Worker)
- [x] 쿠팡 파트너스 배너 추가 (메인, 대기실, 결과)

### ⏳ 내일 아침에 할 것
- [ ] Firebase 프로젝트 생성
- [ ] Realtime Database 활성화
- [ ] 환경변수 설정
- [ ] Vercel 배포
- [ ] 테스트
- [ ] 출시! 🎉

---

## 🔥 1단계: Firebase 설정 (제민님 작업, 20분)

### Firebase 프로젝트 생성

1. **Firebase 콘솔 접속**
   - https://console.firebase.google.com
   - Google 계정 로그인

2. **프로젝트 추가**
   - "프로젝트 추가" 버튼 클릭
   - 프로젝트 이름: `policenthief` (또는 원하는 이름)
   - Google 애널리틱스: **사용 안 함** (나중에 추가 가능)
   - "프로젝트 만들기" 클릭
   - 생성 완료까지 약 1분 대기

3. **웹 앱 추가**
   - 프로젝트 생성 후 "웹 앱 추가" (</>아이콘) 클릭
   - 앱 닉네임: `policenthief-web`
   - Firebase 호스팅: **체크 안 함**
   - "앱 등록" 클릭

4. **설정값 복사**
   - 아래와 같은 설정값이 표시됨:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "policenthief-xxxxx.firebaseapp.com",
     projectId: "policenthief-xxxxx",
     storageBucket: "policenthief-xxxxx.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:..."
   };
   ```
   - **이 전체를 복사해서 저장!** (메모장에 붙여넣기)

### Realtime Database 활성화

1. **Database 생성**
   - 왼쪽 메뉴: "빌드" → "Realtime Database"
   - "데이터베이스 만들기" 클릭

2. **위치 선택**
   - 위치: `asia-southeast1` (싱가포르 - 한국과 가장 가까움)
   - "다음" 클릭

3. **보안 규칙**
   - **"테스트 모드에서 시작"** 선택
   - 주의: 30일 후 자동으로 보안 규칙 활성화됨
   - (나중에 제대로 된 보안 규칙 적용 예정)
   - "사용 설정" 클릭

4. **Database URL 복사**
   - Database가 생성되면 상단에 URL 표시
   - 예: `https://policenthief-xxxxx-default-rtdb.asia-southeast1.firebasedatabase.app`
   - **이것도 복사해서 저장!**

### 저한테 보내주실 정보

텔레그램으로 아래 형식으로 보내주세요:

```
Firebase Config:
{
  "apiKey": "AIza...",
  "authDomain": "policenthief-xxxxx.firebaseapp.com",
  "projectId": "policenthief-xxxxx",
  "storageBucket": "policenthief-xxxxx.appspot.com",
  "messagingSenderId": "123456789",
  "appId": "1:123456789:web:..."
}

Database URL:
https://policenthief-xxxxx-default-rtdb.asia-southeast1.firebasedatabase.app
```

---

## 🤖 2단계: 환경변수 설정 (j-mac 작업, 5분)

제민님이 Firebase 설정값을 보내주시면:

1. `.env.local` 파일 수정
2. 제민님의 Firebase 설정으로 교체
3. Git commit

---

## 🚀 3단계: Vercel 배포 (j-mac 작업, 10분)

### Vercel 배포

1. **GitHub에 Push**
   - 모든 변경사항 commit & push

2. **Vercel 배포**
   - Vercel 계정 연결
   - Repository 연결
   - 환경변수 설정 (Firebase 설정)
   - 자동 배포 시작

3. **배포 완료**
   - 약 3-5분 소요
   - 배포 URL 생성: `https://policenthief.vercel.app`

---

## ✅ 4단계: 테스트 (j-mac 작업, 10분)

### 기능 테스트

1. **방 만들기**
   - ✅ 방 생성 확인
   - ✅ 설정 저장 확인

2. **방 참여**
   - ✅ 코드로 참여
   - ✅ 링크로 참여
   - ✅ 실시간 동기화

3. **게임 플레이**
   - ✅ 위치 추적
   - ✅ 팀 배정
   - ✅ 검거/구출
   - ✅ 게임 종료

4. **PWA**
   - ✅ "홈 화면에 추가" 가능
   - ✅ 오프라인 동작

5. **쿠팡 배너**
   - ✅ 메인 화면 표시
   - ✅ 대기실 표시
   - ✅ 결과 화면 표시

---

## 🎉 5단계: 출시!

### 배포 URL

**메인 URL**: https://policenthief.vercel.app

### 공유 방법

1. **링크 공유**
   - 카카오톡, 텔레그램, 페이스북 등
   - "경도 게임 하자! [링크]"

2. **QR 코드 생성**
   - https://www.qr-code-generator.com
   - URL 입력 → QR 생성
   - 포스터나 전단지에 사용

3. **SNS 홍보**
   - 인스타그램 스토리
   - 페이스북 그룹
   - 커뮤니티 사이트

### 초기 사용자 모집

1. **친구들에게**
   - 직접 테스트 요청
   - 피드백 수집

2. **커뮤니티**
   - 에브리타임 (학교)
   - 지역 커뮤니티
   - 동호회 카페

---

## 🔧 다음 단계 (v2.0 개발)

### 이번 주 (2월 17-21일)

**개발 항목**:
- 무료 제한 (12명, 10-20분, 3라운드)
- 프리미엄 안내 페이지
- 실제 쿠팡 배너 코드 적용

**배포**: 금요일 (2월 21일)

### 다음 주 (2월 24-28일)

**개발 항목**:
- 토스페이먼츠 결제 연동
- 프리미엄 구매 기능
- 방장 프리미엄 전파 로직

**배포**: 2월 28일

---

## 📞 쿠팡 파트너스 설정 (나중에)

### 가입 방법

1. **파트너스 가입**
   - https://partners.coupang.com
   - 회원가입
   - 신청서 작성 (1-2일 승인 대기)

2. **배너 생성**
   - 로그인 후 "링크 생성" 메뉴
   - "배너" 선택
   - 크기: 320x50 (모바일) 또는 728x90 (PC)
   - 카테고리: 전체 상품 또는 인기 상품

3. **코드 복사**
   - 생성된 HTML/JavaScript 코드 복사
   - j-mac에게 전달
   - `CoupangBanner.tsx` 파일에 적용

### 수익 확인

- 쿠팡 파트너스 대시보드에서 확인
- 클릭당 수수료 발생
- 월 1회 정산

---

## 🐛 트러블슈팅

### Firebase 연결 안 됨

**증상**: 방이 생성되지 않거나 동기화 안 됨

**해결**:
1. Firebase 콘솔에서 Database 활성화 확인
2. 보안 규칙이 "테스트 모드"인지 확인
3. Database URL이 정확한지 확인

### 위치 권한 거부

**증상**: "위치 권한을 허용해주세요" 메시지

**해결**:
1. 브라우저 설정에서 위치 권한 허용
2. HTTPS 필수 (Vercel은 자동 HTTPS)
3. 모바일: 설정 > 앱 > 브라우저 > 권한

### PWA 설치 안 됨

**증상**: "홈 화면에 추가" 옵션 없음

**해결**:
1. HTTPS 필수 (Vercel은 자동)
2. Service Worker 등록 확인
3. manifest.json 확인
4. iOS Safari: 공유 버튼 → "홈 화면에 추가"

---

## 📊 모니터링

### Vercel 대시보드

- 배포 상태 확인
- 에러 로그 확인
- 트래픽 확인

### Firebase 콘솔

- Realtime Database 사용량
- 동시 접속자 수
- 데이터 읽기/쓰기 횟수

---

## 🎯 출시 목표

- **배포 URL**: 생성 완료
- **테스트**: 2명 이상 동시 플레이 확인
- **SNS 공유**: 첫 게시물 업로드
- **초기 사용자**: 10명 이상 테스트

---

**작성자**: j-mac 🤖  
**최종 업데이트**: 2026-02-17 00:31

내일 아침에 Firebase만 만들면 바로 출시 가능합니다! 🚀

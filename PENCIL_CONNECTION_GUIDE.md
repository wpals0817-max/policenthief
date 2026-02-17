# 🔌 Pencil - Claude Code 연결 가이드

**날짜**: 2026-02-15 10:27  
**문제**: Pencil 앱이 Claude Code 연결 끊김

---

## 🔍 현재 상태

- ✅ Pencil 앱 실행 중
- ⚠️ MCP 서버 중복 실행 (여러 개)
- 🔄 Pencil 재시작 완료

---

## ✅ Pencil 앱에서 연결 확인하기

### 1. Pencil 앱 열기 (이미 열림)

### 2. Claude Code 연결 상태 확인
- **메뉴**: View > MCP Status (또는 Help > MCP Status)
- **또는**: 우측 하단 상태 바에 연결 표시 확인
- **정상**: 🟢 Connected to Claude Code
- **문제**: 🔴 Disconnected

### 3. 연결이 끊겼다면
- **File > Preferences > Claude Code**
- 또는 **Settings > Extensions > Claude Code**
- "Reconnect" 버튼 클릭

---

## 🔧 해결 방법

### 방법 1: Pencil 내부에서 재연결
1. Pencil 앱 열기
2. 우측 하단 또는 메뉴에서 "MCP Status" 찾기
3. "Reconnect to Claude Code" 클릭

### 방법 2: 완전 재시작 (이미 완료)
```bash
# Pencil 종료
killall Pencil

# 2초 대기
sleep 2

# Pencil 재시작
open /Applications/Pencil.app
```

### 방법 3: MCP 서버 수동 재시작
```bash
# 모든 MCP 서버 프로세스 종료
pkill -f "mcp-server-darwin"

# Pencil 재시작
killall Pencil
open /Applications/Pencil.app
```

### 방법 4: OpenClaw Gateway 재시작
```bash
# OpenClaw Gateway 상태 확인
openclaw status

# 재시작 (연결 문제 시)
openclaw gateway restart
```

---

## 🔍 연결 확인 체크리스트

### Pencil 앱 내부
- [ ] Pencil 앱이 열려 있음
- [ ] MCP 상태 표시가 보임
- [ ] 🟢 Connected 상태
- [ ] Claude Code 기능 사용 가능 (예: AI 도움말)

### 터미널에서 확인
```bash
# Pencil 프로세스 확인
ps aux | grep Pencil | grep -v grep

# MCP 서버 확인
ps aux | grep mcp-server | grep -v grep

# 포트 확인 (51423)
lsof -i :51423
```

---

## ❓ 만약 여전히 안 된다면

### 디버깅 정보 수집
```bash
# Pencil 로그 확인
tail -f ~/Library/Application\ Support/Pencil/logs/*.log

# OpenClaw 로그 확인
tail -f ~/.openclaw/logs/gateway.log
```

### Pencil 앱 설정 확인
1. **Pencil > Preferences**
2. **Extensions** 탭
3. **Claude Code** 찾기
4. 상태 확인:
   - Enabled: ✅
   - Version: 확인
   - MCP Port: 51423 (기본값)

---

## 🆘 문제가 계속되면

### 옵션 A: Pencil 완전 재설치
```bash
# Pencil 앱 제거
rm -rf /Applications/Pencil.app

# 설정 제거
rm -rf ~/Library/Application\ Support/Pencil

# Pencil 재설치
# Pencil 웹사이트에서 다운로드
```

### 옵션 B: 대안 도구 사용
1. **Figma** (웹 기반)
   - https://figma.com
   - 브라우저에서 바로 사용
   - Claude Code 연결 불필요

2. **Excalidraw** (간단한 와이어프레임)
   - https://excalidraw.com
   - 무료, 설치 불필요

3. **Sketch** (macOS 전용)
   - 유료, 하지만 안정적

---

## 💡 빠른 해결책

**Pencil 대신 간단한 방법으로 디자인하기**:

### 1. PowerPoint/Keynote 사용
- 슬라이드 크기: 375 x 812 (iPhone 크기)
- 도형 도구로 UI 그리기
- 스크린샷으로 저장

### 2. 온라인 도구 사용
- **Figma** (무료): https://figma.com
- **Canva** (무료): https://canva.com
- **Miro** (무료): https://miro.com

### 3. 손그림 + 사진
- 종이에 스케치
- iPhone으로 사진 촬영
- 간단하지만 효과적!

---

## 🎯 현재 권장 조치

### 즉시 (지금)
1. ✅ Pencil 재시작 완료
2. 🔲 Pencil 앱 열어서 연결 상태 확인
3. 🔲 MCP Status 메뉴 찾기
4. 🔲 Reconnect 시도

### 연결 안 되면 (플랜 B)
1. **Figma 사용** (가장 추천)
   - 브라우저에서 즉시 시작
   - Claude Code 불필요
   - 무료

2. **손그림 스케치**
   - 빠르고 간단
   - 개발자가 이해하기 쉬움

---

**작성자**: j-mac 🤖  
**목적**: Pencil-Claude Code 연결 문제 해결

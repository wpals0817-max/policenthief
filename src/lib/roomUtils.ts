// 방 관련 유틸리티 함수들

import type { Room, Player, GameSettings, Location, RoomVisibility, ROOM_LIMITS } from "@/types";

// 6자리 방 코드 생성
export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 혼동하기 쉬운 문자 제외
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// 방 ID 생성
export function generateRoomId(): string {
  return `room_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// 플레이어 ID 생성
export function generatePlayerId(): string {
  return `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// 기본 게임 설정
export const defaultSettings: GameSettings = {
  maxPlayers: 10,      // 기본 10명 (소규모 모임 기준)
  policeCount: 2,      // 기본 경찰 2명 (10명 기준 약 1/5)
  hidingTime: 60,      // 숨는 시간 60초
  gameTime: 15,        // 게임 시간 15분
  boundaryRadius: 300, // 활동 반경 300m (학교 운동장~공원 크기)
  autoEliminationDistance: 100, // 경계 밖 100m 고정
  autoEliminationEnabled: true,  // 자동 탈락 활성화 여부
  rescueEnabled: true,
  rescueMethod: "touch", // 터치 구출 고정
};

// 설정 제한값
export const settingsLimits = {
  maxPlayers: { min: 4, max: 30 },      // 4~30명
  policeCount: { min: 1, max: 15 },     // 1~15명 (maxPlayers의 절반으로 제한)
  hidingTime: { min: 10, max: 120 },    // 10초~2분
  gameTime: { min: 5, max: 60 },        // 5~60분
  boundaryRadius: { min: 100, max: 1000 }, // 100m~1km
  autoEliminationDistance: 100,         // 100m 고정
};

// 새 방 생성
export function createRoom(
  hostId: string,
  hostName: string,
  roomName: string,
  location: Location,
  options?: {
    password?: string;
    visibility?: RoomVisibility;
    settings?: Partial<GameSettings>;
  }
): Room {
  const now = Date.now();
  const { password, visibility = "public", settings } = options || {};

  const hostPlayer: Player = {
    id: hostId,
    name: hostName,
    status: "alive",
    isHost: true,
    joinedAt: now,
  };

  return {
    id: generateRoomId(),
    code: generateRoomCode(),
    name: roomName,
    hostId,
    hostName,
    password,
    visibility,
    status: "waiting",
    settings: { ...defaultSettings, ...settings },
    players: { [hostId]: hostPlayer },
    location, // 방 생성 위치
    createdAt: now,
    expiresAt: now + 2 * 60 * 60 * 1000, // 2시간 후 만료
  };
}

// 방에 플레이어 추가
export function addPlayerToRoom(
  room: Room,
  playerId: string,
  playerName: string
): Room {
  const newPlayer: Player = {
    id: playerId,
    name: playerName,
    status: "alive",
    isHost: false,
    joinedAt: Date.now(),
  };

  return {
    ...room,
    players: {
      ...room.players,
      [playerId]: newPlayer,
    },
  };
}

// 팀 자동 배정
export function assignTeams(room: Room): Room {
  const players = Object.values(room.players);
  const shuffled = [...players].sort(() => Math.random() - 0.5);

  const policeCount = Math.min(room.settings.policeCount, Math.floor(players.length / 2));

  const updatedPlayers: Record<string, Player> = {};

  shuffled.forEach((player, index) => {
    updatedPlayers[player.id] = {
      ...player,
      team: index < policeCount ? "police" : "thief",
      status: "alive",
      catches: index < policeCount ? 0 : undefined,
      rescues: index >= policeCount ? 0 : undefined,
    };
  });

  return {
    ...room,
    players: updatedPlayers,
  };
}

// 방 참가 가능 여부 확인
export function canJoinRoom(room: Room, password?: string): { canJoin: boolean; reason?: string } {
  if (room.status !== "waiting") {
    return { canJoin: false, reason: "게임이 이미 시작되었습니다." };
  }

  const playerCount = Object.keys(room.players).length;
  if (playerCount >= room.settings.maxPlayers) {
    return { canJoin: false, reason: "방이 가득 찼습니다." };
  }

  if (room.password && room.password !== password) {
    return { canJoin: false, reason: "비밀번호가 일치하지 않습니다." };
  }

  return { canJoin: true };
}

// 초대 링크 생성
export function generateInviteLink(roomCode: string): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/join/${roomCode}`;
}

// 클립보드에 복사
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // 폴백: 구형 브라우저
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    return true;
  }
}

// 게임 시간을 문자열로 변환
export function formatGameTime(minutes: number): string {
  if (minutes < 60) return `${minutes}분`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
}

// 거리를 문자열로 변환
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

// 속도를 문자열로 변환 (m/s -> km/h)
export function formatSpeed(metersPerSecond: number): string {
  const kmh = metersPerSecond * 3.6;
  return `${kmh.toFixed(1)}km/h`;
}

// 승률 계산
export function calculateWinRate(wins: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((wins / total) * 100);
}

// 플레이어 스타일 분석
export function analyzePlayerStyle(stats: {
  policeGames: number;
  policeWins: number;
  thiefGames: number;
  thiefWins: number;
  totalCatches: number;
  totalRescues: number;
}): string {
  const policeWinRate = calculateWinRate(stats.policeWins, stats.policeGames);
  const thiefWinRate = calculateWinRate(stats.thiefWins, stats.thiefGames);

  // 선호 포지션 결정
  const preferPolice = stats.policeGames > stats.thiefGames * 1.5;
  const preferThief = stats.thiefGames > stats.policeGames * 1.5;

  // 스타일 분석
  if (preferPolice && policeWinRate > 60 && stats.totalCatches > stats.policeGames * 2) {
    return "🦅 사냥꾼 - 경찰로서 뛰어난 추격 능력을 보여줍니다";
  }
  if (preferThief && thiefWinRate > 60 && stats.totalRescues > stats.thiefGames) {
    return "🦸 영웅 - 동료 구출에 특화된 도둑입니다";
  }
  if (preferThief && thiefWinRate > 60) {
    return "🐱‍👤 은신의 달인 - 끝까지 살아남는 도둑입니다";
  }
  if (policeWinRate > 60 && thiefWinRate > 60) {
    return "⚖️ 올라운더 - 경찰과 도둑 모두 뛰어납니다";
  }
  if (stats.totalRescues > stats.thiefGames * 2) {
    return "💪 구출왕 - 위험을 무릅쓰고 동료를 구합니다";
  }

  return "🎮 신규 플레이어 - 아직 스타일이 정해지지 않았습니다";
}

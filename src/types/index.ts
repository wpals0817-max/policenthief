// 게임 관련 타입 정의

export type TeamType = "police" | "thief";
export type GameStatus = "waiting" | "hiding" | "playing" | "finished";
export type PlayerStatus = "alive" | "caught" | "escaped" | "disconnected";

// 위치 정보
export interface Location {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
}

// 플레이어 정보
export interface Player {
  id: string;
  name: string;
  team?: TeamType;
  status: PlayerStatus;
  location?: Location;
  isHost: boolean;
  joinedAt: number;
  catches?: number; // 경찰일 때 잡은 수
  rescues?: number; // 도둑일 때 구출한 수
}

// 게임 설정
export interface GameSettings {
  maxPlayers: number;
  policeCount: number;
  hidingTime: number; // 숨는 시간 (초)
  gameTime: number; // 게임 시간 (분)
  boundaryRadius: number; // 경계 반경 (미터)
  autoEliminationDistance: number; // 자동 탈락 거리 (미터, 100m 고정)
  autoEliminationEnabled?: boolean; // 자동 탈락 활성화 여부
  rescueEnabled: boolean; // 구출 가능 여부
  rescueMethod: "touch" | "dabanggu"; // 구출 방식
  jailLocation?: Location; // 감옥 위치
}

// 방 공개 설정
export type RoomVisibility = "public" | "private" | "friends";

// 방 정보
export interface Room {
  id: string;
  code: string; // 초대 코드
  name: string;
  hostId: string;
  hostName: string; // 방장 이름
  password?: string; // 비밀번호 (선택)
  status: GameStatus;
  visibility: RoomVisibility; // 공개 설정
  settings: GameSettings;
  players: Record<string, Player>;
  // 위치 정보
  location: Location; // 방 생성 위치 (검색용)
  centerLocation?: Location; // 게임 중심 위치 (플레이용)
  // 시간 정보
  createdAt: number;
  startedAt?: number;
  finishedAt?: number;
  expiresAt: number; // 방 만료 시간
  winner?: TeamType;
}

// 주변 방 검색 결과
export interface NearbyRoom {
  room: Room;
  distance: number; // 미터 단위
}

// 방 생성 제한
export interface CreateRoomLimit {
  freeRadius: number; // 무료 생성 반경 (미터)
  dailyFreeRemote: number; // 하루 무료 원격 생성 횟수
  maxRemoteRadius: number; // 최대 원격 생성 반경 (미터)
}

export const ROOM_LIMITS: CreateRoomLimit = {
  freeRadius: 1000, // 1km 이내 무료
  dailyFreeRemote: 3, // 하루 3회 원격 무료
  maxRemoteRadius: 5000, // 5km까지 가능 (이상은 프리미엄)
};

// 게임 기록
export interface GameRecord {
  id: string;
  date: number;
  roomName: string;
  team: TeamType;
  result: "win" | "lose";
  duration: number; // 게임 시간 (초)
  distance: number; // 뛴 거리 (미터)
  catches?: number;
  rescues?: number;
  route: Location[]; // 이동 경로
}

// 사용자 프로필
export interface UserProfile {
  id: string;
  name: string;
  createdAt: number;
  totalGames: number;
  wins: number;
  loses: number;
  preferredTeam?: TeamType;
  totalDistance: number; // 총 뛴 거리
  totalTime: number; // 총 플레이 시간
  averageSpeed: number; // 평균 속도
  gameHistory: GameRecord[];
  // 통계
  stats: {
    policeGames: number;
    policeWins: number;
    thiefGames: number;
    thiefWins: number;
    totalCatches: number;
    totalRescues: number;
    longestSurvival: number; // 가장 오래 생존한 시간
    fastestCatch: number; // 가장 빠른 체포 시간
  };
}

// 게임 중 위치 경로
export interface GameRoute {
  playerId: string;
  locations: Location[];
  totalDistance: number;
  averageSpeed: number;
}

// 실시간 게임 상태
export interface GameState {
  roomId: string;
  status: GameStatus;
  remainingTime: number;
  aliveThieves: number;
  caughtThieves: number;
  jailPlayers: string[]; // 감옥에 있는 플레이어 ID
}

// 알림 타입
export interface GameNotification {
  id: string;
  type: "catch" | "rescue" | "escape" | "warning" | "gameEnd";
  message: string;
  timestamp: number;
  playerId?: string;
}

// 기본 게임 설정 값
export const DEFAULT_SETTINGS: GameSettings = {
  maxPlayers: 20,
  policeCount: 3,
  hidingTime: 60,
  gameTime: 15,
  boundaryRadius: 500,
  autoEliminationDistance: 100,
  autoEliminationEnabled: true,
  rescueEnabled: true,
  rescueMethod: "touch",
};

// 게임 룰 정보
export interface GameRule {
  id: string;
  title: string;
  description: string;
  isRequired: boolean;
  category: "basic" | "team" | "capture" | "rescue" | "boundary" | "special";
}

// 기본 룰 목록
export const BASIC_RULES: GameRule[] = [
  {
    id: "team-divide",
    title: "팀 구성",
    description: "참가자를 경찰 팀과 도둑 팀으로 나눕니다. 보통 경찰을 소수로 배정합니다.",
    isRequired: true,
    category: "basic",
  },
  {
    id: "win-condition-police",
    title: "경찰 승리 조건",
    description: "제한 시간 내에 모든 도둑을 잡으면 경찰 팀이 승리합니다.",
    isRequired: true,
    category: "basic",
  },
  {
    id: "win-condition-thief",
    title: "도둑 승리 조건",
    description: "제한 시간까지 한 명이라도 살아남으면 도둑 팀이 승리합니다.",
    isRequired: true,
    category: "basic",
  },
  {
    id: "capture",
    title: "체포",
    description: "경찰이 도둑을 터치하면 도둑은 잡혀서 감옥으로 이동합니다.",
    isRequired: true,
    category: "capture",
  },
  {
    id: "jail",
    title: "감옥",
    description: "잡힌 도둑들은 지정된 감옥 위치에서 대기합니다.",
    isRequired: true,
    category: "capture",
  },
  {
    id: "rescue",
    title: "구출",
    description: "살아있는 도둑이 감옥에 있는 동료를 터치하면 구출됩니다.",
    isRequired: false,
    category: "rescue",
  },
  {
    id: "dabanggu",
    title: "다방구",
    description: "'다방구'라고 외치며 손을 끊어야 구출이 인정되는 변칙 룰입니다.",
    isRequired: false,
    category: "rescue",
  },
  {
    id: "boundary",
    title: "활동 구역",
    description: "게임의 범위를 명확히 정합니다. 구역을 벗어나면 탈락입니다.",
    isRequired: true,
    category: "boundary",
  },
  {
    id: "hiding-time",
    title: "숨는 시간",
    description: "게임 시작 전 도둑에게 숨을 시간이 주어집니다.",
    isRequired: true,
    category: "basic",
  },
];

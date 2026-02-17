// Firebase Realtime Database 실시간 동기화 서비스

import { ref, set, onValue, off, serverTimestamp, onDisconnect } from "firebase/database";
import { rtdb } from "./firebase";
import type { Location, Player, GameStatus } from "@/types";

// 데이터 구조:
// games/
//   {roomCode}/
//     status: GameStatus
//     startedAt: timestamp
//     players/
//       {playerId}/
//         name: string
//         team: "police" | "thief"
//         status: "alive" | "caught" | "disconnected"
//         location:
//           latitude: number
//           longitude: number
//           timestamp: number
//         lastSeen: timestamp

/**
 * 플레이어 위치 업데이트
 */
export async function updatePlayerLocation(
  roomCode: string,
  playerId: string,
  location: Location
): Promise<void> {
  try {
    const locationRef = ref(rtdb, `games/${roomCode}/players/${playerId}/location`);
    await set(locationRef, {
      latitude: location.latitude,
      longitude: location.longitude,
      timestamp: location.timestamp,
      accuracy: location.accuracy || null,
    });

    // lastSeen 타임스탬프 업데이트
    const lastSeenRef = ref(rtdb, `games/${roomCode}/players/${playerId}/lastSeen`);
    await set(lastSeenRef, Date.now());
  } catch (error) {
    console.error("Failed to update player location:", error);
    // 위치 업데이트 실패는 치명적이지 않으므로 에러를 던지지 않음
  }
}

/**
 * 플레이어 상태 업데이트
 */
export async function updatePlayerStatus(
  roomCode: string,
  playerId: string,
  status: Player["status"]
): Promise<void> {
  try {
    const statusRef = ref(rtdb, `games/${roomCode}/players/${playerId}/status`);
    await set(statusRef, status);
  } catch (error) {
    console.error("Failed to update player status:", error);
    throw error;
  }
}

/**
 * 플레이어 정보 초기화 (게임 시작 시)
 */
export async function initializePlayer(
  roomCode: string,
  player: Player
): Promise<void> {
  try {
    const playerRef = ref(rtdb, `games/${roomCode}/players/${player.id}`);
    await set(playerRef, {
      name: player.name,
      team: player.team || null,
      status: player.status,
      location: player.location || null,
      lastSeen: Date.now(),
    });

    // 연결 끊김 시 자동으로 상태 변경
    const disconnectRef = ref(rtdb, `games/${roomCode}/players/${player.id}/status`);
    onDisconnect(disconnectRef).set("disconnected");
  } catch (error) {
    console.error("Failed to initialize player:", error);
    throw error;
  }
}

/**
 * 게임 상태 업데이트
 */
export async function updateGameStatus(
  roomCode: string,
  status: GameStatus
): Promise<void> {
  try {
    const statusRef = ref(rtdb, `games/${roomCode}/status`);
    await set(statusRef, status);
  } catch (error) {
    console.error("Failed to update game status:", error);
    throw error;
  }
}

/**
 * 모든 플레이어 위치 구독
 */
export function subscribeToPlayerLocations(
  roomCode: string,
  callback: (locations: Record<string, Location & { lastSeen: number }>) => void
): () => void {
  const playersRef = ref(rtdb, `games/${roomCode}/players`);

  const handleValue = (snapshot: any) => {
    const data = snapshot.val() || {};
    const locations: Record<string, Location & { lastSeen: number }> = {};

    Object.entries(data).forEach(([playerId, playerData]: [string, any]) => {
      if (playerData && playerData.location) {
        locations[playerId] = {
          latitude: playerData.location.latitude,
          longitude: playerData.location.longitude,
          timestamp: playerData.location.timestamp,
          accuracy: playerData.location.accuracy,
          lastSeen: playerData.lastSeen || Date.now(),
        };
      }
    });

    callback(locations);
  };

  onValue(playersRef, handleValue);

  // 구독 취소 함수 반환
  return () => {
    off(playersRef, "value", handleValue);
  };
}

/**
 * 플레이어 상태 구독
 */
export function subscribeToPlayerStatuses(
  roomCode: string,
  callback: (statuses: Record<string, Player["status"]>) => void
): () => void {
  const playersRef = ref(rtdb, `games/${roomCode}/players`);

  const handleValue = (snapshot: any) => {
    const data = snapshot.val() || {};
    const statuses: Record<string, Player["status"]> = {};

    Object.entries(data).forEach(([playerId, playerData]: [string, any]) => {
      if (playerData && playerData.status) {
        statuses[playerId] = playerData.status;
      }
    });

    callback(statuses);
  };

  onValue(playersRef, handleValue);

  return () => {
    off(playersRef, "value", handleValue);
  };
}

/**
 * 게임 상태 구독
 */
export function subscribeToGameStatus(
  roomCode: string,
  callback: (status: GameStatus) => void
): () => void {
  const statusRef = ref(rtdb, `games/${roomCode}/status`);

  const handleValue = (snapshot: any) => {
    const status = snapshot.val();
    if (status) {
      callback(status);
    }
  };

  onValue(statusRef, handleValue);

  return () => {
    off(statusRef, "value", handleValue);
  };
}

/**
 * 게임 데이터 정리 (게임 종료 시)
 */
export async function cleanupGameData(roomCode: string): Promise<void> {
  try {
    const gameRef = ref(rtdb, `games/${roomCode}`);
    await set(gameRef, null);
  } catch (error) {
    console.error("Failed to cleanup game data:", error);
  }
}

/**
 * 플레이어 제거
 */
export async function removePlayer(
  roomCode: string,
  playerId: string
): Promise<void> {
  try {
    const playerRef = ref(rtdb, `games/${roomCode}/players/${playerId}`);
    await set(playerRef, null);
  } catch (error) {
    console.error("Failed to remove player:", error);
  }
}

/**
 * 연결 상태 확인 (30초 이상 업데이트 없으면 끊김으로 간주)
 */
export function checkPlayerConnections(
  locations: Record<string, Location & { lastSeen: number }>
): Record<string, boolean> {
  const now = Date.now();
  const CONNECTION_TIMEOUT = 30000; // 30초

  const connections: Record<string, boolean> = {};

  Object.entries(locations).forEach(([playerId, loc]) => {
    connections[playerId] = now - loc.lastSeen < CONNECTION_TIMEOUT;
  });

  return connections;
}

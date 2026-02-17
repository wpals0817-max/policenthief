// 방 관련 Firebase 서비스
// Firebase 없이도 작동하도록 localStorage 폴백 포함

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Room, Player, GameSettings, Location, RoomVisibility, NearbyRoom } from "@/types";
import { createRoom as createRoomLocal } from "./roomUtils";
import { calculateDistance } from "@/hooks/useGeolocation";

const ROOMS_COLLECTION = "rooms";
const LOCAL_STORAGE_KEY = "policenthief_rooms";

// Firebase 연결 상태 확인
let isFirebaseAvailable = false;

// localStorage에서 방 목록 가져오기
function getLocalRooms(): Record<string, Room> {
  if (typeof window === "undefined") return {};
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

// localStorage에 방 저장
function saveLocalRoom(room: Room): void {
  if (typeof window === "undefined") return;
  try {
    const rooms = getLocalRooms();
    rooms[room.code] = room;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rooms));
    // BroadcastChannel로 다른 탭에 알림
    const channel = new BroadcastChannel("policenthief_rooms");
    channel.postMessage({ type: "room_updated", room });
    channel.close();
  } catch (e) {
    console.error("Failed to save room to localStorage:", e);
  }
}

// 거리 제한 상수
const ROOM_LIMITS = {
  freeRadius: 1000, // 1km 이내 무료
  dailyFreeRemote: 3, // 하루 3회 원격 무료
  maxRemoteRadius: 5000, // 5km까지 가능
};

// 원격 생성 횟수 확인
function getRemoteCreateCount(): number {
  if (typeof window === "undefined") return 0;
  const today = new Date().toDateString();
  const data = localStorage.getItem("policenthief_remote_creates");
  if (!data) return 0;
  const parsed = JSON.parse(data);
  if (parsed.date !== today) return 0;
  return parsed.count || 0;
}

// 원격 생성 횟수 증가
function incrementRemoteCreateCount(): void {
  if (typeof window === "undefined") return;
  const today = new Date().toDateString();
  const current = getRemoteCreateCount();
  localStorage.setItem("policenthief_remote_creates", JSON.stringify({
    date: today,
    count: current + 1,
  }));
}

// 방 생성 가능 여부 확인
export function checkCreateRoomLimit(
  userLocation: Location,
  targetLocation: Location
): { allowed: boolean; reason?: string; isRemote: boolean; remainingFree: number } {
  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    targetLocation.latitude,
    targetLocation.longitude
  );

  const isRemote = distance > ROOM_LIMITS.freeRadius;
  const remoteCount = getRemoteCreateCount();
  const remainingFree = Math.max(0, ROOM_LIMITS.dailyFreeRemote - remoteCount);

  if (!isRemote) {
    return { allowed: true, isRemote: false, remainingFree };
  }

  if (distance > ROOM_LIMITS.maxRemoteRadius) {
    return {
      allowed: false,
      reason: `${(ROOM_LIMITS.maxRemoteRadius / 1000).toFixed(1)}km 이상 떨어진 곳에는 방을 만들 수 없습니다.`,
      isRemote: true,
      remainingFree,
    };
  }

  if (remainingFree <= 0) {
    return {
      allowed: false,
      reason: "오늘의 원격 방 생성 횟수를 모두 사용했습니다.",
      isRemote: true,
      remainingFree: 0,
    };
  }

  return { allowed: true, isRemote: true, remainingFree };
}

// 방 생성
export async function createRoomInDB(
  hostId: string,
  hostName: string,
  roomName: string,
  location: Location,
  options?: {
    password?: string;
    visibility?: RoomVisibility;
    settings?: Partial<GameSettings>;
  }
): Promise<Room> {
  const room = createRoomLocal(hostId, hostName, roomName, location, options);

  try {
    // Firebase에 저장 시도
    await setDoc(doc(db, ROOMS_COLLECTION, room.code), room);
    isFirebaseAvailable = true;
    console.log("Room created in Firebase:", room.code);
  } catch (error) {
    console.log("Firebase unavailable, using localStorage:", error);
    isFirebaseAvailable = false;
  }

  // 항상 localStorage에도 저장 (폴백 및 같은 브라우저 테스트용)
  saveLocalRoom(room);

  return room;
}

// 방 코드로 방 찾기
export async function findRoomByCode(code: string): Promise<Room | null> {
  const upperCode = code.toUpperCase();

  // 1. 먼저 localStorage 확인 (빠른 응답)
  const localRooms = getLocalRooms();
  if (localRooms[upperCode]) {
    console.log("Room found in localStorage:", upperCode);
    return localRooms[upperCode];
  }

  // 2. Firebase에서 찾기
  try {
    const roomRef = doc(db, ROOMS_COLLECTION, upperCode);
    const roomSnap = await getDoc(roomRef);

    if (roomSnap.exists()) {
      isFirebaseAvailable = true;
      const room = roomSnap.data() as Room;
      console.log("Room found in Firebase:", upperCode);
      // localStorage에도 캐시
      saveLocalRoom(room);
      return room;
    }
  } catch (error) {
    console.log("Firebase query failed:", error);
  }

  return null;
}

// 방에 플레이어 추가
export async function joinRoom(
  roomCode: string,
  playerId: string,
  playerName: string,
  password?: string
): Promise<{ success: boolean; room?: Room; error?: string }> {
  const room = await findRoomByCode(roomCode);

  if (!room) {
    return { success: false, error: "방을 찾을 수 없습니다. 코드를 확인해주세요." };
  }

  if (room.status !== "waiting") {
    return { success: false, error: "게임이 이미 시작되었습니다." };
  }

  const playerCount = Object.keys(room.players).length;
  if (playerCount >= room.settings.maxPlayers) {
    return { success: false, error: "방이 가득 찼습니다." };
  }

  if (room.password && room.password !== password) {
    return { success: false, error: "비밀번호가 일치하지 않습니다." };
  }

  // 이미 참여한 플레이어인지 확인
  if (room.players[playerId]) {
    return { success: true, room };
  }

  // 새 플레이어 추가
  const newPlayer: Player = {
    id: playerId,
    name: playerName,
    status: "alive",
    isHost: false,
    joinedAt: Date.now(),
  };

  const updatedRoom: Room = {
    ...room,
    players: {
      ...room.players,
      [playerId]: newPlayer,
    },
  };

  // 저장
  try {
    await setDoc(doc(db, ROOMS_COLLECTION, room.code), updatedRoom);
  } catch (error) {
    console.log("Firebase update failed, using localStorage");
  }

  saveLocalRoom(updatedRoom);

  return { success: true, room: updatedRoom };
}

// 방 업데이트
export async function updateRoom(room: Room): Promise<void> {
  try {
    await setDoc(doc(db, ROOMS_COLLECTION, room.code), room);
  } catch (error) {
    console.log("Firebase update failed");
  }

  saveLocalRoom(room);
}

// 방 실시간 구독
export function subscribeToRoom(
  roomCode: string,
  callback: (room: Room | null) => void
): () => void {
  const upperCode = roomCode.toUpperCase();

  // Firebase 구독
  let unsubscribeFirebase: (() => void) | null = null;

  try {
    const roomRef = doc(db, ROOMS_COLLECTION, upperCode);
    unsubscribeFirebase = onSnapshot(
      roomRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const room = snapshot.data() as Room;
          saveLocalRoom(room); // 로컬에도 동기화
          callback(room);
        }
      },
      (error) => {
        console.log("Firebase subscription error:", error);
      }
    );
  } catch (error) {
    console.log("Firebase subscription failed");
  }

  // BroadcastChannel 구독 (같은 브라우저의 다른 탭용)
  const channel = new BroadcastChannel("policenthief_rooms");
  const handleMessage = (event: MessageEvent) => {
    if (event.data.type === "room_updated" && event.data.room?.code === upperCode) {
      callback(event.data.room);
    }
  };
  channel.addEventListener("message", handleMessage);

  // 초기 데이터 로드
  findRoomByCode(upperCode).then((room) => {
    if (room) callback(room);
  });

  // 정리 함수
  return () => {
    if (unsubscribeFirebase) unsubscribeFirebase();
    channel.removeEventListener("message", handleMessage);
    channel.close();
  };
}

// 플레이어 퇴장
export async function leaveRoom(roomCode: string, playerId: string): Promise<void> {
  const room = await findRoomByCode(roomCode);
  if (!room) return;

  const { [playerId]: removed, ...remainingPlayers } = room.players;

  // 방장이 나가면 다른 사람에게 방장 넘기기
  let newHostId = room.hostId;
  if (playerId === room.hostId) {
    const remainingIds = Object.keys(remainingPlayers);
    if (remainingIds.length > 0) {
      newHostId = remainingIds[0];
      remainingPlayers[newHostId] = {
        ...remainingPlayers[newHostId],
        isHost: true,
      };
    }
  }

  const updatedRoom: Room = {
    ...room,
    hostId: newHostId,
    players: remainingPlayers,
  };

  await updateRoom(updatedRoom);
}

// 주변 방 검색
export async function findNearbyRooms(
  userLocation: Location,
  maxDistance: number = 5000, // 기본 5km
  limit: number = 20
): Promise<NearbyRoom[]> {
  const now = Date.now();
  const nearbyRooms: NearbyRoom[] = [];

  // 1. localStorage에서 검색
  const localRooms = getLocalRooms();
  Object.values(localRooms).forEach((room) => {
    // 조건 체크: 대기 중, 공개, 만료되지 않음
    if (
      room.status !== "waiting" ||
      room.visibility !== "public" ||
      (room.expiresAt && room.expiresAt < now) ||
      !room.location
    ) {
      return;
    }

    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      room.location.latitude,
      room.location.longitude
    );

    if (distance <= maxDistance) {
      nearbyRooms.push({ room, distance });
    }
  });

  // 2. Firebase에서 검색 (가능한 경우)
  try {
    const roomsRef = collection(db, ROOMS_COLLECTION);
    const q = query(
      roomsRef,
      where("status", "==", "waiting"),
      where("visibility", "==", "public")
    );
    const snapshot = await getDocs(q);

    snapshot.forEach((docSnap) => {
      const room = docSnap.data() as Room;

      // 이미 로컬에 있으면 스킵
      if (localRooms[room.code]) return;

      // 만료 체크
      if (room.expiresAt && room.expiresAt < now) return;

      if (!room.location) return;

      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        room.location.latitude,
        room.location.longitude
      );

      if (distance <= maxDistance) {
        nearbyRooms.push({ room, distance });
        // 로컬에도 캐시
        saveLocalRoom(room);
      }
    });

    isFirebaseAvailable = true;
  } catch (error) {
    console.log("Firebase nearby search failed:", error);
  }

  // 거리순 정렬 후 제한
  nearbyRooms.sort((a, b) => a.distance - b.distance);
  return nearbyRooms.slice(0, limit);
}

// 만료된 방 정리
export function cleanupExpiredRooms(): void {
  if (typeof window === "undefined") return;

  const now = Date.now();
  const rooms = getLocalRooms();
  let hasChanges = false;

  Object.entries(rooms).forEach(([code, room]) => {
    if (room.expiresAt && room.expiresAt < now) {
      delete rooms[code];
      hasChanges = true;
    }
  });

  if (hasChanges) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rooms));
  }
}

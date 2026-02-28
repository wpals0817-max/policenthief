"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserX, Gamepad2, Link2, MapPin, Clock, Users, BookOpen, User } from "lucide-react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Card from "@/components/Card";
import GameMap from "@/components/GameMap";
import GameLogo from "@/components/GameLogo";
import CoupangBanner from "@/components/CoupangBanner";
import { useGameStore } from "@/store/gameStore";
import { useGeolocation } from "@/hooks/useGeolocation";
import { findNearbyRooms, cleanupExpiredRooms } from "@/lib/roomService";
import { formatDistance } from "@/lib/roomUtils";
import type { NearbyRoom, Location } from "@/types";

export default function Home() {
  const router = useRouter();
  const { userName, setUserName, setUserId, userId } = useGameStore();
  const { location, isLoading: locationLoading } = useGeolocation();

  const [name, setName] = useState(userName);
  const [roomCode, setRoomCode] = useState("");
  const [showJoinInput, setShowJoinInput] = useState(false);

  // 주변 방 검색
  const [nearbyRooms, setNearbyRooms] = useState<NearbyRoom[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [searchRadius, setSearchRadius] = useState(5000);

  // 사용자 ID 초기화
  useEffect(() => {
    if (!userId) {
      setUserId(`user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
    }
    cleanupExpiredRooms();
  }, [userId, setUserId]);

  // 주변 방 검색
  useEffect(() => {
    if (!location) return;

    const searchNearby = async () => {
      setIsLoadingRooms(true);
      const rooms = await findNearbyRooms(location, searchRadius);
      setNearbyRooms(rooms);
      setIsLoadingRooms(false);
    };

    searchNearby();
    const interval = setInterval(searchNearby, 30000);
    return () => clearInterval(interval);
  }, [location, searchRadius]);

  const handleCreateRoom = () => {
    if (!name.trim()) {
      alert("이름을 입력해주세요!");
      return;
    }
    setUserName(name.trim());
    router.push("/create");
  };

  const handleJoinRoom = () => {
    if (!name.trim()) {
      alert("이름을 입력해주세요!");
      return;
    }
    if (!roomCode.trim()) {
      alert("방 코드를 입력해주세요!");
      return;
    }
    setUserName(name.trim());
    router.push(`/join/${roomCode.toUpperCase()}`);
  };

  const handleJoinNearbyRoom = (room: NearbyRoom) => {
    if (!name.trim()) {
      alert("이름을 입력해주세요!");
      return;
    }
    setUserName(name.trim());
    router.push(`/join/${room.room.code}`);
  };

  return (
    <main className="min-h-screen flex flex-col p-4 safe-area-top safe-area-bottom bg-gray-50">
      {/* 로고 */}
      <div className="text-center py-8">
        <GameLogo />
        <h1 className="text-3xl font-bold text-gray-900 mt-2">
          경찰과 도둑
        </h1>
        <p className="text-sm text-gray-600 mt-1">실시간 야외 술래잡기</p>
      </div>

      {/* 이름 + 버튼 */}
      <Card padding="md" className="mb-4">
        <div className="flex gap-2 mb-3">
          <Input
            placeholder="닉네임 입력"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={12}
            className="flex-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="police" size="md" fullWidth onClick={handleCreateRoom}>
            <Gamepad2 className="w-5 h-5 mr-1.5" />
            방 만들기
          </Button>
          <Button
            variant="outline"
            size="md"
            fullWidth
            onClick={() => setShowJoinInput(!showJoinInput)}
          >
            <Link2 className="w-5 h-5 mr-1.5" />
            코드 입장
          </Button>
        </div>

        {showJoinInput && (
          <div className="mt-3 flex gap-2">
            <Input
              placeholder="방 코드 (예: ABC123)"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="flex-1 text-center tracking-widest"
            />
            <Button variant="thief" onClick={handleJoinRoom}>
              참여
            </Button>
          </div>
        )}
      </Card>

      {/* 주변 게임 섹션 */}
      <div className="flex-1 min-h-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            주변 게임
            {nearbyRooms.length > 0 && (
              <span className="text-sm text-gray-600 ml-1">({nearbyRooms.length})</span>
            )}
          </h2>
          <div className="flex gap-2">
            <select
              value={searchRadius}
              onChange={(e) => setSearchRadius(Number(e.target.value))}
              className="bg-white border border-gray-300 rounded-lg px-2 py-1 text-sm text-gray-700"
            >
              <option value={1000}>1km</option>
              <option value={3000}>3km</option>
              <option value={5000}>5km</option>
              <option value={10000}>10km</option>
            </select>
            <div className="flex bg-white rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1 text-sm ${
                  viewMode === "list" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                목록
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`px-3 py-1 text-sm ${
                  viewMode === "map" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                지도
              </button>
            </div>
          </div>
        </div>

        {locationLoading ? (
          <Card padding="lg" className="text-center">
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <MapPin className="w-5 h-5 animate-pulse" />
              <p>위치를 가져오는 중...</p>
            </div>
          </Card>
        ) : !location ? (
          <Card padding="lg" className="text-center">
            <div className="flex flex-col items-center gap-2">
              <MapPin className="w-8 h-8 text-gray-400" />
              <p className="text-gray-600">위치 권한을 허용해주세요</p>
            </div>
          </Card>
        ) : viewMode === "map" ? (
          <Card padding="none" className="overflow-hidden">
            <div className="h-72">
              <NearbyRoomsMap
                userLocation={location}
                rooms={nearbyRooms}
                searchRadius={searchRadius}
              />
            </div>
            {nearbyRooms.length > 0 && (
              <div className="p-3 border-t border-gray-200 max-h-32 overflow-auto">
                {nearbyRooms.slice(0, 3).map((nearbyRoom) => (
                  <NearbyRoomMini
                    key={nearbyRoom.room.id}
                    nearbyRoom={nearbyRoom}
                    onJoin={() => handleJoinNearbyRoom(nearbyRoom)}
                  />
                ))}
              </div>
            )}
          </Card>
        ) : (
          <div className="space-y-2 overflow-auto max-h-[50vh]">
            {isLoadingRooms ? (
              <Card padding="lg" className="text-center">
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <MapPin className="w-5 h-5 animate-pulse" />
                  <p>주변 게임 검색 중...</p>
                </div>
              </Card>
            ) : nearbyRooms.length === 0 ? (
              <Card padding="lg" className="text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <UserX className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-gray-700 mb-1 font-medium">주변에 진행 중인 게임이 없습니다</p>
                    <p className="text-gray-500 text-sm">방을 만들어 친구들을 초대해보세요!</p>
                  </div>
                </div>
              </Card>
            ) : (
              nearbyRooms.map((nearbyRoom) => (
                <NearbyRoomCard
                  key={nearbyRoom.room.id}
                  nearbyRoom={nearbyRoom}
                  onJoin={() => handleJoinNearbyRoom(nearbyRoom)}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* 하단 메뉴 */}
      <div className="flex gap-4 mt-4 justify-center">
        <Button variant="ghost" size="sm" onClick={() => router.push("/rules")}>
          <BookOpen className="w-4 h-4 mr-1.5" />
          룰북
        </Button>
        <Button variant="ghost" size="sm" onClick={() => router.push("/profile")}>
          <User className="w-4 h-4 mr-1.5" />
          내 기록
        </Button>
      </div>

      {/* 쿠팡 배너 */}
      <CoupangBanner position="bottom" className="mt-1" />
    </main>
  );
}

function NearbyRoomCard({
  nearbyRoom,
  onJoin,
}: {
  nearbyRoom: NearbyRoom;
  onJoin: () => void;
}) {
  const { room, distance } = nearbyRoom;
  const playerCount = Object.keys(room.players).length;
  const isFull = playerCount >= room.settings.maxPlayers;

  return (
    <Card
      padding="sm"
      hover={!isFull}
      onClick={!isFull ? onJoin : undefined}
      className={isFull ? "opacity-60" : ""}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 truncate">{room.name}</h3>
            {room.password && <span className="text-yellow-600 text-xs">🔒</span>}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-600 mt-0.5">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {playerCount}/{room.settings.maxPlayers}
            </span>
            <span className="text-blue-600 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {formatDistance(distance)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {room.settings.gameTime}분
            </span>
          </div>
        </div>
        <Button
          variant={isFull ? "secondary" : "thief"}
          size="sm"
          disabled={isFull}
          onClick={(e) => {
            e.stopPropagation();
            onJoin();
          }}
        >
          {isFull ? "만원" : "참여"}
        </Button>
      </div>
    </Card>
  );
}

function NearbyRoomMini({
  nearbyRoom,
  onJoin,
}: {
  nearbyRoom: NearbyRoom;
  onJoin: () => void;
}) {
  const { room, distance } = nearbyRoom;
  const playerCount = Object.keys(room.players).length;

  return (
    <div
      className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0 cursor-pointer hover:bg-gray-50 -mx-3 px-3 rounded-lg transition-colors"
      onClick={onJoin}
    >
      <div className="flex-1 min-w-0">
        <p className="text-gray-900 text-sm truncate font-medium">{room.name}</p>
        <p className="text-gray-600 text-xs">
          {formatDistance(distance)} • {playerCount}/{room.settings.maxPlayers}명
        </p>
      </div>
      <span className="text-red-600 text-sm font-semibold">참여 →</span>
    </div>
  );
}

function NearbyRoomsMap({
  userLocation,
  rooms,
  searchRadius,
}: {
  userLocation: Location;
  rooms: NearbyRoom[];
  searchRadius: number;
}) {
  const roomMarkers = rooms.map((nr) => ({
    id: nr.room.id,
    name: `${nr.room.name} (${Object.keys(nr.room.players).length}명)`,
    team: "thief" as const,
    status: "alive" as const,
    isHost: false,
    joinedAt: nr.room.createdAt,
    location: nr.room.location,
  }));

  return (
    <GameMap
      center={userLocation}
      boundaryRadius={searchRadius}
      players={roomMarkers}
      className="h-full"
    />
  );
}

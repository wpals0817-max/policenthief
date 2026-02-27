"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Card from "@/components/Card";
import PlayerList from "@/components/PlayerList";
import GameMap from "@/components/GameMap";
import CoupangBanner from "@/components/CoupangBanner";
import { useGameStore } from "@/store/gameStore";
import { useGeolocation } from "@/hooks/useGeolocation";
import { generateInviteLink, copyToClipboard, assignTeams } from "@/lib/roomUtils";
import { subscribeToRoom, updateRoom, findRoomByCode } from "@/lib/roomService";
import type { Location } from "@/types";

export default function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const {
    userId,
    currentRoom,
    isHost,
    setCurrentRoom,
    setCurrentLocation,
  } = useGameStore();

  const { location, error: locationError, getCurrentLocation } = useGeolocation();

  const [copied, setCopied] = useState(false);
  const [jailLocation, setJailLocation] = useState<Location | null>(null);
  const [isSettingJail, setIsSettingJail] = useState(false);

  // 위치 정보 업데이트
  useEffect(() => {
    if (location) {
      setCurrentLocation(location);
    }
  }, [location, setCurrentLocation]);

  // 방 실시간 구독
  useEffect(() => {
    // 방 정보가 없으면 먼저 가져오기
    if (!currentRoom) {
      findRoomByCode(code).then((room) => {
        if (room) {
          setCurrentRoom(room);
        }
      });
    }

    // 실시간 구독
    const unsubscribe = subscribeToRoom(code, (room) => {
      if (room) {
        setCurrentRoom(room);
        // 게임이 시작되면 게임 페이지로 이동
        if (room.status === "hiding" || room.status === "playing") {
          router.push(`/game/${code}`);
        }
      }
    });

    return () => unsubscribe();
  }, [code, currentRoom, setCurrentRoom, router]);

  // 초대 링크 복사
  const handleCopyInviteLink = async () => {
    const link = generateInviteLink(code);
    const success = await copyToClipboard(link);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 감옥 위치 설정
  const handleSetJailLocation = useCallback(async (loc: Location) => {
    if (isSettingJail && isHost && currentRoom) {
      setJailLocation(loc);
      setIsSettingJail(false);

      const updatedRoom = {
        ...currentRoom,
        settings: {
          ...currentRoom.settings,
          jailLocation: loc,
        },
      };
      setCurrentRoom(updatedRoom);
      await updateRoom(updatedRoom);
    }
  }, [isSettingJail, isHost, currentRoom, setCurrentRoom]);

  // 게임 시작
  const handleStartGame = async () => {
    if (!currentRoom) return;

    const playerCount = Object.keys(currentRoom.players).length;
    if (playerCount < 2) {
      alert("게임을 시작하려면 최소 2명이 필요합니다.");
      return;
    }

    if (!location) {
      alert("위치 정보를 가져올 수 없습니다. 위치 권한을 확인해주세요.");
      return;
    }

    // 팀 배정
    const roomWithTeams = assignTeams(currentRoom);

    // 게임 시작 상태로 업데이트
    const startedRoom = {
      ...roomWithTeams,
      status: "hiding" as const,
      centerLocation: location,
      startedAt: Date.now(),
    };

    setCurrentRoom(startedRoom);
    await updateRoom(startedRoom);

    router.push(`/game/${code}`);
  };

  // 방 나가기
  const handleLeaveRoom = () => {
    if (confirm("정말로 방을 나가시겠습니까?")) {
      setCurrentRoom(null);
      router.push("/");
    }
  };

  if (!currentRoom) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card padding="lg" className="text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">방을 찾는 중...</h1>
          <p className="text-gray-600">잠시만 기다려주세요</p>
          <Button variant="ghost" className="mt-4" onClick={() => router.push("/")}>
            홈으로
          </Button>
        </Card>
      </main>
    );
  }

  const players = Object.values(currentRoom.players);
  const playerCount = players.length;

  return (
    <main className="min-h-screen bg-gray-50 p-4 safe-area-top safe-area-bottom">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{currentRoom.name}</h1>
          <p className="text-gray-600 text-sm">
            방 코드: <span className="font-mono text-blue-600 font-semibold">{code.toUpperCase()}</span>
          </p>
        </div>
        <Button
          variant={copied ? "primary" : "outline"}
          size="sm"
          onClick={handleCopyInviteLink}
        >
          {copied ? "✓ 복사됨!" : "📋 초대 링크"}
        </Button>
      </div>

      {/* 위치 오류 경고 */}
      {locationError && (
        <Card padding="sm" className="mb-4 bg-yellow-50 border-yellow-200">
          <p className="text-yellow-700 text-sm">⚠️ {locationError}</p>
          <Button variant="ghost" size="sm" className="mt-2" onClick={() => getCurrentLocation()}>
            다시 시도
          </Button>
        </Card>
      )}

      {/* 지도 */}
      {location && (
        <Card padding="none" className="mb-4 overflow-hidden">
          <div className="h-64">
            <GameMap
              center={location}
              boundaryRadius={currentRoom.settings.boundaryRadius}
              jailLocation={jailLocation || undefined}
              onMapClick={isSettingJail ? handleSetJailLocation : undefined}
              className="h-full"
            />
          </div>
          {isHost && (
            <div className="p-3 border-t border-gray-200">
              {isSettingJail ? (
                <p className="text-yellow-700 text-sm text-center animate-pulse font-medium">
                  🏛️ 지도를 클릭하여 감옥 위치를 설정하세요
                </p>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={() => setIsSettingJail(true)}
                >
                  🏛️ {jailLocation ? "감옥 위치 변경" : "감옥 위치 설정"}
                </Button>
              )}
            </div>
          )}
        </Card>
      )}

      {/* 게임 설정 요약 */}
      <Card padding="md" className="mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">⚙️ 게임 설정</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">경찰 수</span>
            <span className="text-blue-600 font-bold">{currentRoom.settings.policeCount}명</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">숨는 시간</span>
            <span className="text-yellow-600 font-bold">{currentRoom.settings.hidingTime}초</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">게임 시간</span>
            <span className="text-green-600 font-bold">{currentRoom.settings.gameTime}분</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">활동 반경</span>
            <span className="text-blue-600 font-bold">{currentRoom.settings.boundaryRadius}m</span>
          </div>
          <div className="flex justify-between col-span-2">
            <span className="text-gray-600">구출</span>
            <span className="text-gray-900 font-bold">
              {currentRoom.settings.rescueEnabled
                ? currentRoom.settings.rescueMethod === "touch"
                  ? "👆 터치 구출"
                  : "📢 다방구"
                : "❌ 불가능"}
            </span>
          </div>
        </div>
      </Card>

      {/* 참가자 목록 */}
      <Card padding="md" className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold text-gray-700">
            👥 참가자 ({playerCount}/{currentRoom.settings.maxPlayers})
          </h2>
          <span className="text-xs text-gray-500">
            시작까지 최소 2명 필요
          </span>
        </div>
        <PlayerList players={players} currentUserId={userId || undefined} />
      </Card>

      {/* 하단 버튼 */}
      <div className="space-y-3">
        {isHost ? (
          <Button
            variant="police"
            size="lg"
            fullWidth
            onClick={handleStartGame}
            disabled={playerCount < 2 || !location}
          >
            🎮 게임 시작
          </Button>
        ) : (
          <Card padding="md" className="text-center">
            <p className="text-gray-600">
              방장이 게임을 시작할 때까지 기다려주세요...
            </p>
          </Card>
        )}

        <Button variant="ghost" size="md" fullWidth onClick={handleLeaveRoom}>
          🚪 방 나가기
        </Button>
      </div>

      {/* 초대 안내 */}
      <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-red-50 border border-gray-200 text-center">
        <p className="text-gray-700 text-sm mb-2 font-medium">친구를 초대하세요!</p>
        <p className="text-gray-600 text-xs">
          초대 링크를 공유하거나 방 코드 <span className="text-blue-600 font-mono font-semibold">{code.toUpperCase()}</span>를 알려주세요
        </p>
      </div>

      {/* 쿠팡 배너 */}
      <CoupangBanner position="bottom" className="mt-6" />
    </main>
  );
}

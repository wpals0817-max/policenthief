"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Card from "@/components/Card";
import GameMap from "@/components/GameMap";
import { useGameStore } from "@/store/gameStore";
import { useGeolocation, calculateDistance } from "@/hooks/useGeolocation";
import { defaultSettings, settingsLimits } from "@/lib/roomUtils";
import { createRoomInDB, checkCreateRoomLimit } from "@/lib/roomService";
import type { GameSettings, Location, RoomVisibility } from "@/types";

export default function CreateRoomPage() {
  const router = useRouter();
  const { userId, userName, setCurrentRoom, setIsHost } = useGameStore();
  const { location: userLocation, error: locationError, isLoading: locationLoading } = useGeolocation();

  const [roomName, setRoomName] = useState(`${userName}의 경도 게임`);
  const [password, setPassword] = useState("");
  const [usePassword, setUsePassword] = useState(false);
  const [visibility, setVisibility] = useState<RoomVisibility>("public");
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);
  const [isCreating, setIsCreating] = useState(false);

  // 방 생성 위치 (기본: 현재 위치)
  const [roomLocation, setRoomLocation] = useState<Location | null>(null);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [distanceInfo, setDistanceInfo] = useState<{
    distance: number;
    isRemote: boolean;
    remainingFree: number;
    allowed: boolean;
    reason?: string;
  } | null>(null);

  // 현재 위치로 초기화
  useEffect(() => {
    if (userLocation && !roomLocation) {
      setRoomLocation(userLocation);
    }
  }, [userLocation, roomLocation]);

  // 거리 제한 체크
  useEffect(() => {
    if (userLocation && roomLocation) {
      const result = checkCreateRoomLimit(userLocation, roomLocation);
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        roomLocation.latitude,
        roomLocation.longitude
      );
      setDistanceInfo({ ...result, distance });
    }
  }, [userLocation, roomLocation]);

  // 지도 클릭으로 위치 선택
  const handleMapClick = useCallback((loc: Location) => {
    if (isSelectingLocation) {
      setRoomLocation(loc);
      setIsSelectingLocation(false);
    }
  }, [isSelectingLocation]);

  const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreate = async () => {
    if (!userId || !userName) {
      alert("로그인 정보가 없습니다. 처음부터 다시 시작해주세요.");
      router.push("/");
      return;
    }

    if (!roomName.trim()) {
      alert("방 이름을 입력해주세요.");
      return;
    }

    if (!roomLocation) {
      alert("위치 정보를 가져올 수 없습니다. 위치 권한을 확인해주세요.");
      return;
    }

    if (distanceInfo && !distanceInfo.allowed) {
      alert(distanceInfo.reason);
      return;
    }

    setIsCreating(true);

    try {
      const room = await createRoomInDB(
        userId,
        userName,
        roomName.trim(),
        roomLocation,
        {
          password: usePassword ? password : undefined,
          visibility,
          settings,
        }
      );

      setCurrentRoom(room);
      setIsHost(true);
      router.push(`/room/${room.code}`);
    } catch (error) {
      console.error("방 생성 실패:", error);
      alert("방 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsCreating(false);
    }
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  return (
    <main className="min-h-screen p-4 safe-area-top safe-area-bottom">
      {/* 헤더 */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          ← 뒤로
        </Button>
        <h1 className="text-2xl font-bold text-white ml-2">방 만들기</h1>
      </div>

      <div className="max-w-lg mx-auto space-y-6">
        {/* 위치 선택 */}
        <Card variant="glass" padding="lg">
          <h2 className="text-lg font-semibold text-white mb-4">📍 게임 위치</h2>

          {locationError ? (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-400 text-sm">
              ⚠️ {locationError}
            </div>
          ) : locationLoading || !roomLocation ? (
            <div className="h-48 flex items-center justify-center bg-gray-800/50 rounded-xl">
              <p className="text-gray-400">위치를 가져오는 중...</p>
            </div>
          ) : (
            <>
              <div className="h-48 rounded-xl overflow-hidden mb-3">
                <GameMap
                  center={roomLocation}
                  boundaryRadius={settings.boundaryRadius}
                  onMapClick={isSelectingLocation ? handleMapClick : undefined}
                  className="h-full"
                />
              </div>

              {/* 거리 정보 */}
              {distanceInfo && distanceInfo.distance > 0 && (
                <div className={`p-3 rounded-xl mb-3 ${
                  distanceInfo.allowed
                    ? distanceInfo.isRemote
                      ? "bg-yellow-500/20 border border-yellow-500/50"
                      : "bg-green-500/20 border border-green-500/50"
                    : "bg-red-500/20 border border-red-500/50"
                }`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${
                      distanceInfo.allowed
                        ? distanceInfo.isRemote ? "text-yellow-400" : "text-green-400"
                        : "text-red-400"
                    }`}>
                      현재 위치에서 {formatDistance(distanceInfo.distance)}
                    </span>
                    {distanceInfo.isRemote && distanceInfo.allowed && (
                      <span className="text-xs text-yellow-400">
                        원격 생성 {distanceInfo.remainingFree}회 남음
                      </span>
                    )}
                  </div>
                  {!distanceInfo.allowed && distanceInfo.reason && (
                    <p className="text-red-400 text-xs mt-1">{distanceInfo.reason}</p>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant={isSelectingLocation ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setIsSelectingLocation(!isSelectingLocation)}
                >
                  {isSelectingLocation ? "📍 지도에서 선택하세요" : "🗺️ 다른 위치 선택"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => userLocation && setRoomLocation(userLocation)}
                >
                  📍 현재 위치
                </Button>
              </div>
            </>
          )}
        </Card>

        {/* 기본 설정 */}
        <Card variant="glass" padding="lg">
          <h2 className="text-lg font-semibold text-white mb-4">📝 기본 설정</h2>

          <div className="space-y-4">
            <Input
              label="방 이름"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="방 이름을 입력하세요"
              maxLength={30}
            />

            {/* 공개 설정 */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">공개 설정</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setVisibility("public")}
                  className={`p-3 rounded-xl border text-sm transition-all ${
                    visibility === "public"
                      ? "border-green-500 bg-green-500/20 text-green-400"
                      : "border-gray-700 bg-gray-800/50 text-gray-400"
                  }`}
                >
                  🌐 공개
                  <p className="text-xs mt-1 opacity-70">누구나 검색</p>
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility("private")}
                  className={`p-3 rounded-xl border text-sm transition-all ${
                    visibility === "private"
                      ? "border-blue-500 bg-blue-500/20 text-blue-400"
                      : "border-gray-700 bg-gray-800/50 text-gray-400"
                  }`}
                >
                  🔒 비공개
                  <p className="text-xs mt-1 opacity-70">코드로만 입장</p>
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility("friends")}
                  className={`p-3 rounded-xl border text-sm transition-all ${
                    visibility === "friends"
                      ? "border-purple-500 bg-purple-500/20 text-purple-400"
                      : "border-gray-700 bg-gray-800/50 text-gray-400"
                  }`}
                >
                  👥 친구
                  <p className="text-xs mt-1 opacity-70">친구만 검색</p>
                </button>
              </div>
            </div>

            {/* 비밀번호 설정 */}
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                <input
                  type="checkbox"
                  checked={usePassword}
                  onChange={(e) => setUsePassword(e.target.checked)}
                  className="w-4 h-4 rounded bg-gray-700 border-gray-600"
                />
                비밀번호 사용
              </label>
              {usePassword && (
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호 입력"
                  maxLength={20}
                />
              )}
            </div>
          </div>
        </Card>

        {/* 인원 설정 */}
        <Card variant="glass" padding="lg">
          <h2 className="text-lg font-semibold text-white mb-4">👥 인원 설정</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                최대 인원: <span className="text-white font-bold">{settings.maxPlayers}명</span>
                <span className="text-gray-500 text-xs ml-2">({settingsLimits.maxPlayers.min}~{settingsLimits.maxPlayers.max}명)</span>
              </label>
              <input
                type="range"
                min={settingsLimits.maxPlayers.min}
                max={settingsLimits.maxPlayers.max}
                value={settings.maxPlayers}
                onChange={(e) => updateSetting("maxPlayers", Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                경찰 수: <span className="text-police-400 font-bold">{settings.policeCount}명</span>
                <span className="text-gray-500 text-xs ml-2">(도둑 {settings.maxPlayers - settings.policeCount}명)</span>
              </label>
              <input
                type="range"
                min={settingsLimits.policeCount.min}
                max={Math.min(settingsLimits.policeCount.max, Math.floor(settings.maxPlayers / 3))}
                value={settings.policeCount}
                onChange={(e) => updateSetting("policeCount", Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-1">권장: 전체 인원의 1/4~1/3</p>
            </div>
          </div>
        </Card>

        {/* 시간 설정 */}
        <Card variant="glass" padding="lg">
          <h2 className="text-lg font-semibold text-white mb-4">⏱️ 시간 설정</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                숨는 시간: <span className="text-yellow-400 font-bold">{settings.hidingTime}초</span>
                <span className="text-gray-500 text-xs ml-2">({settingsLimits.hidingTime.min}초~{settingsLimits.hidingTime.max / 60}분)</span>
              </label>
              <input
                type="range"
                min={settingsLimits.hidingTime.min}
                max={settingsLimits.hidingTime.max}
                step={10}
                value={settings.hidingTime}
                onChange={(e) => updateSetting("hidingTime", Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                게임 시간: <span className="text-green-400 font-bold">{settings.gameTime}분</span>
                <span className="text-gray-500 text-xs ml-2">({settingsLimits.gameTime.min}~{settingsLimits.gameTime.max}분)</span>
              </label>
              <input
                type="range"
                min={settingsLimits.gameTime.min}
                max={settingsLimits.gameTime.max}
                step={5}
                value={settings.gameTime}
                onChange={(e) => updateSetting("gameTime", Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </Card>

        {/* 공간 설정 */}
        <Card variant="glass" padding="lg">
          <h2 className="text-lg font-semibold text-white mb-4">🗺️ 공간 설정</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                활동 반경: <span className="text-blue-400 font-bold">{settings.boundaryRadius}m</span>
                <span className="text-gray-500 text-xs ml-2">({settingsLimits.boundaryRadius.min}m~{settingsLimits.boundaryRadius.max / 1000}km)</span>
              </label>
              <input
                type="range"
                min={settingsLimits.boundaryRadius.min}
                max={settingsLimits.boundaryRadius.max}
                step={50}
                value={settings.boundaryRadius}
                onChange={(e) => updateSetting("boundaryRadius", Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-1">
                {settings.boundaryRadius <= 200 ? "🏫 교실/소규모" :
                 settings.boundaryRadius <= 400 ? "🏟️ 운동장 크기" :
                 settings.boundaryRadius <= 700 ? "🌳 공원 크기" : "🏘️ 동네 크기"}
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                자동 탈락 거리: <span className="text-red-400 font-bold">{settings.autoEliminationDistance}m</span>
                <span className="text-gray-500 text-xs ml-2">(경계 밖 {settings.autoEliminationDistance}m 이상 시 탈락)</span>
              </label>
              <input
                type="range"
                min={settingsLimits.autoEliminationDistance.min}
                max={settingsLimits.autoEliminationDistance.max}
                step={10}
                value={settings.autoEliminationDistance}
                onChange={(e) => updateSetting("autoEliminationDistance", Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </Card>

        {/* 구출 룰 */}
        <Card variant="glass" padding="lg">
          <h2 className="text-lg font-semibold text-white mb-4">⛓️ 구출 룰</h2>

          <div className="space-y-4">
            <label className="flex items-center gap-3 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={settings.rescueEnabled}
                onChange={(e) => updateSetting("rescueEnabled", e.target.checked)}
                className="w-5 h-5 rounded bg-gray-700 border-gray-600"
              />
              <div>
                <span className="text-white">구출 가능</span>
                <p className="text-xs text-gray-500">체포된 도둑을 구출할 수 있습니다</p>
              </div>
            </label>

            {settings.rescueEnabled && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateSetting("rescueMethod", "touch")}
                  className={`p-3 rounded-xl border text-sm ${
                    settings.rescueMethod === "touch"
                      ? "border-blue-500 bg-blue-500/20 text-blue-400"
                      : "border-gray-700 bg-gray-800/50 text-gray-400"
                  }`}
                >
                  👆 터치 구출
                </button>
                <button
                  type="button"
                  onClick={() => updateSetting("rescueMethod", "dabanggu")}
                  className={`p-3 rounded-xl border text-sm ${
                    settings.rescueMethod === "dabanggu"
                      ? "border-blue-500 bg-blue-500/20 text-blue-400"
                      : "border-gray-700 bg-gray-800/50 text-gray-400"
                  }`}
                >
                  📢 다방구
                </button>
              </div>
            )}
          </div>
        </Card>

        {/* 생성 버튼 */}
        <Button
          variant="police"
          size="lg"
          fullWidth
          isLoading={isCreating}
          onClick={handleCreate}
          disabled={!roomLocation || Boolean(distanceInfo && !distanceInfo.allowed)}
        >
          🎮 방 만들기
        </Button>
      </div>
    </main>
  );
}

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
    <main className="min-h-screen bg-gray-50 p-4 safe-area-top safe-area-bottom">
      {/* 헤더 */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          ← 뒤로
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 ml-2">방 만들기</h1>
      </div>

      <div className="max-w-lg mx-auto space-y-4">
        {/* 위치 선택 */}
        <Card padding="lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📍 게임 위치</h2>

          {locationError ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
              ⚠️ {locationError}
            </div>
          ) : locationLoading || !roomLocation ? (
            <div className="h-48 flex items-center justify-center bg-gray-100 rounded-xl">
              <p className="text-gray-500">위치를 가져오는 중...</p>
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
                      ? "bg-yellow-50 border border-yellow-200"
                      : "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${
                      distanceInfo.allowed
                        ? distanceInfo.isRemote ? "text-yellow-700" : "text-green-700"
                        : "text-red-700"
                    }`}>
                      현재 위치에서 {formatDistance(distanceInfo.distance)}
                    </span>
                    {distanceInfo.isRemote && distanceInfo.allowed && (
                      <span className="text-xs text-yellow-700">
                        원격 생성 {distanceInfo.remainingFree}회 남음
                      </span>
                    )}
                  </div>
                  {!distanceInfo.allowed && distanceInfo.reason && (
                    <p className="text-red-600 text-xs mt-1">{distanceInfo.reason}</p>
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
        <Card padding="lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📝 기본 설정</h2>

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
              <label className="block text-sm text-gray-700 mb-2 font-medium">공개 설정</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setVisibility("public")}
                  className={`p-3 rounded-xl border text-sm transition-all ${
                    visibility === "public"
                      ? "border-green-500 bg-green-50 text-green-700 font-semibold"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
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
                      ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
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
                      ? "border-purple-500 bg-purple-50 text-purple-700 font-semibold"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  👥 친구
                  <p className="text-xs mt-1 opacity-70">친구만 검색</p>
                </button>
              </div>
            </div>

            {/* 비밀번호 설정 */}
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                <input
                  type="checkbox"
                  checked={usePassword}
                  onChange={(e) => setUsePassword(e.target.checked)}
                  className="w-4 h-4 rounded bg-white border-gray-300"
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
        <Card padding="lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">👥 인원 설정</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                최대 인원: <span className="text-gray-900 font-bold">{settings.maxPlayers}명</span>
                <span className="text-gray-500 text-xs ml-2">({settingsLimits.maxPlayers.min}~{settingsLimits.maxPlayers.max}명)</span>
              </label>
              <input
                type="range"
                min={settingsLimits.maxPlayers.min}
                max={settingsLimits.maxPlayers.max}
                value={settings.maxPlayers}
                onChange={(e) => updateSetting("maxPlayers", Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                경찰 수: <span className="text-blue-600 font-bold">{settings.policeCount}명</span>
                <span className="text-gray-500 text-xs ml-2">(도둑 {settings.maxPlayers - settings.policeCount}명)</span>
              </label>
              <input
                type="range"
                min={settingsLimits.policeCount.min}
                max={Math.min(settingsLimits.policeCount.max, Math.floor(settings.maxPlayers / 2))}
                value={settings.policeCount}
                onChange={(e) => updateSetting("policeCount", Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-xs text-gray-500 mt-1">최대: 전체 인원의 50%</p>
            </div>
          </div>
        </Card>

        {/* 시간 설정 */}
        <Card padding="lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">⏱️ 시간 설정</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                숨는 시간: <span className="text-yellow-600 font-bold">{settings.hidingTime}초</span>
                <span className="text-gray-500 text-xs ml-2">(10초~2분)</span>
              </label>
              <input
                type="range"
                min={settingsLimits.hidingTime.min}
                max={settingsLimits.hidingTime.max}
                step={10}
                value={settings.hidingTime}
                onChange={(e) => updateSetting("hidingTime", Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-600"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                게임 시간: <span className="text-green-600 font-bold">{settings.gameTime}분</span>
                <span className="text-gray-500 text-xs ml-2">({settingsLimits.gameTime.min}~{settingsLimits.gameTime.max}분)</span>
              </label>
              <input
                type="range"
                min={settingsLimits.gameTime.min}
                max={settingsLimits.gameTime.max}
                step={1}
                value={settings.gameTime}
                onChange={(e) => updateSetting("gameTime", Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
            </div>
          </div>
        </Card>

        {/* 공간 설정 */}
        <Card padding="lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🗺️ 공간 설정</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                활동 반경: <span className="text-blue-600 font-bold">{settings.boundaryRadius}m</span>
                <span className="text-gray-500 text-xs ml-2">({settingsLimits.boundaryRadius.min}m~{settingsLimits.boundaryRadius.max / 1000}km)</span>
              </label>
              <input
                type="range"
                min={settingsLimits.boundaryRadius.min}
                max={settingsLimits.boundaryRadius.max}
                step={50}
                value={settings.boundaryRadius}
                onChange={(e) => updateSetting("boundaryRadius", Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-xs text-gray-600 mt-1">
                {settings.boundaryRadius <= 200 ? "🏫 교실/소규모" :
                 settings.boundaryRadius <= 400 ? "🏟️ 운동장 크기" :
                 settings.boundaryRadius <= 700 ? "🌳 공원 크기" : "🏘️ 동네 크기"}
              </p>
            </div>

            <div>
              <label className="flex items-center gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={settings.autoEliminationEnabled !== false}
                  onChange={(e) => updateSetting("autoEliminationEnabled", e.target.checked)}
                  className="w-5 h-5 rounded bg-white border-gray-300 accent-blue-600"
                />
                <div>
                  <span className="text-gray-900 font-medium">자동 탈락 (경계 밖 100m)</span>
                  <p className="text-xs text-gray-600">활동 반경을 100m 이상 벗어나면 자동 탈락</p>
                </div>
              </label>
            </div>
          </div>
        </Card>

        {/* 구출 룰 */}
        <Card padding="lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">⛓️ 구출 룰</h2>

          <div className="space-y-4">
            <label className="flex items-center gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={settings.rescueEnabled}
                onChange={(e) => updateSetting("rescueEnabled", e.target.checked)}
                className="w-5 h-5 rounded bg-white border-gray-300 accent-blue-600"
              />
              <div>
                <span className="text-gray-900 font-medium">👆 터치 구출 가능</span>
                <p className="text-xs text-gray-600">감옥에 있는 동료를 터치하여 구출할 수 있습니다</p>
              </div>
            </label>
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

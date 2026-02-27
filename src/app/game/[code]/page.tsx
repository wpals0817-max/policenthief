"use client";

import { useState, useEffect, useCallback, use, useRef } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Timer from "@/components/Timer";
import PlayerList from "@/components/PlayerList";
import GameMap from "@/components/GameMap";
import { useGameStore } from "@/store/gameStore";
import { useGeolocation, calculateDistance, isWithinBoundary } from "@/hooks/useGeolocation";
import { formatDistance, formatSpeed } from "@/lib/roomUtils";
import {
  updatePlayerLocation,
  updatePlayerStatus,
  initializePlayer,
  subscribeToPlayerLocations,
  subscribeToPlayerStatuses,
} from "@/lib/realtimeService";
import type { Player, TeamType, GameStatus, Location } from "@/types";

// 게임 상수
const CATCH_DISTANCE = 5; // 5미터 이내 자동 체포
const RESCUE_DISTANCE = 3; // 3미터 이내 자동 구출
const OUT_OF_BOUNDS_LIMIT = 15; // 15초 이상 경계 밖 시 탈락
const DISTANCE_CHECK_INTERVAL = 2000; // 2초마다 거리 체크
const LOCATION_UPDATE_THROTTLE = 3000; // 3초마다 위치 업데이트

export default function GamePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const {
    userId,
    currentRoom,
    currentPlayer,
    setCurrentRoom,
    setCurrentPlayer,
    locationHistory,
    addLocationToHistory,
    clearLocationHistory,
  } = useGameStore();

  const {
    location,
    isTracking,
    startTracking,
    stopTracking,
    calculateTotalDistance,
  } = useGeolocation({ enableHighAccuracy: true });

  const [gameStatus, setGameStatus] = useState<GameStatus>("hiding");
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showPlayerList, setShowPlayerList] = useState(false);
  const [outOfBoundsWarning, setOutOfBoundsWarning] = useState(false);
  const [outOfBoundsDuration, setOutOfBoundsDuration] = useState(0);
  const [otherPlayersLocations, setOtherPlayersLocations] = useState<Record<string, Location>>({});
  
  const lastLocationUpdateRef = useRef<number>(0);
  const unsubscribeLocationsRef = useRef<(() => void) | null>(null);
  const unsubscribeStatusesRef = useRef<(() => void) | null>(null);

  // Firebase Realtime Database 구독 및 플레이어 초기화
  useEffect(() => {
    if (!currentRoom || !currentPlayer || !userId) return;
    
    // 플레이어 초기화
    initializePlayer(code, currentPlayer).catch((error) => {
      console.error("Failed to initialize player:", error);
      addNotification("⚠️ 서버 연결에 실패했습니다");
    });

    // 다른 플레이어 위치 구독
    unsubscribeLocationsRef.current = subscribeToPlayerLocations(
      code,
      (locations) => {
        // 자신을 제외한 위치만 저장
        const others: Record<string, Location> = {};
        Object.entries(locations).forEach(([playerId, loc]) => {
          if (playerId !== userId) {
            others[playerId] = loc;
          }
        });
        setOtherPlayersLocations(others);
      }
    );

    // 플레이어 상태 구독
    unsubscribeStatusesRef.current = subscribeToPlayerStatuses(
      code,
      (statuses) => {
        if (!currentRoom) return;
        
        const updatedPlayers = { ...currentRoom.players };
        let hasChanges = false;

        Object.entries(statuses).forEach(([playerId, status]) => {
          if (updatedPlayers[playerId] && updatedPlayers[playerId].status !== status) {
            updatedPlayers[playerId] = {
              ...updatedPlayers[playerId],
              status,
            };
            hasChanges = true;

            // 자신의 상태가 변경되면 업데이트
            if (playerId === userId && currentPlayer) {
              setCurrentPlayer({ ...currentPlayer, status });
            }
          }
        });

        if (hasChanges) {
          setCurrentRoom({
            ...currentRoom,
            players: updatedPlayers,
          });
        }
      }
    );

    // 정리 함수
    return () => {
      if (unsubscribeLocationsRef.current) {
        unsubscribeLocationsRef.current();
      }
      if (unsubscribeStatusesRef.current) {
        unsubscribeStatusesRef.current();
      }
    };
  }, [code, currentRoom?.code, userId]); // 의존성을 최소화

  // 자신의 위치를 Firebase에 업데이트 (쓰로틀링 적용)
  useEffect(() => {
    if (!location || !currentRoom || !userId) return;
    if (gameStatus !== "hiding" && gameStatus !== "playing") return;

    const now = Date.now();
    if (now - lastLocationUpdateRef.current < LOCATION_UPDATE_THROTTLE) return;

    lastLocationUpdateRef.current = now;
    
    updatePlayerLocation(code, userId, location).catch((error) => {
      console.error("Failed to update location:", error);
    });
  }, [location, code, userId, gameStatus, currentRoom]);

  // 게임 시작 시 위치 추적 시작
  useEffect(() => {
    if (currentRoom?.status === "hiding" || currentRoom?.status === "playing") {
      clearLocationHistory();
      startTracking((loc) => {
        addLocationToHistory(loc);
      });
    }

    return () => {
      stopTracking();
    };
  }, [currentRoom?.status]);

  // 경계 이탈 체크 (1초마다)
  useEffect(() => {
    if (gameStatus !== "playing" || !currentRoom || !location || !currentRoom.centerLocation) {
      return;
    }

    const interval = setInterval(() => {
      if (!location || !currentRoom.centerLocation) return;

      const withinBoundary = isWithinBoundary(
        location,
        currentRoom.centerLocation,
        currentRoom.settings.boundaryRadius + currentRoom.settings.autoEliminationDistance
      );

      if (!withinBoundary) {
        setOutOfBoundsDuration((prev) => {
          const newDuration = prev + 1;
          
          if (newDuration >= OUT_OF_BOUNDS_LIMIT) {
            handleElimination();
            return 0;
          }
          
          if (newDuration === 5) {
            addNotification("⚠️ 경계를 벗어나고 있습니다! 10초 안에 돌아오세요!");
          } else if (newDuration === 10) {
            addNotification("🚨 5초 안에 돌아오지 않으면 탈락합니다!");
          }
          
          return newDuration;
        });
        setOutOfBoundsWarning(true);
      } else {
        setOutOfBoundsDuration(0);
        setOutOfBoundsWarning(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStatus, location, currentRoom]);

  // 거리 기반 자동 체포/구출 체크 (2초마다)
  useEffect(() => {
    if (gameStatus !== "playing" || !currentPlayer || !location) return;

    const interval = setInterval(() => {
      if (currentPlayer.team === "police" && currentPlayer.status === "alive") {
        checkAutoCatch();
      } else if (currentPlayer.team === "thief" && currentPlayer.status === "alive") {
        checkAutoRescue();
      }
    }, DISTANCE_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [gameStatus, currentPlayer, location, otherPlayersLocations, currentRoom]);

  // 게임 상태 동기화
  useEffect(() => {
    if (currentRoom) {
      setGameStatus(currentRoom.status);
    }
  }, [currentRoom?.status]);

  // 자동 체포 체크
  const checkAutoCatch = useCallback(() => {
    if (!currentPlayer || !location || !currentRoom) return;
    if (currentPlayer.team !== "police" || currentPlayer.status !== "alive") return;

    const players = Object.values(currentRoom.players);
    
    players.forEach((thief) => {
      if (thief.team !== "thief" || thief.status !== "alive") return;
      
      const thiefLocation = otherPlayersLocations[thief.id];
      if (!thiefLocation) return;

      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        thiefLocation.latitude,
        thiefLocation.longitude
      );

      if (distance <= CATCH_DISTANCE) {
        handleCatch(thief);
      }
    });
  }, [currentPlayer, location, otherPlayersLocations, currentRoom]);

  // 자동 구출 체크
  const checkAutoRescue = useCallback(() => {
    if (!currentPlayer || !location || !currentRoom) return;
    if (currentPlayer.team !== "thief" || currentPlayer.status !== "alive") return;
    if (!currentRoom.settings.rescueEnabled || !currentRoom.settings.jailLocation) return;

    const distanceToJail = calculateDistance(
      location.latitude,
      location.longitude,
      currentRoom.settings.jailLocation.latitude,
      currentRoom.settings.jailLocation.longitude
    );

    if (distanceToJail <= RESCUE_DISTANCE) {
      const players = Object.values(currentRoom.players);
      const caughtThieves = players.filter(
        (p) => p.team === "thief" && p.status === "caught"
      );

      if (caughtThieves.length > 0) {
        if (currentRoom.settings.rescueMethod === "dabanggu") {
          // 다방구 UI 표시 (수동 선택)
          setShowPlayerList(true);
        } else {
          // 자동 구출 (모든 잡힌 도둑)
          caughtThieves.forEach((thief) => handleRescue(thief));
        }
      }
    }
  }, [currentPlayer, location, currentRoom]);

  // 탈락 처리
  const handleElimination = useCallback(() => {
    if (!currentPlayer || !currentRoom || !userId) return;

    const updatedPlayer = {
      ...currentPlayer,
      status: "disconnected" as const,
    };

    setCurrentPlayer(updatedPlayer);

    updatePlayerStatus(code, userId, "disconnected").catch((error) => {
      console.error("Failed to update player status:", error);
    });

    const updatedPlayers = {
      ...currentRoom.players,
      [userId]: updatedPlayer,
    };

    setCurrentRoom({
      ...currentRoom,
      players: updatedPlayers,
    });

    addNotification("🚫 경계를 벗어나 탈락했습니다!");
  }, [currentPlayer, currentRoom, userId, code]);

  // 알림 추가
  const addNotification = useCallback((message: string) => {
    setNotifications((prev) => {
      // 중복 알림 방지
      if (prev.includes(message)) return prev;
      return [...prev, message];
    });
    
    setTimeout(() => {
      setNotifications((prev) => prev.filter((m) => m !== message));
    }, 3000);
  }, []);

  // 숨는 시간 종료
  const handleHidingTimeUp = useCallback(() => {
    if (!currentRoom) return;

    setCurrentRoom({
      ...currentRoom,
      status: "playing",
    });

    addNotification("🚨 추격전 시작! 경찰이 출동합니다!");
  }, [currentRoom, setCurrentRoom, addNotification]);

  // 게임 시간 종료
  const handleGameTimeUp = useCallback(() => {
    if (!currentRoom) return;

    // 살아남은 도둑 수 확인
    const aliveThieves = Object.values(currentRoom.players).filter(
      (p) => p.team === "thief" && p.status === "alive"
    );

    const winner: TeamType = aliveThieves.length > 0 ? "thief" : "police";

    setCurrentRoom({
      ...currentRoom,
      status: "finished",
      finishedAt: Date.now(),
      winner,
    });

    router.push(`/result/${code}`);
  }, [currentRoom, setCurrentRoom, router, code]);

  // 체포 (경찰 전용)
  const handleCatch = useCallback((targetPlayer: Player) => {
    if (!currentRoom || !currentPlayer || currentPlayer.team !== "police") return;
    if (targetPlayer.team !== "thief" || targetPlayer.status !== "alive") return;

    const updatedPlayers = { ...currentRoom.players };
    updatedPlayers[targetPlayer.id] = {
      ...targetPlayer,
      status: "caught",
    };

    // Firebase에 상태 업데이트
    updatePlayerStatus(code, targetPlayer.id, "caught").catch((error) => {
      console.error("Failed to update catch status:", error);
    });

    // 자신의 체포 카운트 증가
    if (currentPlayer.catches !== undefined) {
      updatedPlayers[currentPlayer.id] = {
        ...currentPlayer,
        catches: currentPlayer.catches + 1,
      };
      setCurrentPlayer(updatedPlayers[currentPlayer.id]);
    }

    setCurrentRoom({
      ...currentRoom,
      players: updatedPlayers,
    });

    addNotification(`🚔 ${targetPlayer.name}을(를) 체포했습니다!`);

    // 모든 도둑이 잡혔는지 확인
    const remainingThieves = Object.values(updatedPlayers).filter(
      (p) => p.team === "thief" && p.status === "alive"
    );

    if (remainingThieves.length === 0) {
      setCurrentRoom({
        ...currentRoom,
        players: updatedPlayers,
        status: "finished",
        finishedAt: Date.now(),
        winner: "police",
      });
      router.push(`/result/${code}`);
    }
  }, [currentRoom, currentPlayer, setCurrentRoom, setCurrentPlayer, addNotification, router, code]);

  // 구출 (도둑 전용)
  const handleRescue = useCallback((targetPlayer: Player) => {
    if (!currentRoom || !currentPlayer || currentPlayer.team !== "thief") return;
    if (currentPlayer.status !== "alive") return;
    if (targetPlayer.status !== "caught") return;
    if (!currentRoom.settings.rescueEnabled) return;

    const updatedPlayers = { ...currentRoom.players };
    updatedPlayers[targetPlayer.id] = {
      ...targetPlayer,
      status: "alive",
    };

    // Firebase에 상태 업데이트
    updatePlayerStatus(code, targetPlayer.id, "alive").catch((error) => {
      console.error("Failed to update rescue status:", error);
    });

    // 자신의 구출 카운트 증가
    if (currentPlayer.rescues !== undefined) {
      updatedPlayers[currentPlayer.id] = {
        ...currentPlayer,
        rescues: currentPlayer.rescues + 1,
      };
      setCurrentPlayer(updatedPlayers[currentPlayer.id]);
    }

    setCurrentRoom({
      ...currentRoom,
      players: updatedPlayers,
    });

    addNotification(`🦸 ${targetPlayer.name}을(를) 구출했습니다!`);
  }, [currentRoom, currentPlayer, setCurrentRoom, setCurrentPlayer, addNotification, code]);

  if (!currentRoom || !currentPlayer) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card padding="lg" className="text-center">
          <p className="text-gray-600">게임 정보를 불러오는 중...</p>
        </Card>
      </main>
    );
  }

  const players = Object.values(currentRoom.players);
  const myTeam = currentPlayer.team;
  const isCaught = currentPlayer.status === "caught";
  const isEliminated = currentPlayer.status === "disconnected";
  const isPolice = myTeam === "police";

  const aliveThieves = players.filter((p) => p.team === "thief" && p.status === "alive").length;
  const caughtThieves = players.filter((p) => p.team === "thief" && p.status === "caught").length;
  const totalThieves = players.filter((p) => p.team === "thief").length;

  const totalDistance = calculateTotalDistance();
  const gameStartTime = currentRoom.startedAt || Date.now();
  const elapsedSeconds = Math.floor((Date.now() - gameStartTime) / 1000);
  const avgSpeed = elapsedSeconds > 0 ? totalDistance / elapsedSeconds : 0;

  // 플레이어 위치 정보 병합 (자신의 위치 + 다른 플레이어 위치)
  const playersWithLocations = players.map((p) => ({
    ...p,
    location: p.id === userId ? location || undefined : otherPlayersLocations[p.id],
  }));

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      {/* 알림 */}
      <div className="fixed top-4 left-0 right-0 z-50 flex flex-col items-center gap-2 px-4">
        {notifications.map((msg, i) => (
          <div
            key={`${msg}-${i}`}
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm shadow-lg animate-in fade-in slide-in-from-top duration-300 font-medium"
          >
            {msg}
          </div>
        ))}
      </div>

      {/* 경계 이탈 경고 */}
      {outOfBoundsWarning && !isEliminated && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white py-3 px-4 text-center z-40 animate-pulse font-semibold">
          ⚠️ 경계 이탈! {OUT_OF_BOUNDS_LIMIT - outOfBoundsDuration}초 안에 돌아오세요!
        </div>
      )}

      {/* 상단 상태바 */}
      <div className={`p-4 ${isPolice ? "bg-blue-600" : "bg-red-600"} text-white shadow-md`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{isPolice ? "🚔" : "🏃"}</span>
            <div>
              <p className="text-white font-bold">
                {currentPlayer.name}
                {isCaught && <span className="text-red-200 ml-2">⛓️ 체포됨</span>}
                {isEliminated && <span className="text-gray-300 ml-2">🚫 탈락</span>}
              </p>
              <p className={`text-sm ${isPolice ? "text-blue-100" : "text-red-100"}`}>
                {isPolice ? "경찰" : "도둑"}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-white/80 text-xs">
              {gameStatus === "hiding" ? "숨는 시간" : "남은 시간"}
            </p>
            <Timer
              initialSeconds={
                gameStatus === "hiding"
                  ? currentRoom.settings.hidingTime
                  : currentRoom.settings.gameTime * 60
              }
              isRunning={gameStatus !== "finished"}
              onTimeUp={gameStatus === "hiding" ? handleHidingTimeUp : handleGameTimeUp}
              variant="compact"
            />
          </div>
        </div>

        {/* 진행 상황 */}
        <div className="flex gap-4 text-sm text-white/90">
          <div className="flex items-center gap-1">
            <span className="text-green-200">🏃 {aliveThieves}</span>
            <span className="text-white/60">/</span>
            <span className="text-orange-200">⛓️ {caughtThieves}</span>
            <span className="text-white/60">/</span>
            <span className="text-white/80">{totalThieves}</span>
          </div>
          <div className="text-white/80">
            📏 {formatDistance(totalDistance)}
          </div>
          <div className="text-white/80">
            ⚡ {formatSpeed(avgSpeed)}
          </div>
        </div>
      </div>

      {/* 지도 */}
      <div className="flex-1 relative">
        {currentRoom.centerLocation && (
          <GameMap
            center={currentRoom.centerLocation}
            boundaryRadius={currentRoom.settings.boundaryRadius}
            players={playersWithLocations}
            currentUserId={userId || undefined}
            jailLocation={currentRoom.settings.jailLocation}
            showRoute={true}
            routeLocations={locationHistory}
            className="h-full"
          />
        )}

        {/* 숨는 시간 오버레이 */}
        {gameStatus === "hiding" && (
          <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-4">
            <div className="text-center max-w-md">
              {isPolice ? (
                <>
                  <div className="text-6xl mb-4">🙈</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">눈을 감고 기다리세요</h2>
                  <p className="text-gray-600">도둑들이 숨을 시간을 주세요</p>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">🏃💨</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">빨리 숨으세요!</h2>
                  <p className="text-gray-600">경찰이 곧 출동합니다</p>
                </>
              )}
              <Timer
                initialSeconds={currentRoom.settings.hidingTime}
                isRunning={true}
                onTimeUp={handleHidingTimeUp}
                variant="large"
                showProgress
              />
            </div>
          </div>
        )}

        {/* 체포됨 오버레이 */}
        {isCaught && gameStatus === "playing" && (
          <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-4">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-4">⛓️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">체포되었습니다</h2>
              <p className="text-gray-600 mb-4">
                {currentRoom.settings.rescueEnabled
                  ? "동료가 구출해줄 때까지 기다리세요"
                  : "게임이 끝날 때까지 기다리세요"}
              </p>
              <Card padding="md" className="max-w-xs mx-auto">
                <p className="text-gray-700 text-sm">
                  감옥 위치로 이동하여 대기하세요
                </p>
              </Card>
            </div>
          </div>
        )}

        {/* 탈락 오버레이 */}
        {isEliminated && gameStatus === "playing" && (
          <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-4">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-4">🚫</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">탈락하였습니다</h2>
              <p className="text-gray-600 mb-4">
                경계를 벗어나 게임에서 제외되었습니다
              </p>
              <Card padding="md" className="max-w-xs mx-auto">
                <p className="text-gray-700 text-sm">
                  게임이 끝날 때까지 관전 모드로 전환됩니다
                </p>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* 하단 액션 영역 */}
      <div className={`p-4 ${isPolice ? "bg-blue-600" : "bg-red-600"} text-white shadow-[0_-2px_8px_rgba(0,0,0,0.1)]`}>
        {gameStatus === "playing" && !isCaught && !isEliminated && (
          <div className="flex gap-3">
            {isPolice ? (
              // 경찰 액션
              <Button
                variant="police"
                size="lg"
                fullWidth
                onClick={() => setShowPlayerList(true)}
              >
                🚔 수동 체포하기
              </Button>
            ) : (
              // 도둑 액션
              currentRoom.settings.rescueEnabled && caughtThieves > 0 && (
                <Button
                  variant="thief"
                  size="lg"
                  fullWidth
                  onClick={() => setShowPlayerList(true)}
                >
                  🦸 동료 구출하기
                </Button>
              )
            )}
          </div>
        )}

        {/* 숨는 시간에는 액션 없음 */}
        {gameStatus === "hiding" && (
          <p className="text-center text-white/80">
            {isPolice ? "도둑들이 숨을 때까지 기다리세요..." : "빨리 숨으세요!"}
          </p>
        )}

        {/* 탈락 또는 체포 시 */}
        {(isCaught || isEliminated) && gameStatus === "playing" && (
          <p className="text-center text-white/80">
            {isCaught ? "동료의 구출을 기다리는 중..." : "게임 관전 중..."}
          </p>
        )}
      </div>

      {/* 플레이어 선택 모달 */}
      {showPlayerList && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center"
          onClick={() => setShowPlayerList(false)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-t-3xl p-4 max-h-[70vh] overflow-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {isPolice ? "🚔 체포할 도둑 선택" : "🦸 구출할 동료 선택"}
            </h2>

            <PlayerList
              players={players.filter((p) =>
                isPolice
                  ? p.team === "thief" && p.status === "alive"
                  : p.team === "thief" && p.status === "caught" && p.id !== userId
              )}
              currentUserId={userId || undefined}
              showTeam
              showStatus
              onPlayerClick={(player) => {
                if (isPolice) {
                  handleCatch(player);
                } else {
                  handleRescue(player);
                }
                setShowPlayerList(false);
              }}
            />

            <Button
              variant="ghost"
              fullWidth
              className="mt-4"
              onClick={() => setShowPlayerList(false)}
            >
              취소
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}

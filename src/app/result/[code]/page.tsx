"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Card from "@/components/Card";
import PlayerList from "@/components/PlayerList";
import GameMap from "@/components/GameMap";
import CoupangBanner from "@/components/CoupangBanner";
import { useGameStore } from "@/store/gameStore";
import { useProfileStore } from "@/store/gameStore";
import { formatDistance, formatSpeed, formatGameTime } from "@/lib/roomUtils";

export default function ResultPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const { userId, currentRoom, currentPlayer, locationHistory, reset } = useGameStore();
  const { addGameRecord, updateStats } = useProfileStore();

  // 게임 기록 저장
  useEffect(() => {
    if (!currentRoom || !currentPlayer || currentRoom.status !== "finished") return;

    const duration = currentRoom.finishedAt && currentRoom.startedAt
      ? Math.floor((currentRoom.finishedAt - currentRoom.startedAt) / 1000)
      : 0;

    // 이동 거리 계산
    let totalDistance = 0;
    for (let i = 1; i < locationHistory.length; i++) {
      const prev = locationHistory[i - 1];
      const curr = locationHistory[i];
      const R = 6371e3;
      const φ1 = (prev.latitude * Math.PI) / 180;
      const φ2 = (curr.latitude * Math.PI) / 180;
      const Δφ = ((curr.latitude - prev.latitude) * Math.PI) / 180;
      const Δλ = ((curr.longitude - prev.longitude) * Math.PI) / 180;
      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      totalDistance += R * c;
    }

    const won = currentPlayer.team === currentRoom.winner;

    // 게임 기록 추가
    addGameRecord({
      id: `game_${Date.now()}`,
      date: Date.now(),
      roomName: currentRoom.name,
      team: currentPlayer.team!,
      result: won ? "win" : "lose",
      duration,
      distance: Math.round(totalDistance),
      catches: currentPlayer.catches,
      rescues: currentPlayer.rescues,
      route: locationHistory,
    });

    // 통계 업데이트
    updateStats(
      currentPlayer.team!,
      won,
      currentPlayer.catches,
      currentPlayer.rescues,
      duration,
      Math.round(totalDistance)
    );
  }, []);

  if (!currentRoom || currentRoom.status !== "finished") {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <Card variant="default" padding="lg" className="text-center">
          <p className="text-gray-400">결과를 불러오는 중...</p>
        </Card>
      </main>
    );
  }

  const players = Object.values(currentRoom.players);
  const winner = currentRoom.winner;
  const isWinner = currentPlayer?.team === winner;

  // 게임 시간 계산
  const duration = currentRoom.finishedAt && currentRoom.startedAt
    ? Math.floor((currentRoom.finishedAt - currentRoom.startedAt) / 1000)
    : 0;
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  // 이동 거리 계산
  let totalDistance = 0;
  for (let i = 1; i < locationHistory.length; i++) {
    const prev = locationHistory[i - 1];
    const curr = locationHistory[i];
    const R = 6371e3;
    const φ1 = (prev.latitude * Math.PI) / 180;
    const φ2 = (curr.latitude * Math.PI) / 180;
    const Δφ = ((curr.latitude - prev.latitude) * Math.PI) / 180;
    const Δλ = ((curr.longitude - prev.longitude) * Math.PI) / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    totalDistance += R * c;
  }

  const avgSpeed = duration > 0 ? totalDistance / duration : 0;

  // 팀별 통계
  const policeStats = players.filter((p) => p.team === "police");
  const thiefStats = players.filter((p) => p.team === "thief");
  const totalCatches = policeStats.reduce((sum, p) => sum + (p.catches || 0), 0);
  const totalRescues = thiefStats.reduce((sum, p) => sum + (p.rescues || 0), 0);
  const survivedThieves = thiefStats.filter((p) => p.status === "alive").length;

  const handleGoHome = () => {
    reset();
    router.push("/");
  };

  const handlePlayAgain = () => {
    // 같은 방에서 다시 플레이
    router.push(`/room/${code}`);
  };

  return (
    <main className="min-h-screen p-4 safe-area-top safe-area-bottom bg-gray-50">
      {/* 결과 헤더 */}
      <div className={`text-center py-8 rounded-2xl mb-6 ${
        winner === "police" ? "bg-police-100 border-2 border-police-300" : "bg-thief-100 border-2 border-thief-300"
      }`}>
        <div className="text-6xl mb-4">
          {winner === "police" ? "🚔" : "🏃"}
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {winner === "police" ? "경찰 팀 승리!" : "도둑 팀 승리!"}
        </h1>
        <p className={`text-lg ${isWinner ? "text-green-600" : "text-red-600"}`}>
          {isWinner ? "🎉 축하합니다! 승리했습니다!" : "😢 아쉽게 패배했습니다"}
        </p>
      </div>

      {/* 내 기록 */}
      <Card variant="default" padding="lg" className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 나의 기록</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-gray-600 text-sm mb-1">뛴 거리</p>
            <p className="text-2xl font-bold text-blue-600">{formatDistance(totalDistance)}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-gray-600 text-sm mb-1">평균 속도</p>
            <p className="text-2xl font-bold text-green-600">{formatSpeed(avgSpeed)}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-gray-600 text-sm mb-1">플레이 시간</p>
            <p className="text-2xl font-bold text-yellow-600">{minutes}:{seconds.toString().padStart(2, "0")}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-gray-600 text-sm mb-1">
              {currentPlayer?.team === "police" ? "체포 수" : "구출 수"}
            </p>
            <p className="text-2xl font-bold text-purple-600">
              {currentPlayer?.team === "police" ? currentPlayer?.catches || 0 : currentPlayer?.rescues || 0}
            </p>
          </div>
        </div>
      </Card>

      {/* 이동 경로 */}
      {currentRoom.centerLocation && locationHistory.length > 1 && (
        <Card variant="default" padding="none" className="mb-4 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">🗺️ 이동 경로</h2>
          </div>
          <div className="h-64">
            <GameMap
              center={currentRoom.centerLocation}
              boundaryRadius={currentRoom.settings.boundaryRadius}
              showRoute={true}
              routeLocations={locationHistory}
              className="h-full rounded-none"
            />
          </div>
        </Card>
      )}

      {/* 게임 통계 */}
      <Card variant="default" padding="lg" className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📈 게임 통계</h2>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-gray-600 text-sm mb-1">총 체포</p>
            <p className="text-xl font-bold text-police-600">{totalCatches}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm mb-1">총 구출</p>
            <p className="text-xl font-bold text-thief-600">{totalRescues}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm mb-1">생존 도둑</p>
            <p className="text-xl font-bold text-green-600">{survivedThieves}</p>
          </div>
        </div>
      </Card>

      {/* 최종 순위 */}
      <Card variant="default" padding="lg" className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">🏆 참가자</h2>

        <div className="space-y-3">
          <div>
            <h3 className="text-police-600 font-medium mb-2">경찰 팀</h3>
            <PlayerList
              players={policeStats.sort((a, b) => (b.catches || 0) - (a.catches || 0))}
              currentUserId={userId || undefined}
              showTeam
              showStatus
            />
          </div>

          <div className="h-px bg-gray-200" />

          <div>
            <h3 className="text-thief-600 font-medium mb-2">도둑 팀</h3>
            <PlayerList
              players={thiefStats.sort((a, b) => {
                if (a.status === "alive" && b.status !== "alive") return -1;
                if (a.status !== "alive" && b.status === "alive") return 1;
                return (b.rescues || 0) - (a.rescues || 0);
              })}
              currentUserId={userId || undefined}
              showTeam
              showStatus
            />
          </div>
        </div>
      </Card>

      {/* 버튼 */}
      <div className="space-y-3">
        <Button variant="primary" size="lg" fullWidth onClick={handlePlayAgain}>
          🔄 한 번 더 하기
        </Button>
        <Button variant="outline" size="lg" fullWidth onClick={handleGoHome}>
          🏠 홈으로
        </Button>
      </div>

      {/* 쿠팡 배너 */}
      <CoupangBanner position="bottom" className="mt-6" />
    </main>
  );
}

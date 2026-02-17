"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Card from "@/components/Card";
import { useGameStore, useProfileStore } from "@/store/gameStore";
import {
  formatDistance,
  formatGameTime,
  calculateWinRate,
  analyzePlayerStyle,
} from "@/lib/roomUtils";

export default function ProfilePage() {
  const router = useRouter();
  const { userName } = useGameStore();
  const { profile, gameHistory } = useProfileStore();

  // 통계 계산
  const totalGames = gameHistory.length;
  const wins = gameHistory.filter((g) => g.result === "win").length;
  const loses = totalGames - wins;
  const winRate = calculateWinRate(wins, totalGames);

  const policeGames = gameHistory.filter((g) => g.team === "police");
  const thiefGames = gameHistory.filter((g) => g.team === "thief");
  const policeWins = policeGames.filter((g) => g.result === "win").length;
  const thiefWins = thiefGames.filter((g) => g.result === "win").length;

  const totalDistance = gameHistory.reduce((sum, g) => sum + g.distance, 0);
  const totalDuration = gameHistory.reduce((sum, g) => sum + g.duration, 0);
  const totalCatches = gameHistory.reduce((sum, g) => sum + (g.catches || 0), 0);
  const totalRescues = gameHistory.reduce((sum, g) => sum + (g.rescues || 0), 0);

  const playerStyle = analyzePlayerStyle({
    policeGames: policeGames.length,
    policeWins,
    thiefGames: thiefGames.length,
    thiefWins,
    totalCatches,
    totalRescues,
  });

  return (
    <main className="min-h-screen p-4 safe-area-top safe-area-bottom">
      {/* 헤더 */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          ← 뒤로
        </Button>
        <h1 className="text-2xl font-bold text-white ml-2">내 프로필</h1>
      </div>

      {/* 프로필 카드 */}
      <Card variant="glass" padding="lg" className="mb-6">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-police-500 to-thief-500 mx-auto flex items-center justify-center text-4xl mb-4">
            {totalGames > 50 ? "🏆" : totalGames > 20 ? "⭐" : "👤"}
          </div>
          <h2 className="text-xl font-bold text-white">{userName || "플레이어"}</h2>
          <p className="text-gray-400 text-sm mt-1">{playerStyle}</p>
        </div>
      </Card>

      {/* 전체 통계 */}
      <Card variant="glass" padding="lg" className="mb-4">
        <h2 className="text-lg font-semibold text-white mb-4">📊 전체 통계</h2>

        <div className="grid grid-cols-3 gap-4 text-center mb-6">
          <div>
            <p className="text-3xl font-bold text-white">{totalGames}</p>
            <p className="text-gray-400 text-sm">총 게임</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-green-400">{wins}</p>
            <p className="text-gray-400 text-sm">승리</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-red-400">{loses}</p>
            <p className="text-gray-400 text-sm">패배</p>
          </div>
        </div>

        {/* 승률 바 */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">전체 승률</span>
            <span className="text-white font-bold">{winRate}%</span>
          </div>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
              style={{ width: `${winRate}%` }}
            />
          </div>
        </div>

        {/* 누적 기록 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-800/50 rounded-xl">
            <p className="text-gray-400 text-sm mb-1">총 이동 거리</p>
            <p className="text-xl font-bold text-blue-400">{formatDistance(totalDistance)}</p>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-xl">
            <p className="text-gray-400 text-sm mb-1">총 플레이 시간</p>
            <p className="text-xl font-bold text-yellow-400">{Math.round(totalDuration / 60)}분</p>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-xl">
            <p className="text-gray-400 text-sm mb-1">총 체포 수</p>
            <p className="text-xl font-bold text-police-400">{totalCatches}</p>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-xl">
            <p className="text-gray-400 text-sm mb-1">총 구출 수</p>
            <p className="text-xl font-bold text-thief-400">{totalRescues}</p>
          </div>
        </div>
      </Card>

      {/* 포지션별 통계 */}
      <Card variant="glass" padding="lg" className="mb-4">
        <h2 className="text-lg font-semibold text-white mb-4">🎭 포지션별 통계</h2>

        <div className="grid grid-cols-2 gap-4">
          {/* 경찰 */}
          <Card variant="police" padding="md">
            <div className="text-center">
              <div className="text-3xl mb-2">🚔</div>
              <p className="text-police-300 font-medium">경찰</p>
              <p className="text-2xl font-bold text-white mt-2">{policeGames.length}게임</p>
              <p className="text-sm text-police-400">
                승률 {calculateWinRate(policeWins, policeGames.length)}%
              </p>
              <p className="text-xs text-gray-400 mt-1">
                체포 {totalCatches}회
              </p>
            </div>
          </Card>

          {/* 도둑 */}
          <Card variant="thief" padding="md">
            <div className="text-center">
              <div className="text-3xl mb-2">🏃</div>
              <p className="text-thief-300 font-medium">도둑</p>
              <p className="text-2xl font-bold text-white mt-2">{thiefGames.length}게임</p>
              <p className="text-sm text-thief-400">
                승률 {calculateWinRate(thiefWins, thiefGames.length)}%
              </p>
              <p className="text-xs text-gray-400 mt-1">
                구출 {totalRescues}회
              </p>
            </div>
          </Card>
        </div>
      </Card>

      {/* 최근 게임 히스토리 */}
      <Card variant="glass" padding="lg" className="mb-4">
        <h2 className="text-lg font-semibold text-white mb-4">📜 최근 게임</h2>

        {gameHistory.length === 0 ? (
          <p className="text-gray-500 text-center py-8">아직 플레이한 게임이 없습니다</p>
        ) : (
          <div className="space-y-3">
            {gameHistory.slice(0, 10).map((game) => (
              <div
                key={game.id}
                className={`p-3 rounded-xl border ${
                  game.result === "win"
                    ? "bg-green-900/20 border-green-700/50"
                    : "bg-red-900/20 border-red-700/50"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{game.team === "police" ? "🚔" : "🏃"}</span>
                    <div>
                      <p className="text-white font-medium">{game.roomName}</p>
                      <p className="text-gray-400 text-xs">
                        {new Date(game.date).toLocaleDateString("ko-KR")} •{" "}
                        {Math.round(game.duration / 60)}분 • {formatDistance(game.distance)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      game.result === "win" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {game.result === "win" ? "승리" : "패배"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 홈으로 버튼 */}
      <Button variant="outline" size="lg" fullWidth onClick={() => router.push("/")}>
        🏠 홈으로
      </Button>
    </main>
  );
}

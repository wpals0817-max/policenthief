"use client";

import type { Player, TeamType } from "@/types";
import Card from "./Card";

interface PlayerListProps {
  players: Player[];
  currentUserId?: string;
  showTeam?: boolean;
  showStatus?: boolean;
  onPlayerClick?: (player: Player) => void;
}

export default function PlayerList({
  players,
  currentUserId,
  showTeam = false,
  showStatus = false,
  onPlayerClick,
}: PlayerListProps) {
  const getStatusBadge = (status: Player["status"]) => {
    switch (status) {
      case "alive":
        return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">생존</span>;
      case "caught":
        return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">체포됨</span>;
      case "escaped":
        return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">탈출</span>;
      case "disconnected":
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">연결 끊김</span>;
      default:
        return null;
    }
  };

  const getTeamBadge = (team?: TeamType) => {
    if (!team) return null;
    return team === "police" ? (
      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1 font-medium">
        <span>🚔</span> 경찰
      </span>
    ) : (
      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full flex items-center gap-1 font-medium">
        <span>🏃</span> 도둑
      </span>
    );
  };

  if (players.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        아직 참가자가 없습니다
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {players.map((player) => (
        <Card
          key={player.id}
          variant={player.team === "police" ? "police" : player.team === "thief" ? "thief" : "default"}
          padding="sm"
          hover={!!onPlayerClick}
          onClick={() => onPlayerClick?.(player)}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center text-lg
                ${player.team === "police" ? "bg-blue-100" : player.team === "thief" ? "bg-red-100" : "bg-gray-100"}
              `}
            >
              {player.team === "police" ? "👮" : player.team === "thief" ? "🦹" : "👤"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">
                  {player.name}
                  {player.id === currentUserId && (
                    <span className="text-blue-600 text-sm ml-1">(나)</span>
                  )}
                </span>
                {player.isHost && (
                  <span className="text-yellow-600 text-xs">👑 방장</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                {showTeam && getTeamBadge(player.team)}
                {showStatus && getStatusBadge(player.status)}
              </div>
            </div>
          </div>

          {(player.catches !== undefined || player.rescues !== undefined) && (
            <div className="text-right text-sm">
              {player.team === "police" && player.catches !== undefined && (
                <div className="text-blue-600 font-semibold">체포: {player.catches}</div>
              )}
              {player.team === "thief" && player.rescues !== undefined && (
                <div className="text-red-600 font-semibold">구출: {player.rescues}</div>
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

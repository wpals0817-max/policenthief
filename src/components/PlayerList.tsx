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
        return <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">생존</span>;
      case "caught":
        return <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">체포됨</span>;
      case "escaped":
        return <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">탈출</span>;
      case "disconnected":
        return <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 text-xs rounded-full">연결 끊김</span>;
      default:
        return null;
    }
  };

  const getTeamBadge = (team?: TeamType) => {
    if (!team) return null;
    return team === "police" ? (
      <span className="px-2 py-0.5 bg-police-500/20 text-police-400 text-xs rounded-full flex items-center gap-1">
        <span>🚔</span> 경찰
      </span>
    ) : (
      <span className="px-2 py-0.5 bg-thief-500/20 text-thief-400 text-xs rounded-full flex items-center gap-1">
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
                ${player.team === "police" ? "bg-police-500/30" : player.team === "thief" ? "bg-thief-500/30" : "bg-gray-700"}
              `}
            >
              {player.team === "police" ? "👮" : player.team === "thief" ? "🦹" : "👤"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-white">
                  {player.name}
                  {player.id === currentUserId && (
                    <span className="text-blue-400 text-sm ml-1">(나)</span>
                  )}
                </span>
                {player.isHost && (
                  <span className="text-yellow-500 text-xs">👑 방장</span>
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
                <div className="text-police-400">체포: {player.catches}</div>
              )}
              {player.team === "thief" && player.rescues !== undefined && (
                <div className="text-thief-400">구출: {player.rescues}</div>
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

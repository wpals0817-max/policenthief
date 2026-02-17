"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Card from "@/components/Card";
import { useGameStore } from "@/store/gameStore";
import { findRoomByCode, joinRoom } from "@/lib/roomService";

export default function JoinRoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const { userId, userName, setCurrentRoom, setCurrentPlayer, setIsHost } = useGameStore();

  const [password, setPassword] = useState("");
  const [needPassword, setNeedPassword] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [roomName, setRoomName] = useState("");

  // 방 정보 확인
  useEffect(() => {
    if (!userName) {
      router.push(`/?join=${code}`);
      return;
    }

    const checkRoom = async () => {
      setIsLoading(true);
      const room = await findRoomByCode(code);

      if (room) {
        setRoomName(room.name);
        if (room.password) {
          setNeedPassword(true);
        }
      } else {
        setError("방을 찾을 수 없습니다. 코드를 확인해주세요.");
      }
      setIsLoading(false);
    };

    checkRoom();
  }, [code, userName, router]);

  const handleJoin = async () => {
    if (!userId || !userName) {
      router.push("/");
      return;
    }

    setIsJoining(true);
    setError("");

    const result = await joinRoom(code, userId, userName, password);

    if (result.success && result.room) {
      setCurrentRoom(result.room);
      setCurrentPlayer(result.room.players[userId]);
      setIsHost(result.room.hostId === userId);
      router.push(`/room/${code.toUpperCase()}`);
    } else {
      setError(result.error || "참여에 실패했습니다.");
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <Card variant="glass" padding="lg" className="w-full max-w-md text-center">
          <div className="text-4xl mb-4 animate-bounce">🔍</div>
          <p className="text-gray-400">방을 찾는 중...</p>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card variant="glass" padding="lg" className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🔗</div>
          <h1 className="text-2xl font-bold text-white">방 참여하기</h1>
          <p className="text-gray-400 mt-1">
            방 코드: <span className="text-blue-400 font-mono">{code.toUpperCase()}</span>
          </p>
          {roomName && (
            <p className="text-white mt-2 font-medium">{roomName}</p>
          )}
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-4 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {needPassword && !error && (
          <div className="mb-4">
            <Input
              type="password"
              label="비밀번호"
              placeholder="방 비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        )}

        <div className="space-y-3">
          {!error ? (
            <Button
              variant="thief"
              size="lg"
              fullWidth
              isLoading={isJoining}
              onClick={handleJoin}
            >
              🏃 참여하기
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => {
                setError("");
                setIsLoading(true);
                findRoomByCode(code).then((room) => {
                  if (room) {
                    setRoomName(room.name);
                    setNeedPassword(!!room.password);
                    setError("");
                  } else {
                    setError("방을 찾을 수 없습니다.");
                  }
                  setIsLoading(false);
                });
              }}
            >
              🔄 다시 시도
            </Button>
          )}

          <Button
            variant="ghost"
            size="md"
            fullWidth
            onClick={() => router.push("/")}
          >
            홈으로 돌아가기
          </Button>
        </div>
      </Card>
    </main>
  );
}

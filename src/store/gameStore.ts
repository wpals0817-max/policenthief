import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Room,
  Player,
  GameSettings,
  Location,
  GameRecord,
  UserProfile,
  DEFAULT_SETTINGS,
} from "@/types";

interface GameStore {
  // 현재 사용자 정보
  userId: string | null;
  userName: string;

  // 현재 방 정보
  currentRoom: Room | null;
  currentPlayer: Player | null;

  // 위치 정보
  currentLocation: Location | null;
  locationHistory: Location[];

  // 게임 상태
  isHost: boolean;
  isConnected: boolean;

  // 알림
  notifications: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: number;
  }>;

  // 액션
  setUserId: (id: string | null) => void;
  setUserName: (name: string) => void;
  setCurrentRoom: (room: Room | null) => void;
  setCurrentPlayer: (player: Player | null) => void;
  setCurrentLocation: (location: Location) => void;
  addLocationToHistory: (location: Location) => void;
  clearLocationHistory: () => void;
  setIsHost: (isHost: boolean) => void;
  setIsConnected: (connected: boolean) => void;
  addNotification: (notification: { type: string; message: string }) => void;
  clearNotifications: () => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      userId: null,
      userName: "",
      currentRoom: null,
      currentPlayer: null,
      currentLocation: null,
      locationHistory: [],
      isHost: false,
      isConnected: false,
      notifications: [],

      setUserId: (id) => set({ userId: id }),
      setUserName: (name) => set({ userName: name }),
      setCurrentRoom: (room) => set({ currentRoom: room }),
      setCurrentPlayer: (player) => set({ currentPlayer: player }),
      setCurrentLocation: (location) => set({ currentLocation: location }),

      addLocationToHistory: (location) =>
        set((state) => ({
          locationHistory: [...state.locationHistory, location],
        })),

      clearLocationHistory: () => set({ locationHistory: [] }),
      setIsHost: (isHost) => set({ isHost }),
      setIsConnected: (connected) => set({ isConnected: connected }),

      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            {
              ...notification,
              id: crypto.randomUUID(),
              timestamp: Date.now(),
            },
          ],
        })),

      clearNotifications: () => set({ notifications: [] }),

      reset: () =>
        set({
          currentRoom: null,
          currentPlayer: null,
          locationHistory: [],
          isHost: false,
          isConnected: false,
          notifications: [],
        }),
    }),
    {
      name: "policenthief-storage",
      partialize: (state) => ({
        userId: state.userId,
        userName: state.userName,
      }),
    }
  )
);

// 프로필 저장용 별도 스토어
interface ProfileStore {
  profile: UserProfile | null;
  gameHistory: GameRecord[];
  setProfile: (profile: UserProfile | null) => void;
  addGameRecord: (record: GameRecord) => void;
  updateStats: (team: "police" | "thief", won: boolean, catches?: number, rescues?: number, duration?: number, distance?: number) => void;
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      profile: null,
      gameHistory: [],

      setProfile: (profile) => set({ profile }),

      addGameRecord: (record) =>
        set((state) => ({
          gameHistory: [record, ...state.gameHistory].slice(0, 100), // 최근 100개만 저장
        })),

      updateStats: (team, won, catches = 0, rescues = 0, duration = 0, distance = 0) =>
        set((state) => {
          if (!state.profile) return state;

          const newStats = { ...state.profile.stats };

          if (team === "police") {
            newStats.policeGames += 1;
            if (won) newStats.policeWins += 1;
            newStats.totalCatches += catches;
          } else {
            newStats.thiefGames += 1;
            if (won) newStats.thiefWins += 1;
            newStats.totalRescues += rescues;
          }

          return {
            profile: {
              ...state.profile,
              totalGames: state.profile.totalGames + 1,
              wins: state.profile.wins + (won ? 1 : 0),
              loses: state.profile.loses + (won ? 0 : 1),
              totalDistance: state.profile.totalDistance + distance,
              totalTime: state.profile.totalTime + duration,
              stats: newStats,
            },
          };
        }),
    }),
    {
      name: "policenthief-profile",
    }
  )
);

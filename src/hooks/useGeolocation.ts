"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Location } from "@/types";

interface GeolocationState {
  location: Location | null;
  error: string | null;
  isLoading: boolean;
  isTracking: boolean;
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  maximumAge?: number;
  timeout?: number;
  trackingInterval?: number;
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const {
    enableHighAccuracy = true,
    maximumAge = 0,
    timeout = 10000,
    trackingInterval = 1000,
  } = options;

  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    isLoading: true,
    isTracking: false,
  });

  const watchIdRef = useRef<number | null>(null);
  const locationHistoryRef = useRef<Location[]>([]);

  // 현재 위치 가져오기
  const getCurrentLocation = useCallback((): Promise<Location> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("이 브라우저에서는 위치 서비스를 지원하지 않습니다."));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: position.timestamp,
            accuracy: position.coords.accuracy,
          };
          setState((prev) => ({ ...prev, location, isLoading: false, error: null }));
          resolve(location);
        },
        (error) => {
          let errorMessage = "위치를 가져올 수 없습니다.";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "위치 접근 권한이 거부되었습니다. 설정에서 위치 권한을 허용해주세요.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "위치 정보를 사용할 수 없습니다.";
              break;
            case error.TIMEOUT:
              errorMessage = "위치 요청 시간이 초과되었습니다.";
              break;
          }
          setState((prev) => ({ ...prev, error: errorMessage, isLoading: false }));
          reject(new Error(errorMessage));
        },
        { enableHighAccuracy, maximumAge, timeout }
      );
    });
  }, [enableHighAccuracy, maximumAge, timeout]);

  // 위치 추적 시작
  const startTracking = useCallback(
    (onLocationUpdate?: (location: Location) => void) => {
      if (!navigator.geolocation) {
        setState((prev) => ({
          ...prev,
          error: "이 브라우저에서는 위치 서비스를 지원하지 않습니다.",
        }));
        return;
      }

      if (watchIdRef.current !== null) {
        return; // 이미 추적 중
      }

      setState((prev) => ({ ...prev, isTracking: true }));
      locationHistoryRef.current = [];

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: position.timestamp,
            accuracy: position.coords.accuracy,
          };

          locationHistoryRef.current.push(location);
          setState((prev) => ({ ...prev, location, error: null }));

          if (onLocationUpdate) {
            onLocationUpdate(location);
          }
        },
        (error) => {
          let errorMessage = "위치 추적 중 오류가 발생했습니다.";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "위치 접근 권한이 거부되었습니다.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "위치 정보를 사용할 수 없습니다.";
              break;
            case error.TIMEOUT:
              errorMessage = "위치 요청 시간이 초과되었습니다.";
              break;
          }
          setState((prev) => ({ ...prev, error: errorMessage }));
        },
        { enableHighAccuracy, maximumAge, timeout }
      );
    },
    [enableHighAccuracy, maximumAge, timeout]
  );

  // 위치 추적 중지
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setState((prev) => ({ ...prev, isTracking: false }));
    }
  }, []);

  // 위치 기록 가져오기
  const getLocationHistory = useCallback(() => {
    return [...locationHistoryRef.current];
  }, []);

  // 총 이동 거리 계산 (미터)
  const calculateTotalDistance = useCallback(() => {
    const history = locationHistoryRef.current;
    if (history.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 1; i < history.length; i++) {
      totalDistance += calculateDistance(
        history[i - 1].latitude,
        history[i - 1].longitude,
        history[i].latitude,
        history[i].longitude
      );
    }
    return totalDistance;
  }, []);

  // 컴포넌트 언마운트 시 추적 중지
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // 초기 위치 가져오기
  useEffect(() => {
    getCurrentLocation().catch(() => {});
  }, [getCurrentLocation]);

  return {
    ...state,
    getCurrentLocation,
    startTracking,
    stopTracking,
    getLocationHistory,
    calculateTotalDistance,
  };
}

// 두 좌표 사이의 거리 계산 (Haversine formula, 미터 단위)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // 지구 반경 (미터)
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// 위치가 경계 내에 있는지 확인
export function isWithinBoundary(
  location: Location,
  center: Location,
  radiusMeters: number
): boolean {
  const distance = calculateDistance(
    location.latitude,
    location.longitude,
    center.latitude,
    center.longitude
  );
  return distance <= radiusMeters;
}

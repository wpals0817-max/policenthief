"use client";

import { useEffect, useRef, useState } from "react";
import type { Location, Player } from "@/types";
import type * as LeafletTypes from "leaflet";

// Leaflet은 클라이언트에서만 로드
let L: typeof LeafletTypes | null = null;

interface GameMapProps {
  center: Location;
  boundaryRadius: number;
  players?: Player[];
  currentUserId?: string;
  jailLocation?: Location;
  showRoute?: boolean;
  routeLocations?: Location[];
  onMapClick?: (location: Location) => void;
  className?: string;
}

export default function GameMap({
  center,
  boundaryRadius,
  players = [],
  currentUserId,
  jailLocation,
  showRoute = false,
  routeLocations = [],
  onMapClick,
  className = "",
}: GameMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletTypes.Map | null>(null);
  const markersRef = useRef<Map<string, LeafletTypes.Marker>>(new Map());
  const [isLoaded, setIsLoaded] = useState(false);

  // Leaflet CSS 및 JS 로드
  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window === "undefined") return;

      // CSS 로드
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      // JS 로드
      L = (await import("leaflet")).default;
      setIsLoaded(true);
    };

    loadLeaflet();
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (!isLoaded || !L || !mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [center.latitude, center.longitude],
      zoom: 16,
      zoomControl: false,
    });

    // 어두운 테마 타일 레이어
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    // 경계 원 그리기
    L.circle([center.latitude, center.longitude], {
      radius: boundaryRadius,
      color: "#3b82f6",
      fillColor: "#3b82f6",
      fillOpacity: 0.1,
      weight: 2,
      dashArray: "10, 10",
    }).addTo(map);

    // 중심점 마커
    const centerIcon = L.divIcon({
      className: "custom-div-icon",
      html: `<div style="background: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    L.marker([center.latitude, center.longitude], { icon: centerIcon }).addTo(map);

    // 클릭 이벤트
    if (onMapClick) {
      map.on("click", (e) => {
        onMapClick({
          latitude: e.latlng.lat,
          longitude: e.latlng.lng,
          timestamp: Date.now(),
        });
      });
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [isLoaded, center.latitude, center.longitude, boundaryRadius, onMapClick]);

  // 감옥 위치 마커
  useEffect(() => {
    if (!isLoaded || !L || !mapInstanceRef.current || !jailLocation) return;

    const jailIcon = L.divIcon({
      className: "custom-div-icon",
      html: `<div style="font-size: 24px; filter: drop-shadow(0 0 5px rgba(0,0,0,0.5));">🏛️</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

    const marker = L.marker([jailLocation.latitude, jailLocation.longitude], {
      icon: jailIcon,
    }).addTo(mapInstanceRef.current);

    marker.bindPopup("감옥");

    return () => {
      marker.remove();
    };
  }, [isLoaded, jailLocation]);

  // 플레이어 마커 업데이트
  useEffect(() => {
    if (!isLoaded || !L || !mapInstanceRef.current) return;

    const leaflet = L; // TypeScript null check를 위해 로컬 변수에 할당
    const map = mapInstanceRef.current;

    // 기존 마커 제거
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    // 새 마커 추가
    players.forEach((player) => {
      if (!player.location) return;

      const isMe = player.id === currentUserId;
      const isPolice = player.team === "police";
      const isCaught = player.status === "caught";

      const emoji = isPolice ? "🚔" : isCaught ? "⛓️" : "🏃";
      const bgColor = isPolice ? "#3b82f6" : "#ef4444";
      const opacity = isCaught ? 0.5 : 1;

      const icon = leaflet.divIcon({
        className: "custom-div-icon",
        html: `
          <div style="
            position: relative;
            opacity: ${opacity};
            ${isMe ? "animation: pulse 2s infinite;" : ""}
          ">
            <div style="
              font-size: 24px;
              filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
            ">${emoji}</div>
            <div style="
              position: absolute;
              bottom: -18px;
              left: 50%;
              transform: translateX(-50%);
              background: ${bgColor};
              color: white;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 10px;
              white-space: nowrap;
              font-weight: bold;
            ">${player.name}${isMe ? " (나)" : ""}</div>
          </div>
        `,
        iconSize: [30, 50],
        iconAnchor: [15, 15],
      });

      const marker = leaflet.marker([player.location.latitude, player.location.longitude], {
        icon,
      }).addTo(map);

      markersRef.current.set(player.id, marker);
    });
  }, [isLoaded, players, currentUserId]);

  // 경로 그리기
  useEffect(() => {
    if (!isLoaded || !L || !mapInstanceRef.current || !showRoute || routeLocations.length < 2)
      return;

    const leaflet = L;
    const map = mapInstanceRef.current;
    const latlngs = routeLocations.map((loc) => [loc.latitude, loc.longitude] as [number, number]);

    const polyline = leaflet.polyline(latlngs, {
      color: "#22c55e",
      weight: 4,
      opacity: 0.8,
      dashArray: "5, 10",
    }).addTo(map);

    return () => {
      polyline.remove();
    };
  }, [isLoaded, showRoute, routeLocations]);

  if (!isLoaded) {
    return (
      <div
        className={`bg-gray-900 rounded-xl flex items-center justify-center ${className}`}
        style={{ minHeight: 300 }}
      >
        <div className="text-gray-400 flex items-center gap-2">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          지도 로딩 중...
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className={`rounded-xl overflow-hidden ${className}`}
      style={{ minHeight: 300 }}
    />
  );
}

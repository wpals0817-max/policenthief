"use client";

import { Car, UserX } from "lucide-react";

export default function GameLogo() {
  return (
    <div className="relative flex items-center justify-center gap-4 mb-4">
      {/* 경찰 아이콘 */}
      <div className="relative group">
        {/* 배경 효과 - 사이렌 불빛 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity animate-pulse" />
        
        {/* 메인 카드 */}
        <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl shadow-2xl flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
          {/* 사이렌 불빛 효과 */}
          <div className="absolute top-0 right-0 w-3 h-3 bg-red-400 rounded-full animate-ping" />
          <div className="absolute top-0 left-0 w-3 h-3 bg-blue-300 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
          
          {/* 도로 무늬 */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20" />
          <div className="absolute bottom-1 left-1/4 w-1/2 h-0.5 bg-yellow-300/40" />
          
          {/* 아이콘 */}
          <Car className="w-10 h-10 text-white drop-shadow-lg z-10" strokeWidth={2.5} />
        </div>
        
        {/* 라벨 */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            경찰
          </span>
        </div>
      </div>

      {/* VS 텍스트 */}
      <div className="text-2xl font-black text-gray-300 animate-pulse">
        VS
      </div>

      {/* 도둑 아이콘 */}
      <div className="relative group">
        {/* 배경 효과 - 경고 효과 */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-red-600 rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity animate-pulse" style={{ animationDelay: '0.3s' }} />
        
        {/* 메인 카드 */}
        <div className="relative w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-3xl shadow-2xl flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
          {/* 경고 스트라이프 */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-400 via-transparent to-yellow-400 opacity-60" />
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-400 via-transparent to-yellow-400 opacity-60" />
          
          {/* 모션 라인 (달리는 효과) */}
          <div className="absolute left-0 top-1/2 w-full h-0.5 bg-white/20" />
          <div className="absolute left-0 top-1/2 -translate-y-2 w-3/4 h-0.5 bg-white/20" />
          <div className="absolute left-0 top-1/2 translate-y-2 w-3/4 h-0.5 bg-white/20" />
          
          {/* 아이콘 */}
          <UserX className="w-10 h-10 text-white drop-shadow-lg z-10 transform -rotate-12" strokeWidth={2.5} />
        </div>
        
        {/* 라벨 */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
            도둑
          </span>
        </div>
      </div>
    </div>
  );
}

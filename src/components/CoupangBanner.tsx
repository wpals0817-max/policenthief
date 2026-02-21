'use client';

import { useEffect, useRef } from 'react';

interface CoupangBannerProps {
  position?: 'top' | 'bottom';
  className?: string;
}

export default function CoupangBanner({ 
  position = 'bottom',
  className = ''
}: CoupangBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 쿠팡 스크립트 동적 로드
    const loadCoupangBanner = () => {
      // 1. 메인 스크립트 로드
      const script = document.createElement('script');
      script.src = 'https://ads-partners.coupang.com/g.js';
      script.async = true;
      
      script.onload = () => {
        // 2. 배너 생성
        if (window.PartnersCoupang && containerRef.current) {
          const bannerContainer = document.createElement('div');
          bannerContainer.id = 'coupang-banner-container';
          containerRef.current.appendChild(bannerContainer);
          
          new window.PartnersCoupang.G({
            id: 965686,
            template: "carousel",
            trackingCode: "AF4963764",
            width: "320",
            height: "50",
            tsource: ""
          });
        }
      };
      
      document.head.appendChild(script);
    };

    loadCoupangBanner();

    return () => {
      // 정리
      const scripts = document.querySelectorAll('script[src*="coupang"]');
      scripts.forEach(s => s.remove());
    };
  }, []);

  return (
    <div className={`w-full bg-[#0a0a0a] border-t border-gray-800 py-3 ${className}`}>
      {/* 쿠팡 배너 */}
      <div 
        ref={containerRef}
        className="flex justify-center items-center mb-2"
        style={{ minHeight: '50px' }}
      />
      
      {/* 면책 문구 - 배경색 동일하게 */}
      <p className="text-center text-gray-500 text-[10px] px-4">
        이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
      </p>
    </div>
  );
}

// TypeScript 타입 선언
declare global {
  interface Window {
    PartnersCoupang?: {
      G: new (config: {
        id: number;
        template: string;
        trackingCode: string;
        width: string;
        height: string;
        tsource: string;
      }) => void;
    };
  }
}

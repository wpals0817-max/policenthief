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
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 쿠팡 파트너스 스크립트 동적 로드
    if (bannerRef.current) {
      // 기존 스크립트가 있으면 제거
      const existingScript = document.getElementById('coupang-script');
      if (existingScript) {
        existingScript.remove();
      }

      // 새 스크립트 추가
      const script = document.createElement('script');
      script.id = 'coupang-script';
      script.src = 'https://ads-partners.coupang.com/g.js';
      script.async = true;
      
      script.onload = () => {
        // 스크립트 로드 후 배너 생성
        if (window.PartnersCoupang) {
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
    }

    return () => {
      // 컴포넌트 언마운트 시 정리
      const script = document.getElementById('coupang-script');
      if (script) {
        script.remove();
      }
    };
  }, []);

  return (
    <div className={`w-full bg-white border-t border-gray-200 py-3 ${className}`}>
      {/* 쿠팡 배너 */}
      <div 
        ref={bannerRef}
        className="flex justify-center items-center mb-2"
        style={{ minHeight: '50px' }}
      />
      
      {/* 면책 문구 */}
      <p className="text-center text-gray-400 text-[10px] px-4">
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

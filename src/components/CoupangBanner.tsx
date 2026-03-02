'use client';

import { useEffect, useState, useRef } from 'react';

interface CoupangBannerProps {
  position?: 'top' | 'bottom';
  className?: string;
}

export default function CoupangBanner({ 
  position = 'bottom',
  className = ''
}: CoupangBannerProps) {
  const [isMobile, setIsMobile] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [bannerLoaded, setBannerLoaded] = useState(false);

  useEffect(() => {
    // 화면 크기 체크
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!containerRef.current || bannerLoaded) return;

    const loadBanner = () => {
      if (typeof window !== 'undefined' && window.PartnersCoupang) {
        try {
          // 배너 컨테이너 비우기
          if (containerRef.current) {
            containerRef.current.innerHTML = '';
          }

          // 배너 생성
          new window.PartnersCoupang.G({
            id: isMobile ? 965686 : 966991,
            template: "carousel",
            trackingCode: "AF4963764",
            width: isMobile ? "340" : "728",
            height: isMobile ? "60" : "110",
            tsource: ""
          });
          
          setBannerLoaded(true);
          console.log('쿠팡 배너 로드 완료:', isMobile ? '모바일' : 'PC');
        } catch (error) {
          console.error('쿠팡 배너 초기화 오류:', error);
        }
      } else {
        // 스크립트가 아직 로드되지 않았으면 재시도
        console.log('쿠팡 스크립트 대기 중...');
        setTimeout(loadBanner, 500);
      }
    };

    // 약간의 딜레이 후 배너 로드
    const timer = setTimeout(loadBanner, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [isMobile, bannerLoaded]);

  return (
    <div className={`w-full bg-white border border-gray-300 rounded-xl shadow-md ${className}`}>
      {/* 광고 라벨 */}
      <div className="text-center pt-2 pb-1">
        <span className="text-[10px] text-gray-500 font-medium">AD</span>
      </div>
      
      {/* 쿠팡 배너 컨테이너 */}
      <div 
        ref={containerRef}
        className="w-full flex justify-center items-center py-2 min-h-[70px]"
      >
        {!bannerLoaded && (
          <div className="text-gray-400 text-xs">광고 로딩 중...</div>
        )}
      </div>
      
      {/* 면책 문구 */}
      <p className="text-center text-gray-500 text-[10px] px-4 pb-3">
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

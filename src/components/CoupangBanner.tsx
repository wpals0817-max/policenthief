'use client';

interface CoupangBannerProps {
  position?: 'top' | 'bottom';
  className?: string;
}

export default function CoupangBanner({ 
  position = 'bottom',
  className = ''
}: CoupangBannerProps) {
  return (
    <div className={`w-full bg-[#0a0a0a] border-t border-gray-800 ${className}`}>
      {/* 쿠팡 배너 - 맨 위 (클릭 가능) */}
      <div 
        className="flex justify-center items-center py-3"
        dangerouslySetInnerHTML={{
          __html: `
            <div id="coupang-banner-div"></div>
            <script src="https://ads-partners.coupang.com/g.js"></script>
            <script>
              new PartnersCoupang.G({
                "id": 965686,
                "template": "carousel",
                "trackingCode": "AF4963764",
                "width": "320",
                "height": "50",
                "tsource": ""
              });
            </script>
          `
        }}
      />
      
      {/* 면책 문구 - 배너 바로 아래 */}
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

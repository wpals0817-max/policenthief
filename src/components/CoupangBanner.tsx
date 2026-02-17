'use client';

interface CoupangBannerProps {
  position?: 'top' | 'bottom';
  className?: string;
}

export default function CoupangBanner({ 
  position = 'bottom',
  className = ''
}: CoupangBannerProps) {
  // 쿠팡 파트너스 배너 스크립트
  const bannerScript = `
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
  `;

  return (
    <div className={`w-full bg-white border-t border-gray-200 py-3 ${className}`}>
      {/* 쿠팡 배너 */}
      <div 
        className="flex justify-center items-center"
        dangerouslySetInnerHTML={{ __html: bannerScript }}
      />
      
      {/* 면책 문구 - 배너 바로 아래 */}
      <p className="text-center text-gray-400 text-[10px] px-4 mt-2">
        이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
      </p>
    </div>
  );
}

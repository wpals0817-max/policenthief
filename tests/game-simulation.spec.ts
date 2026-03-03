import { test, expect, Page } from '@playwright/test';

// 서울 중심부 좌표들 (테스트용)
const locations = {
  center: { latitude: 37.5665, longitude: 126.9780 }, // 서울시청
  nearby1: { latitude: 37.5675, longitude: 126.9785 }, // 100m 북쪽
  nearby2: { latitude: 37.5655, longitude: 126.9775 }, // 100m 남쪽
  nearby3: { latitude: 37.5665, longitude: 126.9790 }, // 100m 동쪽
  nearby4: { latitude: 37.5665, longitude: 126.9770 }, // 100m 서쪽
};

// GPS 위치 모킹
async function mockGPS(page: Page, latitude: number, longitude: number) {
  await page.context().setGeolocation({ latitude, longitude });
  await page.context().grantPermissions(['geolocation']);
}

test.describe('경찰과 도둑 게임 시뮬레이션', () => {
  test.setTimeout(120000); // 2분 타임아웃

  test('🎮 전체 게임 플로우 테스트', async ({ browser }) => {
    console.log('🚀 게임 시뮬레이션 시작...\n');

    // 1. 호스트 (방장) 생성
    console.log('👤 플레이어 1 (호스트) 생성 중...');
    const hostContext = await browser.newContext({
      geolocation: locations.center,
      permissions: ['geolocation'],
    });
    const hostPage = await hostContext.newPage();
    await hostPage.goto('https://policenthief-ten.vercel.app');
    
    // 이름 입력
    await hostPage.fill('input[placeholder*="닉네임"]', '호스트');
    console.log('  ✅ 호스트 이름 입력 완료');
    
    // 방 만들기 버튼 클릭
    await hostPage.click('button:has-text("방 만들기")');
    await hostPage.waitForURL('**/create');
    console.log('  ✅ 방 만들기 페이지 이동');
    
    // 방 설정 (기본값 사용)
    await hostPage.waitForSelector('button:has-text("방 만들기")');
    await hostPage.click('button:has-text("방 만들기")');
    
    // 대기실로 이동 대기
    await hostPage.waitForURL('**/room/**', { timeout: 10000 });
    const url = hostPage.url();
    const roomCode = url.match(/\/room\/([A-Z0-9]+)/)?.[1];
    
    console.log(`  ✅ 방 생성 완료! 코드: ${roomCode}\n`);

    // 2. 플레이어 2-4 참여
    const players = [];
    const playerNames = ['경찰1', '도둑1', '도둑2'];
    const playerLocations = [locations.nearby1, locations.nearby2, locations.nearby3];

    for (let i = 0; i < 3; i++) {
      console.log(`👤 플레이어 ${i + 2} (${playerNames[i]}) 참여 중...`);
      
      const context = await browser.newContext({
        geolocation: playerLocations[i],
        permissions: ['geolocation'],
      });
      const page = await context.newPage();
      
      await page.goto('https://policenthief-ten.vercel.app');
      await page.fill('input[placeholder*="닉네임"]', playerNames[i]);
      
      // 코드 입장 버튼 클릭
      await page.click('button:has-text("코드 입장")');
      await page.waitForSelector('input[placeholder*="방 코드"]');
      
      // 방 코드 입력
      await page.fill('input[placeholder*="방 코드"]', roomCode!);
      await page.click('button:has-text("참여")');
      
      // 대기실 도착 확인
      await page.waitForURL(`**/room/${roomCode}`, { timeout: 10000 });
      
      console.log(`  ✅ ${playerNames[i]} 참여 완료`);
      players.push({ name: playerNames[i], page, context });
    }

    console.log(`\n✅ 총 ${players.length + 1}명 참여 완료!\n`);

    // 3. 게임 시작
    console.log('🎮 호스트가 게임 시작...');
    await hostPage.click('button:has-text("게임 시작")');
    
    // 모든 플레이어가 게임 화면으로 이동 대기
    await Promise.all([
      hostPage.waitForURL('**/game/**', { timeout: 15000 }),
      ...players.map(p => p.page.waitForURL('**/game/**', { timeout: 15000 }))
    ]);
    
    console.log('  ✅ 게임 화면 진입 완료\n');

    // 4. 숨는 시간 대기
    console.log('⏳ 숨는 시간 대기 중...');
    await hostPage.waitForTimeout(12000); // 10초 + 여유 2초
    console.log('  ✅ 숨는 시간 종료\n');

    // 5. 게임 플레이 시뮬레이션
    console.log('🏃 게임 진행 중...');
    
    // 5초마다 위치 업데이트 시뮬레이션
    for (let i = 0; i < 3; i++) {
      console.log(`  📍 위치 업데이트 ${i + 1}/3`);
      
      // 도둑들 이동
      for (let j = 0; j < players.length; j++) {
        const newLat = playerLocations[j].latitude + (Math.random() - 0.5) * 0.001;
        const newLng = playerLocations[j].longitude + (Math.random() - 0.5) * 0.001;
        await players[j].context.setGeolocation({ latitude: newLat, longitude: newLng });
      }
      
      await hostPage.waitForTimeout(5000);
    }

    console.log('  ✅ 게임 플레이 시뮬레이션 완료\n');

    // 6. 스크린샷 캡처
    console.log('📸 스크린샷 캡처 중...');
    await hostPage.screenshot({ path: 'tests/screenshots/host-game.png', fullPage: true });
    await players[0].page.screenshot({ path: 'tests/screenshots/player1-game.png', fullPage: true });
    console.log('  ✅ 스크린샷 저장 완료\n');

    // 7. 결과 확인
    console.log('📊 게임 상태 확인...');
    const hostTitle = await hostPage.title();
    console.log(`  호스트 페이지: ${hostTitle}`);
    
    // 플레이어 목록 확인
    const playerElements = await hostPage.$$('[class*="font-medium"]');
    console.log(`  참여자 수: ${playerElements.length}개 요소 발견\n`);

    console.log('✅ 게임 시뮬레이션 완료!');
    console.log('\n📋 요약:');
    console.log(`  - 방 코드: ${roomCode}`);
    console.log(`  - 참여자: 호스트 + ${players.length}명`);
    console.log(`  - 스크린샷: tests/screenshots/ 저장됨`);

    // 정리
    await hostContext.close();
    for (const player of players) {
      await player.context.close();
    }
  });

  test('🔍 빠른 연결 테스트', async ({ browser }) => {
    console.log('🔍 빠른 연결 테스트 시작...\n');

    // 단순히 페이지 로드 확인
    const context = await browser.newContext({
      geolocation: locations.center,
      permissions: ['geolocation'],
    });
    const page = await context.newPage();
    
    console.log('  📱 메인 페이지 로드 중...');
    await page.goto('https://policenthief-ten.vercel.app');
    
    // 페이지 로드 확인
    await expect(page.locator('h1:has-text("경찰과 도둑")')).toBeVisible();
    console.log('  ✅ 메인 페이지 로드 성공');
    
    // 로고 확인
    await expect(page.locator('text=VS')).toBeVisible();
    console.log('  ✅ 로고 표시 확인');
    
    // 버튼 확인
    await expect(page.locator('button:has-text("방 만들기")')).toBeVisible();
    await expect(page.locator('button:has-text("코드 입장")')).toBeVisible();
    console.log('  ✅ 주요 버튼 확인');
    
    // 광고 영역 확인
    const adExists = await page.locator('text=AD').isVisible();
    console.log(`  ${adExists ? '✅' : '⚠️'} 광고 영역 ${adExists ? '확인' : '미확인'}`);
    
    console.log('\n✅ 빠른 연결 테스트 완료!');
    
    await context.close();
  });
});

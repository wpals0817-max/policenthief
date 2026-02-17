"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Card from "@/components/Card";

type RuleCategory = "basic" | "team" | "capture" | "rescue" | "tips" | "etiquette";

interface Rule {
  id: string;
  emoji: string;
  title: string;
  description: string;
  details?: string[];
}

const RULES: Record<RuleCategory, { title: string; emoji: string; rules: Rule[] }> = {
  basic: {
    title: "기본 룰",
    emoji: "📜",
    rules: [
      {
        id: "objective",
        emoji: "🎯",
        title: "게임 목표",
        description: "경찰은 제한시간 내 모든 도둑을 잡아야 하고, 도둑은 한 명이라도 살아남으면 승리합니다.",
      },
      {
        id: "hiding-time",
        emoji: "🙈",
        title: "숨는 시간",
        description: "게임 시작 시 도둑에게 숨을 시간이 주어집니다. 경찰은 이 시간 동안 눈을 감거나 제자리에서 대기합니다.",
        details: [
          "기본 60초, 방장이 30~180초로 설정 가능",
          "넓은 구역에서는 숨는 시간을 늘려주세요",
        ],
      },
      {
        id: "boundary",
        emoji: "🚧",
        title: "활동 구역",
        description: "게임 시작 위치를 중심으로 정해진 반경 내에서만 활동할 수 있습니다.",
        details: [
          "경계를 벗어나면 경고 알림이 표시됩니다",
          "자동 탈락 거리만큼 더 벗어나면 탈락 처리됩니다",
          "GPS가 약한 곳(건물 내부 등)에서는 위치가 부정확할 수 있습니다",
        ],
      },
      {
        id: "time-limit",
        emoji: "⏱️",
        title: "제한 시간",
        description: "정해진 시간이 지나면 게임이 종료됩니다. 살아남은 도둑이 있으면 도둑 팀 승리입니다.",
        details: [
          "기본 15분, 방장이 5~60분으로 설정 가능",
          "인원이 많을수록 시간을 늘려주세요",
        ],
      },
    ],
  },
  team: {
    title: "팀 구성",
    emoji: "👥",
    rules: [
      {
        id: "team-divide",
        emoji: "⚖️",
        title: "팀 나누기",
        description: "게임 시작 시 경찰과 도둑 팀으로 자동 배정됩니다. 보통 경찰을 소수로 배정합니다.",
        details: [
          "권장 비율: 경찰 1명당 도둑 3~5명",
          "예: 12명이면 경찰 2~3명, 도둑 9~10명",
        ],
      },
      {
        id: "identification",
        emoji: "🎽",
        title: "팀 구분",
        description: "앱에서 각자의 팀이 표시됩니다. 필요시 실제 완장이나 띠를 착용하면 좋습니다.",
        details: [
          "공원 등 공공장소에서는 완장 착용 권장",
          "일반 행인과 구분하기 위함",
        ],
      },
    ],
  },
  capture: {
    title: "체포 룰",
    emoji: "🚔",
    rules: [
      {
        id: "catch-method",
        emoji: "👆",
        title: "체포 방법",
        description: "경찰이 도둑의 몸에 터치하면 체포됩니다. 앱에서 '체포하기' 버튼을 눌러 기록합니다.",
        details: [
          "실제로 터치해야 합니다 (사회적 거리두기 주의)",
          "너무 거칠게 잡지 마세요",
        ],
      },
      {
        id: "jail",
        emoji: "🏛️",
        title: "감옥",
        description: "체포된 도둑은 지정된 감옥 위치로 이동하여 대기합니다.",
        details: [
          "감옥 위치는 방장이 지도에서 설정",
          "감옥에서 탈출하면 안 됩니다",
        ],
      },
    ],
  },
  rescue: {
    title: "구출 룰",
    emoji: "⛓️",
    rules: [
      {
        id: "rescue-touch",
        emoji: "🤝",
        title: "터치 구출",
        description: "살아있는 도둑이 감옥에 있는 동료를 터치하면 구출됩니다.",
        details: [
          "감옥 근처에서 경찰이 지키고 있을 수 있습니다",
          "구출된 도둑은 즉시 도망칠 수 있습니다",
        ],
      },
      {
        id: "rescue-dabanggu",
        emoji: "📢",
        title: "다방구 구출",
        description: "'다방구!'라고 크게 외치면서 감옥의 도둑 손을 끊어야 구출이 인정됩니다.",
        details: [
          "변칙 룰로, 방장이 설정할 수 있습니다",
          "소리를 크게 내야 인정",
          "조용한 곳에서는 비추천",
        ],
      },
      {
        id: "rescue-chain",
        emoji: "⛓️",
        title: "체인 구출",
        description: "감옥에 있는 도둑들이 손을 잡고 줄을 이으면, 끝에 있는 도둑을 터치해도 전체가 구출됩니다.",
        details: [
          "도둑들이 협력하여 구출 확률을 높이는 전략",
          "경찰은 체인이 길어지지 않도록 감옥 근처를 경계해야 함",
        ],
      },
    ],
  },
  tips: {
    title: "전략 & 팁",
    emoji: "💡",
    rules: [
      {
        id: "police-tips",
        emoji: "🚔",
        title: "경찰 팁",
        description: "효율적인 추격을 위한 경찰 팀 전략입니다.",
        details: [
          "한 명만 집요하게 쫓기 - 여러 명 쫓다가 다 놓칠 수 있음",
          "구역을 나눠서 수색하기",
          "감옥 근처에 1명은 대기하기",
          "도둑의 협상에 넘어가지 말기",
          "지형지물(골목, 건물 뒤)을 꼼꼼히 확인",
        ],
      },
      {
        id: "thief-tips",
        emoji: "🏃",
        title: "도둑 팁",
        description: "생존과 동료 구출을 위한 도둑 팀 전략입니다.",
        details: [
          "처음에는 최대한 멀리 숨기",
          "무작정 뛰지 말고 체력 안배하기",
          "경찰 시야의 사각지대 활용",
          "동료 구출을 위한 타이밍 노리기",
          "필요하다면 협상, 연기, 위장도 활용",
        ],
      },
    ],
  },
  etiquette: {
    title: "매너 & 안전",
    emoji: "🤝",
    rules: [
      {
        id: "safety",
        emoji: "⚠️",
        title: "안전 수칙",
        description: "부상 방지를 위한 안전 수칙입니다.",
        details: [
          "게임 전 충분히 스트레칭하기",
          "무리한 점프나 위험한 행동 금지",
          "차도나 위험 지역 접근 금지",
          "체력이 떨어지면 무리하지 말기",
          "날씨와 지면 상태 확인하기",
        ],
      },
      {
        id: "manner",
        emoji: "💪",
        title: "매너",
        description: "즐거운 게임을 위한 매너입니다.",
        details: [
          "너무 거칠게 잡거나 밀지 않기",
          "일반 시민에게 피해 주지 않기",
          "결과에 승복하고 즐겁게 마무리하기",
          "탈락해도 끝까지 응원하기",
          "쓰레기는 반드시 치우기",
        ],
      },
      {
        id: "fair-play",
        emoji: "⚖️",
        title: "페어플레이",
        description: "공정한 게임을 위한 규칙입니다.",
        details: [
          "앱을 끄거나 조작하지 않기",
          "경계 밖으로 일부러 나가지 않기",
          "감옥에서 무단 이탈하지 않기",
          "잡히면 인정하기",
        ],
      },
    ],
  },
};

export default function RulesPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<RuleCategory>("basic");
  const [expandedRule, setExpandedRule] = useState<string | null>(null);

  const categories = Object.entries(RULES) as [RuleCategory, typeof RULES[RuleCategory]][];
  const currentCategory = RULES[activeCategory];

  return (
    <main className="min-h-screen p-4 safe-area-top safe-area-bottom">
      {/* 헤더 */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          ← 뒤로
        </Button>
        <h1 className="text-2xl font-bold text-white ml-2">📖 게임 룰북</h1>
      </div>

      {/* 카테고리 탭 */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {categories.map(([key, { title, emoji }]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeCategory === key
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {emoji} {title}
          </button>
        ))}
      </div>

      {/* 룰 목록 */}
      <div className="space-y-3">
        {currentCategory.rules.map((rule) => (
          <Card
            key={rule.id}
            variant="glass"
            padding="none"
            className="overflow-hidden"
          >
            <button
              onClick={() =>
                setExpandedRule(expandedRule === rule.id ? null : rule.id)
              }
              className="w-full p-4 text-left flex items-start gap-3"
            >
              <span className="text-2xl">{rule.emoji}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-white">{rule.title}</h3>
                <p className="text-gray-400 text-sm mt-1">{rule.description}</p>
              </div>
              {rule.details && (
                <span
                  className={`text-gray-500 transition-transform ${
                    expandedRule === rule.id ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              )}
            </button>

            {/* 상세 내용 */}
            {rule.details && expandedRule === rule.id && (
              <div className="px-4 pb-4 ml-11">
                <ul className="space-y-2">
                  {rule.details.map((detail, i) => (
                    <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* 빠른 시작 가이드 */}
      <Card variant="glass" padding="lg" className="mt-6">
        <h2 className="text-lg font-semibold text-white mb-4">🚀 빠른 시작</h2>
        <ol className="space-y-3">
          <li className="flex items-start gap-3 text-gray-300">
            <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              1
            </span>
            <span>방을 만들거나 초대 링크로 참여하세요</span>
          </li>
          <li className="flex items-start gap-3 text-gray-300">
            <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              2
            </span>
            <span>게임 설정을 확인하고 대기실에서 모이세요</span>
          </li>
          <li className="flex items-start gap-3 text-gray-300">
            <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              3
            </span>
            <span>방장이 게임을 시작하면 팀이 배정됩니다</span>
          </li>
          <li className="flex items-start gap-3 text-gray-300">
            <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              4
            </span>
            <span>도둑은 숨고, 경찰은 추격하세요!</span>
          </li>
        </ol>
      </Card>

      {/* 홈으로 버튼 */}
      <div className="mt-6">
        <Button variant="outline" size="lg" fullWidth onClick={() => router.push("/")}>
          🏠 홈으로
        </Button>
      </div>
    </main>
  );
}

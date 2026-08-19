import type { RouteCandidate } from "../../types/routing";
import "./TransportModeToolbar.css";

// "보기모드" 툴바(지도/지하철/따릉이 — 결과를 어떻게 보여줄지)와는 별개로,
// "어떤 이동수단 조합으로 계산할지"를 고르는 토글. 실제로는 백엔드가 조합별로 후보를
// 다르게 내려줘야 하지만, 지금은 mock 후보를 modes 기준으로 프론트에서 필터링한다.
export type TransportModeFilter = "transit_walk" | "transit_only";

const OPTIONS: { key: TransportModeFilter; label: string }[] = [
  { key: "transit_walk", label: "대중교통 + 도보" },
  { key: "transit_only", label: "대중교통끼리만" },
];

export function matchesTransportModeFilter(route: RouteCandidate, filter: TransportModeFilter): boolean {
  const modes = new Set(route.segments.map((s) => s.mode));
  if (filter === "transit_walk") {
    // 도보는 허용, 따릉이는 제외.
    return !modes.has("bike");
  }
  // 대중교통끼리만: 도보/따릉이 구간 없이 지하철·버스 환승만.
  return !modes.has("bike") && !modes.has("walk");
}

interface TransportModeToolbarProps {
  value: TransportModeFilter;
  onChange: (value: TransportModeFilter) => void;
}

export function TransportModeToolbar({ value, onChange }: TransportModeToolbarProps) {
  return (
    <div className="transport-mode-toolbar">
      {OPTIONS.map((option) => (
        <button
          key={option.key}
          type="button"
          className={
            value === option.key
              ? "transport-mode-toolbar__item transport-mode-toolbar__item--active"
              : "transport-mode-toolbar__item"
          }
          onClick={() => onChange(option.key)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

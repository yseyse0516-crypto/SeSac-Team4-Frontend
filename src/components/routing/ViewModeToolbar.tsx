import "./ViewModeToolbar.css";

// 상세 동작(각 모드에서 실제로 뭘 다르게 보여줄지)은 아직 미정 — 지금은 탭 구조만 구현.
export type ViewMode = "map" | "subway" | "bike";

const MODES: { key: ViewMode; label: string; icon: string }[] = [
  { key: "map", label: "지도", icon: "🗺️" },
  { key: "subway", label: "지하철", icon: "🚇" },
  { key: "bike", label: "따릉이", icon: "🚲" },
];

interface ViewModeToolbarProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewModeToolbar({ value, onChange }: ViewModeToolbarProps) {
  return (
    <div className="view-mode-toolbar">
      {MODES.map((mode) => (
        <button
          key={mode.key}
          type="button"
          className={
            value === mode.key
              ? "view-mode-toolbar__item view-mode-toolbar__item--active"
              : "view-mode-toolbar__item"
          }
          onClick={() => onChange(mode.key)}
        >
          <span>{mode.icon}</span>
          <span>{mode.label}</span>
        </button>
      ))}
    </div>
  );
}

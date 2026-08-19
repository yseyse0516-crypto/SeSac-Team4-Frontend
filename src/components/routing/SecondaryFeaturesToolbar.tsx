import "./SecondaryFeaturesToolbar.css";

// 메인 기능(지도/노선도 + 검색)은 항상 보이고, 부가기능(비교표, 대여소 목록 등)은
// 이 툴바에서 눌러야만 펼쳐지게 해서 화면이 한 번에 다 펼쳐져 있지 않게 한다.
export interface SecondaryFeature {
  key: string;
  label: string;
  icon: string;
}

interface SecondaryFeaturesToolbarProps {
  features: SecondaryFeature[];
  activeKey: string | null;
  onSelect: (key: string | null) => void;
}

export function SecondaryFeaturesToolbar({ features, activeKey, onSelect }: SecondaryFeaturesToolbarProps) {
  if (features.length === 0) return null;

  return (
    <div className="secondary-toolbar">
      {features.map((feature) => (
        <button
          key={feature.key}
          type="button"
          className={
            activeKey === feature.key
              ? "secondary-toolbar__item secondary-toolbar__item--active"
              : "secondary-toolbar__item"
          }
          onClick={() => onSelect(activeKey === feature.key ? null : feature.key)}
        >
          <span>{feature.icon}</span>
          <span>{feature.label}</span>
        </button>
      ))}
    </div>
  );
}

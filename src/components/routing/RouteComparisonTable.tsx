import type { RouteCandidate } from "../../types/routing";
import "./RouteComparisonTable.css";

interface RouteComparisonTableProps {
  routes: RouteCandidate[];
}

function levelLabel(score: number) {
  if (score < 0.4) return "여유";
  if (score < 0.6) return "보통";
  if (score < 0.8) return "혼잡";
  return "매우 혼잡";
}

// 회의록: "최단거리 vs 덜 혼잡한 거리" 비교표 — 서비스 핵심 가치를 표로 직접 보여준다.
// backend.md의 "최단시간 vs 추천" 비교 응답 설계와 같은 개념을 프론트에서 표 형태로 시각화.
export function RouteComparisonTable({ routes }: RouteComparisonTableProps) {
  const fastest = routes.find((r) => r.path_type === "fastest") ?? routes[0];
  const recommended = routes.find((r) => r.is_recommended) ?? routes[0];

  if (!fastest || !recommended) return null;

  return (
    <div className="route-comparison">
      <h3 className="route-comparison__title">최단거리 vs 덜 혼잡한 경로</h3>
      <table className="route-comparison__table">
        <thead>
          <tr>
            <th></th>
            <th>최단시간</th>
            <th>추천(덜 혼잡)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>소요시간</td>
            <td>{fastest.total_time_min}분</td>
            <td>{recommended.total_time_min}분</td>
          </tr>
          <tr>
            <td>혼잡도</td>
            <td>{levelLabel(fastest.congestion_score)}</td>
            <td>{levelLabel(recommended.congestion_score)}</td>
          </tr>
          <tr>
            <td>분당개선</td>
            <td>{fastest.minute_improvement_ratio}</td>
            <td>{recommended.minute_improvement_ratio}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

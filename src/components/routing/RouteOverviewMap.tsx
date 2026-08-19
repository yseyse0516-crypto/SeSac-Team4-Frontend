import { useEffect, useRef, useState } from "react";
import type { LatLng, RouteCandidate } from "../../types/routing";
import { getCongestionLevel } from "../../constants/congestionLevels";
import { BIKE_DOCKS } from "../../constants/bikeDocks";
import { KAKAO_MAP_KEY, loadKakaoMaps } from "../../api/kakaoMapLoader";
import "./RouteOverviewMap.css";

// 회의록: 지도/따릉이 탭은 검색 전에도 지도가 상시로 떠 있어야 한다 — routes가 비어있어도
// center 기준으로 기본 지도를 그린다. 검색 결과가 있으면 그 위에 경로 선을 얹는다.
// 추천 경로는 초록 굵은 선, 나머지는 얇고 반투명하게. "추천 경로만 보기" 토글로 필터링 가능.
// 따릉이 탭에서는 지도 위 🚲 토글로 대여소 마커를 켜고 끌 수 있다(따릉이 앱처럼).

interface RouteOverviewMapProps {
  routes: RouteCandidate[];
  center: LatLng;
  showBikeToggle?: boolean;
}

export function RouteOverviewMap({ routes, center, showBikeToggle }: RouteOverviewMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const dockMarkersRef = useRef<any[]>([]);
  const [onlyRecommended, setOnlyRecommended] = useState(false);
  const [showDocks, setShowDocks] = useState(false);
  const [status, setStatus] = useState<"no-key" | "loading" | "ready" | "error">(
    KAKAO_MAP_KEY ? "loading" : "no-key"
  );

  const displayedRoutes = onlyRecommended ? routes.filter((r) => r.is_recommended) : routes;

  useEffect(() => {
    if (!KAKAO_MAP_KEY || !containerRef.current) return;

    let cancelled = false;
    setStatus("loading");
    loadKakaoMaps(KAKAO_MAP_KEY)
      .then(() => {
        if (cancelled || !containerRef.current) return;
        const kakao = window.kakao;
        const firstPoint = displayedRoutes[0]?.segments[0]?.start ?? center;
        const map = new kakao.maps.Map(containerRef.current, {
          center: new kakao.maps.LatLng(firstPoint.lat, firstPoint.lng),
          level: displayedRoutes.length > 0 ? 7 : 6,
        });
        mapRef.current = map;

        if (displayedRoutes.length > 0) {
          const bounds = new kakao.maps.LatLngBounds();
          // 추천 경로를 나중에(위에) 그려서 다른 경로 선에 덮이지 않게 한다.
          const ordered = [...displayedRoutes].sort(
            (a, b) => Number(a.is_recommended) - Number(b.is_recommended)
          );
          ordered.forEach((route) => {
            const level = getCongestionLevel(route.congestion_score);
            const path = route.segments
              .flatMap((segment) => [segment.start, segment.end])
              .map((point) => new kakao.maps.LatLng(point.lat, point.lng));
            path.forEach((point: any) => bounds.extend(point));

            new kakao.maps.Polyline({
              map,
              path,
              strokeWeight: route.is_recommended ? 6 : 3,
              strokeColor: level.color,
              strokeOpacity: route.is_recommended ? 1 : 0.5,
              strokeStyle: "solid",
            });
          });
          map.setBounds(bounds);
        }

        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyRecommended, routes.length, center.lat, center.lng]);

  // 따릉이 대여소 마커는 지도를 다시 그리지 않고 토글만으로 추가/제거한다.
  useEffect(() => {
    const kakao = window.kakao;
    if (!mapRef.current || !kakao || status !== "ready") return;

    dockMarkersRef.current.forEach((marker) => marker.setMap(null));
    dockMarkersRef.current = [];

    if (showDocks) {
      dockMarkersRef.current = BIKE_DOCKS.map(
        (dock) =>
          new kakao.maps.Marker({
            map: mapRef.current,
            position: new kakao.maps.LatLng(dock.lat, dock.lng),
            title: `${dock.name} (${dock.availableCount}대)`,
          })
      );
    }
  }, [showDocks, status]);

  return (
    <div className="route-overview-map-wrap">
      <div className="route-overview-map__toolbar">
        <span className="route-overview-map__label">추천 경로는 초록 굵은 선으로 표시돼요</span>
        {routes.length > 0 && (
          <button
            type="button"
            className="route-overview-map__toggle"
            onClick={() => setOnlyRecommended((v) => !v)}
          >
            {onlyRecommended ? "전체 경로 보기" : "추천 경로만 보기"}
          </button>
        )}
      </div>

      {KAKAO_MAP_KEY && status !== "error" && (
        <div className="route-overview-map__container">
          <div ref={containerRef} className="route-overview-map" />
          {showBikeToggle && status === "ready" && (
            <button
              type="button"
              className="route-overview-map__bike-toggle"
              onClick={() => setShowDocks((v) => !v)}
              aria-label="근처 따릉이 대여소 표시"
              title="근처 따릉이 대여소 표시"
            >
              🚲
            </button>
          )}
        </div>
      )}

      {(status === "no-key" || status === "error") && (
        <div className="route-overview-map route-overview-map--placeholder">
          {status === "error" ? (
            <span>지도를 불러오지 못했습니다.</span>
          ) : (
            <span>
              지도 미리보기는 카카오맵 키 설정 후 표시됩니다 (VITE_KAKAO_MAP_KEY).
              {displayedRoutes.length === 0 && " 검색하면 여기에 지도가 뜹니다."}
            </span>
          )}
          {displayedRoutes.map((route) => {
            const level = getCongestionLevel(route.congestion_score);
            return (
              <div key={route.id} className="route-overview-map__fallback-item">
                <span className="route-overview-map__dot" style={{ background: level.color }} />
                <span>
                  {route.total_time_min}분 · {level.label}
                  {route.is_recommended && " · 추천"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

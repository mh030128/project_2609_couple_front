import { useState } from "react";
import { loadKakaoMaps, toPlaceSuggestion } from "../utils/kakao.js";

/**
 * 카카오맵 키워드 장소검색 박스.
 * 장소를 선택하면 onSelect(suggestion)으로 { name, region, area, category, lat, lng, kakaoPlaceId }를 넘겨줍니다.
 */
export default function PlaceSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [error, setError] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");

  async function handleSearch(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!query.trim()) return;
    setStatus("loading");
    setError("");
    setResults([]);
    try {
      const kakao = await loadKakaoMaps();
      const places = new kakao.maps.services.Places();
      places.keywordSearch(query.trim(), (data, searchStatus) => {
        if (searchStatus === kakao.maps.services.Status.OK) {
          setResults(data.slice(0, 8));
          setStatus("done");
        } else if (searchStatus === kakao.maps.services.Status.ZERO_RESULT) {
          setResults([]);
          setStatus("done");
        } else {
          setError("검색 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.");
          setStatus("error");
        }
      });
    } catch (err) {
      setError(err.message || "카카오맵을 불러오지 못했어요.");
      setStatus("error");
    }
  }

  function handlePick(place) {
    const suggestion = toPlaceSuggestion(place);
    setSelectedLabel(`${suggestion.name} · ${suggestion.address}`);
    setResults([]);
    setQuery("");
    onSelect(suggestion);
  }

  return (
    <div className="place-search">
      <div className="place-search-row">
        <input
          type="text"
          placeholder="가게 이름으로 카카오맵에서 검색 (예: 봉천다찌)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.stopPropagation();
              handleSearch();
            }
          }}
        />
        <button type="button" onClick={handleSearch}>
          검색
        </button>
      </div>

      {status === "loading" && <p className="place-hint">검색 중이에요...</p>}
      {status === "error" && <p className="place-hint error">{error}</p>}
      {status === "done" && results.length === 0 && (
        <p className="place-hint">검색 결과가 없어요. 이름을 다르게 입력해보세요.</p>
      )}
      {results.length > 0 && (
        <div className="place-results">
          {results.map((place) => (
            <button
              type="button"
              key={place.id}
              className="place-result-item"
              onClick={() => handlePick(place)}
            >
              <span className="pname">{place.place_name}</span>
              <span className="paddr">{place.road_address_name || place.address_name}</span>
            </button>
          ))}
        </div>
      )}
      {selectedLabel && <div className="selected-place">선택됨: {selectedLabel}</div>}
    </div>
  );
}

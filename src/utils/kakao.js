// 카카오맵 JavaScript SDK를 한 번만 로드하고, kakao.maps 네임스페이스가 준비되면 resolve합니다.
// KAKAO_API_KEY_GUIDE.md에서 발급받은 JavaScript 키를 .env의 VITE_KAKAO_JS_KEY에 넣어주세요.

let loadPromise = null;

export function loadKakaoMaps() {
  if (loadPromise) return loadPromise;

  const appKey = import.meta.env.VITE_KAKAO_JS_KEY;

  loadPromise = new Promise((resolve, reject) => {
    if (!appKey || appKey.includes("여기에")) {
      reject(new Error("카카오맵 JavaScript 키가 설정되지 않았어요. .env의 VITE_KAKAO_JS_KEY를 확인해주세요."));
      return;
    }
    if (window.kakao && window.kakao.maps) {
      resolve(window.kakao);
      return;
    }
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services&autoload=false`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => resolve(window.kakao));
    };
    script.onerror = () => reject(new Error("카카오맵 SDK를 불러오지 못했어요. 도메인 등록 상태를 확인해주세요."));
    document.head.appendChild(script);
  });

  return loadPromise;
}

/** "서울특별시 관악구 봉천동" 같은 카카오 주소 문자열에서 큰 지역 단위를 뽑아냅니다. */
export function normalizeRegion(rawFirstToken) {
  const map = {
    서울특별시: "서울",
    서울시: "서울",
    부산광역시: "부산",
    대구광역시: "대구",
    인천광역시: "인천",
    광주광역시: "광주",
    대전광역시: "대전",
    울산광역시: "울산",
    세종특별자치시: "세종",
    경기도: "경기",
    강원특별자치도: "강원",
    강원도: "강원",
    충청북도: "충북",
    충청남도: "충남",
    전북특별자치도: "전북",
    전라북도: "전북",
    전남광주통합특별시: "전남",
    전라남도: "전남",
    경상북도: "경북",
    경상남도: "경남",
    제주특별자치도: "제주",
  };
  return map[rawFirstToken] || rawFirstToken;
}

/** 카카오 장소검색 결과 한 건을 폼에서 쓰기 좋은 형태로 변환합니다. */
export function toPlaceSuggestion(place) {
  const address = place.road_address_name || place.address_name || "";
  const tokens = address.split(" ").filter(Boolean);
  const region = tokens.length > 0 ? normalizeRegion(tokens[0]) : "";
  const area = tokens.length > 1 ? tokens.slice(1).join(" ") : address;
  return {
    name: place.place_name,
    region,
    area,
    category: (place.category_name || "").split(" > ").pop() || "",
    address,
    lat: Number(place.y),
    lng: Number(place.x),
    kakaoPlaceId: place.id,
  };
}

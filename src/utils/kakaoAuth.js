// 카카오 로그인 JavaScript SDK 로더.
// 카카오맵과 같은 JavaScript 키(VITE_KAKAO_JS_KEY)를 그대로 씁니다 — REST API 키는 백엔드에서만 사용해요.
// 카카오디벨로퍼스에서 "카카오 로그인" 상품을 활성화하고, redirectUri를 정확히 등록해야 동작합니다.

const SDK_URL = "https://t1.kakaocdn.net/kakao_js_sdk/2.8.3/kakao.min.js";

let loadPromise = null;

export function loadKakaoSdk() {
  if (loadPromise) return loadPromise;

  const jsKey = import.meta.env.VITE_KAKAO_JS_KEY;

  loadPromise = new Promise((resolve, reject) => {
    if (!jsKey || jsKey.includes("여기에")) {
      reject(new Error("카카오 JavaScript 키가 설정되지 않았어요. .env의 VITE_KAKAO_JS_KEY를 확인해주세요."));
      return;
    }
    if (window.Kakao && window.Kakao.isInitialized && window.Kakao.isInitialized()) {
      resolve(window.Kakao);
      return;
    }
    const script = document.createElement("script");
    script.src = SDK_URL;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      try {
        if (!window.Kakao.isInitialized()) {
          window.Kakao.init(jsKey);
        }
        resolve(window.Kakao);
      } catch (err) {
        reject(err);
      }
    };
    script.onerror = () => reject(new Error("카카오 로그인 SDK를 불러오지 못했어요. 잠시 후 다시 시도해주세요."));
    document.head.appendChild(script);
  });

  return loadPromise;
}

/** 로그인 시작 페이지와 콜백 페이지가 항상 같은 redirectUri를 쓰도록 한 곳에서 계산합니다. */
export function getKakaoRedirectUri() {
  return `${window.location.origin}/auth/kakao/callback`;
}

/** 카카오 로그인 페이지로 전체 화면 리다이렉트합니다 (팝업이 아니라 페이지 이동 방식이에요). */
export async function startKakaoLogin() {
  const Kakao = await loadKakaoSdk();
  Kakao.Auth.authorize({ redirectUri: getKakaoRedirectUri() });
}

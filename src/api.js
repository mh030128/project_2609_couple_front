const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const TOKEN_KEY = "muckit-token";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function setToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    /* localStorage 사용 불가 시 무시 */
  }
}

let unauthorizedHandler = null;
/** 토큰이 만료/무효화되어 401이 왔을 때 호출할 콜백을 등록합니다 (App.jsx에서 로그아웃 처리용). */
export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = fn;
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    setToken("");
    if (unauthorizedHandler) unauthorizedHandler();
    throw new Error("로그인이 필요해요. 다시 로그인해주세요.");
  }

  if (!res.ok) {
    let message = `요청에 실패했어요 (${res.status})`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
      /* ignore parse error */
    }
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // 인증 (카카오 로그인)
  loginWithKakao: (code, redirectUri) =>
    request("/api/auth/kakao", { method: "POST", body: JSON.stringify({ code, redirectUri }) }),
  me: () => request("/api/auth/me"),
  updateMyName: (name) => request("/api/auth/me", { method: "PUT", body: JSON.stringify({ name }) }),

  // 커플 연결
  createCouple: () => request("/api/couple", { method: "POST" }),
  joinCouple: (code) => request("/api/couple/join", { method: "POST", body: JSON.stringify({ code }) }),
  seedSampleData: () => request("/api/couple/seed", { method: "POST" }),

  // 맛집
  listRestaurants: () => request("/api/restaurants"),
  createRestaurant: (data) => request("/api/restaurants", { method: "POST", body: JSON.stringify(data) }),
  updateRestaurant: (id, data) => request(`/api/restaurants/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  toggleRestaurantVisited: (id, value) =>
    request(`/api/restaurants/${id}/visited`, { method: "PATCH", body: JSON.stringify({ value }) }),
  deleteRestaurant: (id) => request(`/api/restaurants/${id}`, { method: "DELETE" }),

  // 축제
  listFestivals: () => request("/api/festivals"),
  createFestival: (data) => request("/api/festivals", { method: "POST", body: JSON.stringify(data) }),
  updateFestival: (id, data) => request(`/api/festivals/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  toggleFestivalVisited: (id, value) =>
    request(`/api/festivals/${id}/visited`, { method: "PATCH", body: JSON.stringify({ value }) }),
  deleteFestival: (id) => request(`/api/festivals/${id}`, { method: "DELETE" }),

  // 배달 / 팝업 / 홈메이드
  listSnacks: () => request("/api/snacks"),
  createSnack: (data) => request("/api/snacks", { method: "POST", body: JSON.stringify(data) }),
  updateSnack: (id, data) => request(`/api/snacks/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  toggleSnackDone: (id, value) =>
    request(`/api/snacks/${id}/done`, { method: "PATCH", body: JSON.stringify({ value }) }),
  deleteSnack: (id) => request(`/api/snacks/${id}`, { method: "DELETE" }),
};

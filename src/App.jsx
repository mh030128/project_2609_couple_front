import { useEffect, useState } from "react";
import { api, getToken, setToken, setUnauthorizedHandler } from "./api.js";
import { parseDate, todayMidnight } from "./utils/date.js";
import { getKakaoRedirectUri } from "./utils/kakaoAuth.js";
import RestaurantTab from "./components/RestaurantTab.jsx";
import FestivalTab from "./components/FestivalTab.jsx";
import SnackTab from "./components/SnackTab.jsx";
import LoginScreen from "./components/auth/LoginScreen.jsx";
import NameScreen from "./components/auth/NameScreen.jsx";
import CoupleScreen from "./components/auth/CoupleScreen.jsx";

export default function App() {
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [user, setUser] = useState(null);

  const [tab, setTab] = useState("food");
  const [restaurants, setRestaurants] = useState([]);
  const [festivals, setFestivals] = useState([]);
  const [snacks, setSnacks] = useState([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    bootstrapAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user && user.name && user.coupleId) {
      loadAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.coupleId]);

  async function bootstrapAuth() {
    try {
      // 카카오 로그인 리다이렉트로 돌아온 경우: /auth/kakao/callback?code=...
      const isCallback = window.location.pathname === "/auth/kakao/callback";
      const code = isCallback ? new URLSearchParams(window.location.search).get("code") : null;

      if (code) {
        const result = await api.loginWithKakao(code, getKakaoRedirectUri());
        setToken(result.token);
        window.history.replaceState(null, "", "/");
        setUser(result.user);
        return;
      }

      if (isCallback) {
        // 콜백 경로인데 code가 없다면 로그인 취소/실패 → 처음 화면으로
        window.history.replaceState(null, "", "/");
      }

      const token = getToken();
      if (!token) return;
      const me = await api.me();
      setUser(me);
    } catch (err) {
      setToken("");
      setAuthError(err.message || "로그인에 실패했어요. 다시 시도해주세요.");
      window.history.replaceState(null, "", "/");
    } finally {
      setAuthLoading(false);
    }
  }

  async function loadAll() {
    try {
      const [r, f, s] = await Promise.all([api.listRestaurants(), api.listFestivals(), api.listSnacks()]);
      setRestaurants(r);
      setFestivals(f);
      setSnacks(s);
      setLoadError("");
    } catch (err) {
      setLoadError(err.message || "백엔드 서버에 연결할 수 없어요. 서버가 켜져 있는지 확인해주세요.");
    }
  }

  async function handleSetName(name) {
    const updated = await api.updateMyName(name);
    setUser(updated);
  }

  async function handleCreateCouple() {
    const result = await api.createCouple();
    setUser((prev) => ({ ...prev, coupleId: result.coupleId }));
    return result;
  }

  async function handleJoinCouple(code) {
    const result = await api.joinCouple(code);
    setUser((prev) => ({ ...prev, coupleId: result.coupleId }));
    return result;
  }

  function handleLogout() {
    setToken("");
    setUser(null);
    setRestaurants([]);
    setFestivals([]);
    setSnacks([]);
  }

  async function handleLoadSampleData() {
    await api.seedSampleData();
    await loadAll();
  }

  // ---- 맛집 ----
  async function createRestaurant(payload) {
    const created = await api.createRestaurant(payload);
    setRestaurants((prev) => [...prev, created]);
  }
  async function updateRestaurant(id, payload) {
    const updated = await api.updateRestaurant(id, payload);
    setRestaurants((prev) => prev.map((r) => (r.id === id ? updated : r)));
  }
  async function toggleRestaurantVisited(id, value) {
    const updated = await api.toggleRestaurantVisited(id, value);
    setRestaurants((prev) => prev.map((r) => (r.id === id ? updated : r)));
  }
  async function deleteRestaurant(id) {
    await api.deleteRestaurant(id);
    setRestaurants((prev) => prev.filter((r) => r.id !== id));
  }

  // ---- 축제 ----
  async function createFestival(payload) {
    const created = await api.createFestival(payload);
    setFestivals((prev) => [...prev, created]);
  }
  async function updateFestival(id, payload) {
    const updated = await api.updateFestival(id, payload);
    setFestivals((prev) => prev.map((f) => (f.id === id ? updated : f)));
  }
  async function toggleFestivalVisited(id, value) {
    const updated = await api.toggleFestivalVisited(id, value);
    setFestivals((prev) => prev.map((f) => (f.id === id ? updated : f)));
  }
  async function deleteFestival(id) {
    await api.deleteFestival(id);
    setFestivals((prev) => prev.filter((f) => f.id !== id));
  }

  // ---- 배달/팝업/홈메이드 ----
  async function createSnack(payload) {
    const created = await api.createSnack(payload);
    setSnacks((prev) => [...prev, created]);
  }
  async function updateSnack(id, payload) {
    const updated = await api.updateSnack(id, payload);
    setSnacks((prev) => prev.map((s) => (s.id === id ? updated : s)));
  }
  async function toggleSnackDone(id, value) {
    const updated = await api.toggleSnackDone(id, value);
    setSnacks((prev) => prev.map((s) => (s.id === id ? updated : s)));
  }
  async function deleteSnack(id) {
    await api.deleteSnack(id);
    setSnacks((prev) => prev.filter((s) => s.id !== id));
  }

  if (authLoading) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <p>불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen error={authError} />;
  }

  if (!user.name) {
    return <NameScreen onSubmit={handleSetName} />;
  }

  if (!user.coupleId) {
    return <CoupleScreen onCreate={handleCreateCouple} onJoin={handleJoinCouple} />;
  }

  const totalRestaurants = restaurants.length;
  const visitedRestaurants = restaurants.filter((r) => r.visited).length;
  const today = todayMidnight();
  const upcomingFestivals = festivals.filter((f) => {
    const end = parseDate(f.endDate || f.startDate);
    return end && end >= today;
  }).length;
  const triedSnacks = snacks.filter((s) => s.done).length;
  const noDataYet = !loadError && totalRestaurants === 0 && festivals.length === 0 && snacks.length === 0;

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-top">
          <div>
            <h1>먹킷리스트</h1>
            <p className="tagline">
              둘이 갈 곳, 친구랑 갈 곳, 기다리는 축제, 시켜먹고 만들어 먹을 것까지 — 하나로 모았어요.
            </p>
          </div>
          <div className="whoami">
            <span className="label">{user.name}님 반가워요</span>
            <button className="who-chip" onClick={handleLogout} type="button">
              로그아웃
            </button>
          </div>
        </div>

        <div className="stats">
          <div className="stat-tile">
            <div className="num">{totalRestaurants}</div>
            <div className="label">등록된 맛집</div>
          </div>
          <div className="stat-tile">
            <div className="num">{visitedRestaurants}</div>
            <div className="label">다녀온 곳</div>
          </div>
          <div className="stat-tile">
            <div className="num">{upcomingFestivals}</div>
            <div className="label">다가오는 축제</div>
          </div>
          <div className="stat-tile">
            <div className="num">{triedSnacks}</div>
            <div className="label">해본 배달·홈메이드</div>
          </div>
        </div>

        <div className={`sync${loadError ? " offline" : ""}`}>
          <span className="dot" />
          <span>{loadError || "서버와 실시간으로 같이 기록하는 중이에요"}</span>
        </div>

        {noDataYet && (
          <div className="sample-data-hint">
            <span>아직 기록이 없어요. 예전에 정리해둔 예시 데이터로 시작해볼까요?</span>
            <button type="button" onClick={handleLoadSampleData}>
              예시 데이터 불러오기
            </button>
          </div>
        )}
      </header>

      <nav className="tabs">
        <button className={`tab-btn${tab === "food" ? " active" : ""}`} onClick={() => setTab("food")} type="button">
          맛집 <span className="count">{restaurants.length}</span>
        </button>
        <button
          className={`tab-btn${tab === "festival" ? " active" : ""}`}
          onClick={() => setTab("festival")}
          type="button"
        >
          축제 <span className="count">{festivals.length}</span>
        </button>
        <button className={`tab-btn${tab === "snack" ? " active" : ""}`} onClick={() => setTab("snack")} type="button">
          야식&amp;홈메이드 <span className="count">{snacks.length}</span>
        </button>
      </nav>

      <div className="panel-shell">
        {tab === "food" && (
          <RestaurantTab
            items={restaurants}
            whoAmI={user.name}
            onCreate={createRestaurant}
            onUpdate={updateRestaurant}
            onToggleVisited={toggleRestaurantVisited}
            onDelete={deleteRestaurant}
          />
        )}
        {tab === "festival" && (
          <FestivalTab
            items={festivals}
            whoAmI={user.name}
            onCreate={createFestival}
            onUpdate={updateFestival}
            onToggleVisited={toggleFestivalVisited}
            onDelete={deleteFestival}
          />
        )}
        {tab === "snack" && (
          <SnackTab
            items={snacks}
            whoAmI={user.name}
            onCreate={createSnack}
            onUpdate={updateSnack}
            onToggleDone={toggleSnackDone}
            onDelete={deleteSnack}
          />
        )}
      </div>
    </div>
  );
}

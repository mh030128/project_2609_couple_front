import { useState } from "react";
import { startKakaoLogin } from "../../utils/kakaoAuth.js";

export default function LoginScreen({ error }) {
  const [starting, setStarting] = useState(false);
  const [localError, setLocalError] = useState("");

  async function handleClick() {
    setStarting(true);
    setLocalError("");
    try {
      await startKakaoLogin();
      // 성공하면 카카오 로그인 페이지로 이동하면서 화면이 바뀌므로 여기서 더 할 일은 없어요.
    } catch (err) {
      setLocalError(err.message || "카카오 로그인을 시작하지 못했어요.");
      setStarting(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1>먹킷리스트</h1>
        <p>둘만 보는 우리의 맛집 · 축제 · 야식 기록장이에요.</p>
        <button type="button" className="kakao-login-btn" onClick={handleClick} disabled={starting}>
          {starting ? "이동 중..." : "카카오로 시작하기"}
        </button>
        {(error || localError) && <p className="auth-error">{error || localError}</p>}
      </div>
    </div>
  );
}

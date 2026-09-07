import { useState } from "react";

export default function CoupleScreen({ onCreate, onJoin }) {
  const [mode, setMode] = useState(null); // null | "join" | "created"
  const [code, setCode] = useState("");
  const [createdCode, setCreatedCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    setBusy(true);
    setError("");
    try {
      const result = await onCreate();
      setCreatedCode(result.inviteCode);
      setMode("created");
    } catch (err) {
      setError(err.message || "코드를 만들지 못했어요.");
    } finally {
      setBusy(false);
    }
  }

  async function handleJoin(e) {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    setError("");
    try {
      await onJoin(code.trim());
    } catch (err) {
      setError(err.message || "코드를 확인해주세요.");
      setBusy(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1>커플 연결하기</h1>
        <p>둘 중 한 명이 코드를 만들고, 다른 한 명은 그 코드를 입력하면 같은 기록을 함께 볼 수 있어요.</p>

        {mode === "created" ? (
          <div className="invite-code-box">
            <p>이 코드를 상대방에게 공유해주세요</p>
            <div className="invite-code">{createdCode}</div>
            <p className="invite-code-hint">상대방이 로그인 후 이 코드를 입력하면 바로 연결돼요.</p>
          </div>
        ) : mode === "join" ? (
          <form onSubmit={handleJoin} className="couple-join-form">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="초대 코드 입력"
              maxLength={12}
              autoFocus
            />
            <div className="couple-choice-actions">
              <button type="button" className="btn-ghost" onClick={() => setMode(null)} disabled={busy}>
                뒤로
              </button>
              <button type="submit" className="btn-primary" disabled={busy || !code.trim()}>
                {busy ? "확인 중..." : "입장하기"}
              </button>
            </div>
          </form>
        ) : (
          <div className="couple-choice-actions">
            <button type="button" className="btn-primary" onClick={handleCreate} disabled={busy}>
              {busy ? "만드는 중..." : "코드 만들기"}
            </button>
            <button type="button" className="btn-ghost" onClick={() => setMode("join")} disabled={busy}>
              코드 입력하기
            </button>
          </div>
        )}
        {error && <p className="auth-error">{error}</p>}
      </div>
    </div>
  );
}

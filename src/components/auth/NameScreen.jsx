import { useState } from "react";

export default function NameScreen({ onSubmit }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    try {
      await onSubmit(name.trim());
    } catch (err) {
      setError(err.message || "저장하지 못했어요.");
      setSaving(false);
    }
  }

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>이름을 알려주세요</h1>
        <p>상대방에게 보여질 이름이에요. (예: 수잔, 남자친구)</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름 입력"
          maxLength={20}
          autoFocus
        />
        <button type="submit" disabled={saving || !name.trim()}>
          {saving ? "저장 중..." : "다음"}
        </button>
        {error && <p className="auth-error">{error}</p>}
      </form>
    </div>
  );
}

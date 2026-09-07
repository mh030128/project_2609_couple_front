import { useMemo, useState } from "react";
import DangerButton from "./DangerButton.jsx";

const TYPES = ["배달", "팝업", "홈메이드"];
const emptyForm = { type: "배달", brand: "", title: "", note: "" };

export default function SnackTab({ items, whoAmI, onCreate, onUpdate, onToggleDone, onDelete }) {
  const [typeFilter, setTypeFilter] = useState("전체");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [bumpId, setBumpId] = useState(null);

  const filtered = items.filter((s) => typeFilter === "전체" || s.type === typeFilter);

  const groups = useMemo(() => {
    return TYPES.map((type) => ({ type, items: filtered.filter((s) => s.type === type) })).filter(
      (g) => g.items.length > 0
    );
  }, [filtered]);

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(item) {
    setEditingId(item.id);
    setForm({
      type: item.type || "배달",
      brand: item.brand || "",
      title: item.title || "",
      note: item.note || "",
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    const payload = { ...form, addedBy: whoAmI };
    if (editingId) {
      await onUpdate(editingId, payload);
    } else {
      await onCreate(payload);
    }
    closeForm();
  }

  async function handleToggle(item) {
    setBumpId(item.id);
    setTimeout(() => setBumpId(null), 350);
    await onToggleDone(item.id, !item.done);
  }

  return (
    <section className="tab-panel">
      <div className="toolbar">
        <div className="chip-row">
          {["전체", ...TYPES].map((t) => (
            <button
              key={t}
              type="button"
              className={`chip${typeFilter === t ? " active" : ""}`}
              onClick={() => setTypeFilter(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <button className="add-btn" type="button" onClick={openCreateForm}>
          + 항목 추가
        </button>
      </div>

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h4>{editingId ? "수정하기" : "새 항목 추가"}</h4>
          <div className="form-grid">
            <div className="field">
              <label>종류</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>브랜드/장소</label>
              <input
                type="text"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                placeholder="예: 청년다방"
              />
            </div>
            <div className="field full">
              <label>메뉴/아이템 *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="예: 크림카레떡볶이"
              />
            </div>
            <div className="field full">
              <label>메모 (조합·방법)</label>
              <textarea
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="같이 먹는 조합이나 만드는 방법"
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-ghost" onClick={closeForm}>
              취소
            </button>
            <button type="submit" className="btn-primary">
              저장
            </button>
          </div>
        </form>
      )}

      {groups.length === 0 && <p className="empty-note">조건에 맞는 항목이 없어요.</p>}

      {groups.map((group) => (
        <div className="group" key={group.type}>
          <div className="group-title">
            {group.type} <span className="pill region-a">{group.items.length}개</span>
          </div>
          <div className="grid">
            {group.items.map((s) => (
              <article className="card" key={s.id}>
                <div className="card-top">
                  <span className="pill region-a">{s.type}</span>
                </div>
                <h3 className="card-title">{s.title}</h3>
                {s.brand && <p className="card-meta">{s.brand}</p>}
                {s.note && <p className="card-note">{s.note}</p>}
                <div className="card-actions">
                  <button
                    type="button"
                    className={`stamp-btn${s.done ? " is-stamped" : ""}${bumpId === s.id ? " bump" : ""}`}
                    onClick={() => handleToggle(s)}
                  >
                    {s.done ? "해봤어요 ✓" : "해볼 예정"}
                  </button>
                  <button type="button" className="icon-btn" onClick={() => openEditForm(s)}>
                    수정
                  </button>
                  <DangerButton onConfirm={() => onDelete(s.id)} />
                </div>
                {s.addedBy && <span className="added-by">추가: {s.addedBy}</span>}
              </article>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

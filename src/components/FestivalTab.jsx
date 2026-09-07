import { useMemo, useState } from "react";
import DangerButton from "./DangerButton.jsx";
import { ddayInfo, formatKDate } from "../utils/date.js";

const emptyForm = { name: "", location: "", startDate: "", endDate: "", note: "" };

export default function FestivalTab({ items, whoAmI, onCreate, onUpdate, onToggleVisited, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [bumpId, setBumpId] = useState(null);

  const sorted = useMemo(
    () => items.slice().sort((a, b) => (a.startDate || "").localeCompare(b.startDate || "")),
    [items]
  );

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(item) {
    setEditingId(item.id);
    setForm({
      name: item.name || "",
      location: item.location || "",
      startDate: item.startDate || "",
      endDate: item.endDate || "",
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
    if (!form.name.trim() || !form.startDate) return;
    const payload = { ...form, endDate: form.endDate || form.startDate, addedBy: whoAmI };
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
    await onToggleVisited(item.id, !item.visited);
  }

  return (
    <section className="tab-panel">
      <div className="toolbar">
        <span className="grow" />
        <button className="add-btn" type="button" onClick={openCreateForm}>
          + 축제 추가
        </button>
      </div>

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h4>{editingId ? "수정하기" : "새 축제 추가"}</h4>
          <div className="form-grid">
            <div className="field full">
              <label>이름 *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="예: 서울 디저트 페어"
              />
            </div>
            <div className="field">
              <label>장소</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="예: 일산 킨텍스"
              />
            </div>
            <div className="field">
              <label>시작일 *</label>
              <input
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div className="field">
              <label>종료일</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
            <div className="field full">
              <label>메모</label>
              <textarea
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="티켓, 준비물 등"
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

      {sorted.length === 0 && <p className="empty-note">등록된 축제가 없어요. 가고 싶은 축제를 추가해보세요.</p>}

      {sorted.map((f) => {
        const dd = ddayInfo(f.startDate, f.endDate);
        const dateLabel =
          formatKDate(f.startDate) + (f.endDate && f.endDate !== f.startDate ? ` ~ ${formatKDate(f.endDate)}` : "");
        return (
          <article className="card fest-card" key={f.id}>
            <div className="fest-dday">
              {dd.label}
              <small>{dateLabel}</small>
            </div>
            <div className="fest-body">
              <h3 className="card-title">{f.name}</h3>
              {f.location && <p className="card-meta">{f.location}</p>}
              {f.note && <p className="card-note">{f.note}</p>}
              <div className="card-actions">
                <button
                  type="button"
                  className={`stamp-btn${f.visited ? " is-stamped" : ""}${bumpId === f.id ? " bump" : ""}`}
                  onClick={() => handleToggle(f)}
                >
                  {f.visited ? "다녀왔어요 ✓" : "가고 싶어요"}
                </button>
                <button type="button" className="icon-btn" onClick={() => openEditForm(f)}>
                  수정
                </button>
                <DangerButton onConfirm={() => onDelete(f.id)} />
              </div>
              {f.addedBy && <span className="added-by">추가: {f.addedBy}</span>}
            </div>
          </article>
        );
      })}
    </section>
  );
}

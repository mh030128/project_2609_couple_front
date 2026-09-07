import { useMemo, useState } from "react";
import PlaceSearch from "./PlaceSearch.jsx";
import RestaurantDetailModal from "./RestaurantDetailModal.jsx";

const REGION_PRIORITY = { 여러지점: 1, 서울: 2, 경기: 3, 인천: 4 };
const regionClass = (region, index) => {
  if (region === "여러지점") return "region-a";
  if (region === "서울") return "region-b";
  if (region === "부산") return "region-c";

  return ["region-a", "region-b", "region-c"][index % 3];
};

const companionClass = (companion) => {
  if (companion === "함께") return "c-together";
  if (companion === "친구들") return "c-friends";
  return "c-undecided";
};

const sortRegions = (a, b) => {
  const pa = REGION_PRIORITY[a];
  const pb = REGION_PRIORITY[b];
  if (pa && pb) return pa - pb;
  if (pa) return -1;
  if (pb) return 1;
  return a.localeCompare(b, "ko");
};

const emptyForm = {
  name: "",
  region: "",
  area: "",
  category: "",
  companion: "",
  rating: 0,
  note: "",
  lat: null,
  lng: null,
  kakaoPlaceId: null,
};

export default function RestaurantTab({ items, whoAmI, onCreate, onUpdate, onToggleVisited, onDelete }) {
  const [regionFilter, setRegionFilter] = useState("전체");
  const [companionFilter, setCompanionFilter] = useState("전체");
  const [visitedOnly, setVisitedOnly] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [bumpId, setBumpId] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const detailItem = items.find((r) => r.id === detailId) || null;

  const regions = useMemo(() => {
    const seen = new Set();
    items.forEach((r) => seen.add(r.region || "미정"));
    const list = Array.from(seen).sort(sortRegions);
    return ["전체", ...list];
  }, [items]);

  const filtered = items.filter((r) => {
    if (regionFilter !== "전체" && (r.region || "미정") !== regionFilter) return false;
    if (companionFilter !== "전체" && (r.companion || "미정") !== companionFilter) return false;
    if (visitedOnly && !r.visited) return false;
    return true;
  });

  const groups = useMemo(() => {
    const map = new Map();
    filtered.forEach((r) => {
      const key = r.region || "미정";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(r);
    });
    const order = Array.from(map.keys()).sort(sortRegions);

    return order.map((region, idx) => ({
      region,
      cls: regionClass(region, idx),
      items: map.get(region).slice().sort((a, b) => (b.rating || 0) - (a.rating || 0) || a.name.localeCompare(b.name, "ko")),
    }));
  }, [filtered]);

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(item) {
    setEditingId(item.id);
    setForm({
      name: item.name || "",
      region: item.region || "",
      area: item.area || "",
      category: item.category || "",
      companion: item.companion || "",
      rating: item.rating || 0,
      note: item.note || "",
      lat: item.lat ?? null,
      lng: item.lng ?? null,
      kakaoPlaceId: item.kakaoPlaceId ?? null,
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function handlePlaceSelected(suggestion) {
    setForm((f) => ({
      ...f,
      name: f.name || suggestion.name,
      region: suggestion.region,
      area: suggestion.area,
      category: f.category || suggestion.category,
      lat: suggestion.lat,
      lng: suggestion.lng,
      kakaoPlaceId: suggestion.kakaoPlaceId,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
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
    await onToggleVisited(item.id, !item.visited);
  }

  async function handleRate(item, rating) {
    await onUpdate(item.id, {
      name: item.name,
      region: item.region || "",
      area: item.area || "",
      category: item.category || "",
      companion: item.companion || "",
      rating,
      note: item.note || "",
      lat: item.lat ?? null,
      lng: item.lng ?? null,
      kakaoPlaceId: item.kakaoPlaceId ?? null,
      addedBy: item.addedBy,
    });
  }

  return (
    <section className="tab-panel">
      <div className="toolbar">
        <div className="chip-row">
          {regions.map((r) => (
            <button
              key={r}
              className={`chip${regionFilter === r ? " active" : ""}`}
              onClick={() => setRegionFilter(r)}
              type="button"
            >
              {r}
            </button>
          ))}
        </div>
        <div className="chip-row chip-row-break">
          {["전체", "함께", "친구들", "미정"].map((c) => (
            <button
              key={c}
              className={`chip${companionFilter === c ? " active" : ""}`}
              onClick={() => setCompanionFilter(c)}
              type="button"
            >
              {c}
            </button>
          ))}
        </div>
        <label className="check-toggle">
          <input type="checkbox" checked={visitedOnly} onChange={(e) => setVisitedOnly(e.target.checked)} />
          다녀온 곳만
        </label>
        <button className="add-btn" type="button" onClick={openCreateForm}>
          + 맛집 추가
        </button>
      </div>

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <h4>{editingId ? "수정하기" : "새 맛집 추가"}</h4>

          <PlaceSearch onSelect={handlePlaceSelected} />

          <div className="form-grid" style={{ marginTop: 12 }}>
            <div className="field full">
              <label>이름 *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="검색 결과를 고르면 자동으로 채워져요"
              />
            </div>
            <div className="field">
              <label>지역</label>
              <input
                type="text"
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                placeholder="검색하면 자동 입력"
              />
            </div>
            <div className="field">
              <label>위치</label>
              <input
                type="text"
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
                placeholder="검색하면 자동 입력"
              />
            </div>
            <div className="field">
              <label>메뉴/카테고리</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="예: 스시바, 오마카세"
              />
            </div>
            <div className="field">
              <label>함께 갈 사람</label>
              <select value={form.companion} onChange={(e) => setForm({ ...form, companion: e.target.value })}>
                <option value="">미정</option>
                <option value="함께">함께</option>
                <option value="친구들">친구들</option>
              </select>
            </div>
            <div className="field">
              <label>별점</label>
              <div className="star-pick">
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={n <= form.rating ? "on" : ""}
                    onClick={() => setForm({ ...form, rating: form.rating === n ? n - 1 : n })}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div className="field full">
              <label>메모</label>
              <textarea
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="가격, 웨이팅, 추천 메뉴 등"
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

      {groups.length === 0 && <p className="empty-note">조건에 맞는 맛집이 없어요. 필터를 바꾸거나 새로 추가해보세요.</p>}

      {groups.map((group) => (
        <div className="group" key={group.region}>
          <div className="group-title">
            {group.region} <span className={`pill ${group.cls}`}>{group.items.length}곳</span>
          </div>
          <div className="grid">
            {group.items.map((r) => {
              const meta = [r.area, r.category].filter(Boolean).join(" · ");
              return (
                <article
                  className="card card-clickable"
                  key={r.id}
                  onClick={() => setDetailId(r.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setDetailId(r.id);
                  }}
                >
                  <div className="card-top">
                    <span className={`pill ${group.cls}`}>{group.region}</span>
                    {!r.visited && r.rating > 0 && <span className="stars">{"★".repeat(r.rating)}</span>}
                  </div>
                  <h3 className="card-title">{r.name}</h3>
                  {meta && <p className="card-meta">{meta}</p>}
                  <span className={`pill companion ${companionClass(r.companion)}`}>{r.companion || "미정"}</span>
                  {r.note && <p className="card-note">{r.note}</p>}
                  <div className="card-actions">
                    <button
                      type="button"
                      className={`stamp-btn${r.visited ? " is-stamped" : ""}${bumpId === r.id ? " bump" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle(r);
                      }}
                    >
                      {r.visited ? "다녀왔어요 ✓" : "다녀올 예정"}
                    </button>
                    {r.visited && (
                      <div className="star-pick" onClick={(e) => e.stopPropagation()}>
                        {[1, 2, 3].map((n) => (
                          <button
                            key={n}
                            type="button"
                            className={n <= (r.rating || 0) ? "on" : ""}
                            onClick={() => handleRate(r, r.rating === n ? n - 1 : n)}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ))}

      <RestaurantDetailModal
        item={detailItem}
        onClose={() => setDetailId(null)}
        onEdit={(item) => {
          setDetailId(null);
          openEditForm(item);
        }}
        onDelete={(id) => {
          onDelete(id);
          setDetailId(null);
        }}
        onToggleVisited={(item) => handleToggle(item)}
        onRate={(item, rating) => handleRate(item, rating)}
      />
    </section>
  );
}
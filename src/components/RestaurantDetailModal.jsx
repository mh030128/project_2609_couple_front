import DangerButton from "./DangerButton.jsx";

const companionClass = (companion) => {
  if (companion === "함께") return "c-together";
  if (companion === "친구들") return "c-friends";
  return "c-undecided";
};

/** 맛집 카드를 클릭하면 뜨는 상세 팝업. 여기서 다녀왔어요 체크, 수정, 삭제를 다 할 수 있어요. */
export default function RestaurantDetailModal({ item, onClose, onEdit, onDelete, onToggleVisited, onRate }) {
  if (!item) return null;
  const meta = [item.area, item.category].filter(Boolean).join(" · ");

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="닫기">
          ✕
        </button>

        <div className="modal-top">
          {item.region && <span className="pill region-a">{item.region}</span>}
          {!item.visited && item.rating > 0 && <span className="stars">{"★".repeat(item.rating)}</span>}
        </div>

        <h3 className="modal-title">{item.name}</h3>
        {meta && <p className="modal-meta">{meta}</p>}
        <span className={`pill companion ${companionClass(item.companion)}`}>{item.companion || "미정"}</span>
        {item.note && <p className="modal-note">{item.note}</p>}

        <div className="modal-actions">
          <button
            type="button"
            className={`stamp-btn${item.visited ? " is-stamped" : ""}`}
            onClick={() => onToggleVisited(item)}
          >
            {item.visited ? "다녀왔어요 ✓" : "다녀올 예정"}
          </button>
          <button type="button" className="btn-ghost" onClick={() => onEdit(item)}>
            수정
          </button>
          <DangerButton onConfirm={() => onDelete(item.id)} />
        </div>

        {item.visited && (
          <div className="modal-rate">
            <span>이번 방문 별점</span>
            <div className="star-pick">
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={n <= (item.rating || 0) ? "on" : ""}
                  onClick={() => onRate(item, item.rating === n ? n - 1 : n)}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
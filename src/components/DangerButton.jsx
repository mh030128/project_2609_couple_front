import { useRef, useState } from "react";

/** 한 번 누르면 "정말 삭제?"로 바뀌고, 3초 안에 다시 누르면 실제로 삭제를 실행합니다. */
export default function DangerButton({ onConfirm, children = "삭제" }) {
  const [confirming, setConfirming] = useState(false);
  const timerRef = useRef(null);

  function handleClick() {
    if (confirming) {
      clearTimeout(timerRef.current);
      setConfirming(false);
      onConfirm();
      return;
    }
    setConfirming(true);
    timerRef.current = setTimeout(() => setConfirming(false), 3000);
  }

  return (
    <button
      type="button"
      className={`icon-btn danger${confirming ? " confirming" : ""}`}
      onClick={handleClick}
    >
      {confirming ? "정말 삭제?" : children}
    </button>
  );
}

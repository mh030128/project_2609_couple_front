const WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"];

export function parseDate(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatKDate(iso) {
  const d = parseDate(iso);
  if (!d) return "";
  return `${d.getMonth() + 1}월 ${d.getDate()}일(${WEEKDAY[d.getDay()]})`;
}

export function todayMidnight() {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
}

export function ddayInfo(startIso, endIso) {
  const today = todayMidnight();
  const start = parseDate(startIso);
  const end = parseDate(endIso || startIso);
  if (!start) return { label: "", state: "" };
  if (today > end) return { label: "종료", state: "past" };
  if (today >= start && today <= end) return { label: "진행중", state: "now" };
  const diff = Math.round((start - today) / 86400000);
  return { label: diff === 0 ? "D-DAY" : `D-${diff}`, state: "upcoming" };
}

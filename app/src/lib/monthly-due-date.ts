const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function pad2(value: number) {
  return value.toString().padStart(2, "0");
}

function clampDay(day: number) {
  if (!Number.isFinite(day)) return "";
  return Math.min(Math.max(Math.trunc(day), 1), 31).toString();
}

export function getMonthlyDueDay(value?: string) {
  if (!value) return "";

  const match = value.match(ISO_DATE_PATTERN);
  if (match) {
    return String(Number(match[3]));
  }

  return clampDay(Number(value));
}

export function buildMonthlyDueDate(dayValue: string, anchorDate?: string) {
  const day = Number(dayValue);
  if (!Number.isFinite(day) || day < 1 || day > 31) return "";

  const anchorMatch = anchorDate?.match(ISO_DATE_PATTERN);
  const now = new Date();
  const year = anchorMatch ? Number(anchorMatch[1]) : now.getFullYear();
  const month = anchorMatch ? Number(anchorMatch[2]) : now.getMonth() + 1;
  const lastDay = new Date(year, month, 0).getDate();
  const safeDay = Math.min(Math.trunc(day), lastDay);

  return `${year}-${pad2(month)}-${pad2(safeDay)}`;
}

export function formatMonthlyDueDay(value?: string) {
  const day = getMonthlyDueDay(value);
  return day ? `Todo dia ${day}` : "—";
}

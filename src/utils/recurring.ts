import type { Frequency, RecurringRule } from "../types";

export const frequencyOptions: { value: Frequency; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export const frequencyLabels: Record<Frequency, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

const MAX_CATCH_UP = 1000;

const pad = (n: number) => String(n).padStart(2, "0");
const toISO = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;
const daysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate(); // m: 1 تا 12

export function getOccurrenceDate(
  startDate: string,
  frequency: Frequency,
  index: number,
): string {
  const [y, m, d] = startDate.split("-").map(Number);

  if (frequency === "weekly") {
    const date = new Date(y, m - 1, d + index * 7);
    return toISO(date.getFullYear(), date.getMonth() + 1, date.getDate());
  }

  const total = m - 1 + (frequency === "monthly" ? index : index * 12);
  const year = y + Math.floor(total / 12);
  const month = (total % 12) + 1;
  return toISO(year, month, Math.min(d, daysInMonth(year, month)));
}

export function getDueOccurrences(
  rule: RecurringRule,
  todayISO: string,
): string[] {
  if (!rule.active) return [];

  const dates: string[] = [];
  let index = rule.occurrences;

  while (dates.length < MAX_CATCH_UP) {
    const date = getOccurrenceDate(rule.startDate, rule.frequency, index);
    if (date > todayISO) break;
    if (rule.endDate && date > rule.endDate) break;
    dates.push(date);
    index++;
  }

  return dates;
}

export function countOccurrencesBefore(
  startDate: string,
  frequency: Frequency,
  dateISO: string,
): number {
  let index = 0;
  while (getOccurrenceDate(startDate, frequency, index) < dateISO) index++;
  return index;
}

export function getNextDate(rule: RecurringRule): string | null {
  const next = getOccurrenceDate(
    rule.startDate,
    rule.frequency,
    rule.occurrences,
  );
  return rule.endDate && next > rule.endDate ? null : next;
}

export type RuleStatus = "active" | "paused" | "ended";

export function getRuleStatus(rule: RecurringRule): RuleStatus {
  if (!rule.active) return "paused";
  return getNextDate(rule) === null ? "ended" : "active";
}

export const PLANS = {
  free: { booksPerPeriod: 2, periodLabel: "month" as const, loanDurationDays: 14 },
  pro: { booksPerPeriod: 8, periodLabel: "month" as const, loanDurationDays: 21 },
  premium: { booksPerPeriod: 120, periodLabel: "year" as const, loanDurationDays: 30 },
};

export function getPeriodStart(periodLabel: "month" | "year"): Date {
  const now = new Date();
  return periodLabel === "month"
    ? new Date(now.getFullYear(), now.getMonth(), 1)
    : new Date(now.getFullYear(), 0, 1);
}
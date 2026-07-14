// export const PLANS = {
//   free: { booksPerPeriod: 2, periodLabel: "month" as const, loanDurationDays: 14 },
//   pro: { booksPerPeriod: 8, periodLabel: "month" as const, loanDurationDays: 21 },
//   premium: { booksPerPeriod: 120, periodLabel: "year" as const, loanDurationDays: 30 },
// };

// export function getPeriodStart(periodLabel: "month" | "year"): Date {
//   const now = new Date();
//   return periodLabel === "month"
//     ? new Date(now.getFullYear(), now.getMonth(), 1)
//     : new Date(now.getFullYear(), 0, 1);
// }

type PlanKey = "free" | "pro" | "premium";

interface PlanConfig {
  booksPerPeriod: number;
  periodLabel: "month" | "year";
  loanDurationDays: number;
  stripePriceId?: string;
}

export const PLANS: Record<PlanKey, PlanConfig> = {
  free: { booksPerPeriod: 2, periodLabel: "month", loanDurationDays: 14 },
  pro: {
    booksPerPeriod: 8,
    periodLabel: "month",
    loanDurationDays: 21,
    stripePriceId: "price_1TsiyxBCvf9QGi3o9R92JeeI",
  },
  premium: {
    booksPerPeriod: 120,
    periodLabel: "year",
    loanDurationDays: 30,
    stripePriceId: "price_1Tsj1fBCvf9QGi3oYo1qbIWG",
  },
};

export function getPeriodStart(periodLabel: "month" | "year"): Date {
  const now = new Date();
  return periodLabel === "month"
    ? new Date(now.getFullYear(), now.getMonth(), 1)
    : new Date(now.getFullYear(), 0, 1);
}
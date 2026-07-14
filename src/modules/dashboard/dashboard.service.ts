import { ObjectId } from "mongodb";
import { usersCollection } from "../auth/auth.types";
import { bookingsCollection } from "../bookings/booking.types";
import { favoritesCollection } from "../favorites/favorite.types";
import { PLANS, getPeriodStart } from "../../config/plans";
import { AppError } from "../../middlewares/errorHandler";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export interface DashboardStats {
  activeBookings: number;
  overdueBookings: number;
  returnedBookings: number;
  totalFavorites: number;
  plan: "free" | "pro" | "premium";
  planLimit: number;
  planUsed: number;
  periodLabel: "month" | "year";
  periodResetDate: string;
  monthlyBookings: { month: string; count: number }[];
}

async function getMonthlyBookingCounts(userId: ObjectId) {
  const now = new Date();
  const rangeStart = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const results = await bookingsCollection()
    .aggregate<{ _id: { year: number; month: number }; count: number }>([
      { $match: { userId, bookedAt: { $gte: rangeStart } } },
      { $group: { _id: { year: { $year: "$bookedAt" }, month: { $month: "$bookedAt" } }, count: { $sum: 1 } } },
    ])
    .toArray();

  const countMap = new Map(results.map((r) => [`${r._id.year}-${r._id.month}`, r.count]));

  const monthlyBookings: { month: string; count: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    monthlyBookings.push({
      month: `${MONTH_LABELS[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`,
      count: countMap.get(key) ?? 0,
    });
  }
  return monthlyBookings;
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const uid = new ObjectId(userId);
  const user = await usersCollection().findOne({ _id: uid });
  if (!user) throw new AppError("User not found", 404);

  const now = new Date();

  const [activeBookings, overdueBookings, returnedBookings, totalFavorites, monthlyBookings] = await Promise.all([
    bookingsCollection().countDocuments({ userId: uid, status: "active" }),
    bookingsCollection().countDocuments({ userId: uid, status: "active", dueDate: { $lt: now } }),
    bookingsCollection().countDocuments({ userId: uid, status: "returned" }),
    favoritesCollection().countDocuments({ userId: uid }),
    getMonthlyBookingCounts(uid),
  ]);

  const plan = PLANS[user.plan];
  const periodStart = getPeriodStart(plan.periodLabel);
  const planUsed = await bookingsCollection().countDocuments({ userId: uid, bookedAt: { $gte: periodStart } });
  const periodResetDate =
    plan.periodLabel === "month"
      ? new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 1)
      : new Date(periodStart.getFullYear() + 1, 0, 1);

  return {
    activeBookings,
    overdueBookings,
    returnedBookings,
    totalFavorites,
    plan: user.plan,
    planLimit: plan.booksPerPeriod,
    planUsed,
    periodLabel: plan.periodLabel,
    periodResetDate: periodResetDate.toISOString(),
    monthlyBookings,
  };
}
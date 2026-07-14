import { ObjectId } from "mongodb";
import { usersCollection } from "../auth/auth.types";
import { DEFAULT_AVATAR_URL } from "../auth/auth.service";
import { bookingsCollection } from "../bookings/booking.types";
import { paymentsCollection } from "../subscriptions/payment.types";
import { AppError } from "../../middlewares/errorHandler";
import { booksCollection } from "../books/book.types";

export async function listAllUsers(page: number, limit: number) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    usersCollection()
      .find({}, { projection: { passwordHash: 0 } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    usersCollection().countDocuments(),
  ]);

  return {
    items: items.map((u) => ({
      id: u._id!.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      plan: u.plan,
      avatarUrl: u.avatarUrl ?? DEFAULT_AVATAR_URL,
      createdAt: u.createdAt,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateUserRole(adminUserId: string, targetUserId: string, role: "user" | "admin") {
  if (adminUserId === targetUserId) throw new AppError("You cannot change your own role", 400);
  if (!ObjectId.isValid(targetUserId)) throw new AppError("Invalid user id", 400);

  const result = await usersCollection().findOneAndUpdate(
    { _id: new ObjectId(targetUserId) },
    { $set: { role } },
    { returnDocument: "after" }
  );
  if (!result) throw new AppError("User not found", 404);

  return { id: result._id!.toString(), name: result.name, email: result.email, role: result.role };
}

interface BookingAggregateRow {
  _id: ObjectId;
  bookTitle: string;
  bookedAt: Date;
  dueDate: Date;
  returnedAt: Date | null;
  status: "active" | "returned";
  userName?: string;
  userEmail?: string;
}

export async function listAllBookings(page: number, limit: number) {
  const skip = (page - 1) * limit;

  const pipeline = [
    { $sort: { bookedAt: -1 as const } },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        bookTitle: 1,
        bookedAt: 1,
        dueDate: 1,
        returnedAt: 1,
        status: 1,
        userName: "$user.name",
        userEmail: "$user.email",
      },
    },
  ];

  const [items, total] = await Promise.all([
    bookingsCollection().aggregate<BookingAggregateRow>(pipeline).toArray(),
    bookingsCollection().countDocuments(),
  ]);

  return {
    items: items.map((b) => ({
      id: b._id.toString(),
      userName: b.userName ?? "Deleted user",
      userEmail: b.userEmail ?? "—",
      bookTitle: b.bookTitle,
      bookedAt: b.bookedAt,
      dueDate: b.dueDate,
      returnedAt: b.returnedAt,
      status: b.status,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function listAllPayments(page: number, limit: number) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    paymentsCollection().find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
    paymentsCollection().countDocuments(),
  ]);

  return {
    items: items.map((p) => ({
      id: p._id!.toString(),
      userName: p.userName,
      userEmail: p.userEmail,
      plan: p.plan,
      amountTotal: p.amountTotal,
      currency: p.currency,
      stripeSessionId: p.stripeSessionId,
      status: p.status,
      createdAt: p.createdAt,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

async function getTrailingMonths<T extends { _id: { year: number; month: number }; value: number }>(
  results: T[]
) {
  const now = new Date();
  const map = new Map(results.map((r) => [`${r._id.year}-${r._id.month}`, r.value]));
  const out: { month: string; value: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    out.push({ month: `${MONTH_LABELS[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`, value: map.get(key) ?? 0 });
  }
  return out;
}

export async function getAdminStats() {
  const now = new Date();
  const rangeStart = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const [
    totalUsers,
    totalBooks,
    activeBookings,
    overdueBookings,
    returnedBookings,
    revenueAgg,
    planAgg,
    categoryAgg,
    revenueByMonth,
    bookingsByMonth,
  ] = await Promise.all([
    usersCollection().countDocuments(),
    booksCollection().countDocuments(),
    bookingsCollection().countDocuments({ status: "active" }),
    bookingsCollection().countDocuments({ status: "active", dueDate: { $lt: now } }),
    bookingsCollection().countDocuments({ status: "returned" }),
    paymentsCollection()
      .aggregate<{ _id: null; total: number }>([{ $group: { _id: null, total: { $sum: "$amountTotal" } } }])
      .toArray(),
    usersCollection()
      .aggregate<{ _id: string; count: number }>([{ $group: { _id: "$plan", count: { $sum: 1 } } }])
      .toArray(),
    booksCollection()
      .aggregate<{ _id: string; count: number }>([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ])
      .toArray(),
    paymentsCollection()
      .aggregate<{ _id: { year: number; month: number }; value: number }>([
        { $match: { createdAt: { $gte: rangeStart } } },
        {
          $group: {
            _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
            value: { $sum: "$amountTotal" },
          },
        },
      ])
      .toArray(),
    bookingsCollection()
      .aggregate<{ _id: { year: number; month: number }; value: number }>([
        { $match: { bookedAt: { $gte: rangeStart } } },
        {
          $group: {
            _id: { year: { $year: "$bookedAt" }, month: { $month: "$bookedAt" } },
            value: { $sum: 1 },
          },
        },
      ])
      .toArray(),
  ]);

  const planMap: Record<string, number> = { free: 0, pro: 0, premium: 0 };
  planAgg.forEach((p) => { planMap[p._id] = p.count; });

  const monthlyRevenue = await getTrailingMonths(revenueByMonth);
  const monthlyBookings = await getTrailingMonths(bookingsByMonth);

  return {
    totalUsers,
    totalBooks,
    activeBookings,
    overdueBookings,
    returnedBookings,
    totalRevenue: revenueAgg[0]?.total ?? 0,
    planDistribution: [
      { plan: "free", count: planMap.free },
      { plan: "pro", count: planMap.pro },
      { plan: "premium", count: planMap.premium },
    ],
    topCategories: categoryAgg.map((c) => ({ category: c._id, count: c.count })),
    monthlyRevenue: monthlyRevenue.map((m) => ({ month: m.month, amount: m.value })),
    monthlyBookings: monthlyBookings.map((m) => ({ month: m.month, count: m.value })),
  };
}
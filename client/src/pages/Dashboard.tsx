import { AppLayout } from "@/components/layout/AppLayout";
import { useAppointments } from "@/hooks/use-appointments";
import { useAuth } from "@/hooks/use-auth";
import { useTrial } from "@/hooks/use-trial";
import { useSelectedStore } from "@/hooks/use-store";
import { useStaffList } from "@/hooks/use-staff";
import { TrialCountdownBanner } from "@/components/TrialCountdownBanner";
import { formatInTz, toStoreLocal, getNowInTimezone } from "@/lib/timezone";
import {
  isSameDay,
  subDays,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  format,
} from "date-fns";
import { NotificationBell } from "@/components/NotificationBell";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function Dashboard() {
  const { user } = useAuth();
  const { selectedStore } = useSelectedStore();
  const { daysRemaining, subscriptionStatus } = useTrial();
  const timezone = selectedStore?.timezone || "UTC";
  const storeNow = getNowInTimezone(timezone);

  const { data: appointments } = useAppointments();
  const { data: staffList } = useStaffList();

  const getHour = () => {
    const h = storeNow.getHours();
    if (h < 12) return "morning";
    if (h < 17) return "afternoon";
    return "evening";
  };

  const todayAppointments = appointments?.filter((apt: any) => {
    const localDate = toStoreLocal(apt.date, timezone);
    return isSameDay(localDate, storeNow);
  }) || [];

  const yesterdayAppointments = appointments?.filter((apt: any) => {
    const localDate = toStoreLocal(apt.date, timezone);
    return isSameDay(localDate, subDays(storeNow, 1));
  }) || [];

  const monthStart = startOfMonth(storeNow);
  const monthEnd = endOfMonth(storeNow);
  const lastMonthStart = startOfMonth(subDays(monthStart, 1));
  const lastMonthEnd = endOfMonth(subDays(monthStart, 1));

  const thisMonthAppointments = appointments?.filter((apt: any) => {
    const localDate = toStoreLocal(apt.date, timezone);
    return isWithinInterval(localDate, { start: monthStart, end: monthEnd });
  }) || [];

  const lastMonthAppointments = appointments?.filter((apt: any) => {
    const localDate = toStoreLocal(apt.date, timezone);
    return isWithinInterval(localDate, { start: lastMonthStart, end: lastMonthEnd });
  }) || [];

  const getRevenue = (appts: any[]) =>
    appts.reduce((sum: number, apt: any) => {
      const paid = parseFloat(apt.totalPaid || "0");
      return sum + (isNaN(paid) ? 0 : paid);
    }, 0);

  const thisMonthRevenue = getRevenue(thisMonthAppointments);
  const lastMonthRevenue = getRevenue(lastMonthAppointments);
  const monthRevenueChange =
    lastMonthRevenue > 0
      ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : 0;

  const todayCount = todayAppointments.filter(
    (a: any) => a.status !== "cancelled"
  ).length;
  const yesterdayCount = yesterdayAppointments.filter(
    (a: any) => a.status !== "cancelled"
  ).length;
  const bookingDiff = todayCount - yesterdayCount;

  const staffCount = staffList?.length || 1;
  const dailyCapacity = staffCount * 8;
  const fillRate = Math.min(
    100,
    Math.round((todayCount / dailyCapacity) * 100)
  );

  const last7Days = Array.from({ length: 7 }, (_, i) => subDays(storeNow, 6 - i));
  const chartData = last7Days.map((day) => {
    const dayAppts = appointments?.filter((apt: any) => {
      const localDate = toStoreLocal(apt.date, timezone);
      return isSameDay(localDate, day);
    }) || [];
    return {
      day: format(day, "EEE"),
      revenue: getRevenue(dayAppts),
      isToday: isSameDay(day, storeNow),
    };
  });

  const sortedToday = [...todayAppointments]
    .filter((a: any) => a.status !== "cancelled")
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const avatarColors = [
    "from-violet-500 to-purple-600",
    "from-pink-500 to-rose-500",
    "from-teal-400 to-emerald-500",
    "from-amber-400 to-orange-500",
    "from-sky-400 to-blue-500",
    "from-fuchsia-500 to-pink-500",
  ];

  const getAvatarColor = (name: string) => {
    const idx = (name?.charCodeAt(0) || 0) % avatarColors.length;
    return avatarColors[idx];
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  const statusStyle: Record<string, string> = {
    confirmed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    "no-show": "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
    cancelled: "bg-gray-100 text-gray-500",
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-muted-foreground text-sm mb-0.5">
            {formatInTz(storeNow, timezone, "EEEE, d MMMM")}
          </p>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Good {getHour()}, {user?.firstName || "there"} 👋
          </h1>
        </div>
        <NotificationBell />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Revenue this month — dark card */}
        <div className="rounded-2xl p-6 bg-[#18103a] text-white shadow-lg">
          <p className="text-sm text-white/60 mb-4 font-medium">Revenue this month</p>
          <p className="text-3xl font-bold font-display mb-2">
            ${thisMonthRevenue.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          {lastMonthRevenue > 0 ? (
            <p className={`text-sm font-medium ${monthRevenueChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {monthRevenueChange >= 0 ? "↑" : "↓"} {Math.abs(monthRevenueChange)}% vs last month
            </p>
          ) : (
            <p className="text-sm text-white/40">First month of data</p>
          )}
        </div>

        {/* Bookings today */}
        <div className="rounded-2xl p-6 bg-card border border-border shadow-sm">
          <p className="text-sm text-muted-foreground mb-4 font-medium">Bookings today</p>
          <p className="text-3xl font-bold font-display mb-2 text-foreground">{todayCount}</p>
          {yesterdayCount > 0 ? (
            <p className={`text-sm font-medium ${bookingDiff >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
              {bookingDiff >= 0 ? "↑" : "↓"} {Math.abs(bookingDiff)} {bookingDiff === 1 ? "more" : bookingDiff === -1 ? "less" : "more"} than yesterday
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No data from yesterday</p>
          )}
        </div>

        {/* Fill rate */}
        <div className="rounded-2xl p-6 bg-card border border-border shadow-sm">
          <p className="text-sm text-muted-foreground mb-4 font-medium">Fill rate</p>
          <p className="text-3xl font-bold font-display mb-3 text-foreground">{fillRate}%</p>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="h-2 rounded-full bg-amber-500 transition-all duration-500"
              style={{ width: `${fillRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="rounded-2xl border border-border bg-card shadow-sm p-6 mb-6">
        <p className="text-sm font-semibold text-foreground mb-5">Revenue — last 7 days</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} barSize={28} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis hide />
            <Bar dataKey="revenue" radius={[6, 6, 6, 6]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isToday ? "#f59e0b" : "#7c3aed"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Today's Appointments */}
      <div className="rounded-2xl border border-border bg-card shadow-sm p-6">
        <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-4">
          Today's Appointments
        </p>

        {sortedToday.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No appointments scheduled for today.
          </p>
        ) : (
          <div className="space-y-1">
            {sortedToday.map((apt: any) => {
              const customerName = apt.customer?.name || apt.customerName || "Guest";
              const serviceName = apt.service?.name || "Service";
              const status = (apt.status || "pending").toLowerCase();
              const initials = getInitials(customerName);
              const avatarGrad = getAvatarColor(customerName);
              const price = parseFloat(apt.totalPaid || apt.price || "0");

              return (
                <div
                  key={apt.id}
                  className="flex items-center gap-4 py-3 px-2 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  {/* Time */}
                  <span className="text-sm text-muted-foreground w-12 shrink-0 font-medium">
                    {formatInTz(apt.date, timezone, "HH:mm")}
                  </span>

                  {/* Avatar */}
                  <div
                    className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarGrad} flex items-center justify-center text-white text-xs font-bold shrink-0`}
                  >
                    {initials}
                  </div>

                  {/* Name + Service */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground leading-tight truncate">
                      {customerName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{serviceName}</p>
                  </div>

                  {/* Price */}
                  <span className="text-sm font-bold text-foreground shrink-0">
                    {price > 0 ? `$${price.toFixed(0)}` : "—"}
                  </span>

                  {/* Status Badge */}
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full shrink-0 capitalize ${statusStyle[status] || statusStyle["pending"]}`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

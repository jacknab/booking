import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppointments } from "@/hooks/use-appointments";
import { useCustomers } from "@/hooks/use-customers";
import { useAuth } from "@/hooks/use-auth";
import { useSelectedStore } from "@/hooks/use-store";
import { formatInTz, toStoreLocal, getTimezoneAbbr, getNowInTimezone } from "@/lib/timezone";
import { isSameDay, subDays, startOfWeek, endOfWeek, isWithinInterval, format, startOfDay, subWeeks } from "date-fns";
import { Users, Calendar, DollarSign, TrendingUp, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const { selectedStore } = useSelectedStore();
  const timezone = selectedStore?.timezone || "UTC";
  const tzAbbr = getTimezoneAbbr(timezone);
  const storeNow = getNowInTimezone(timezone);

  const { data: appointments } = useAppointments();
  const { data: customers } = useCustomers();

  const todayAppointments = appointments?.filter((apt: any) => {
    const localDate = toStoreLocal(apt.date, timezone);
    return isSameDay(localDate, storeNow);
  }) || [];

  const yesterdayAppointments = appointments?.filter((apt: any) => {
    const localDate = toStoreLocal(apt.date, timezone);
    return isSameDay(localDate, subDays(storeNow, 1));
  }) || [];

  const thisWeekStart = startOfWeek(storeNow, { weekStartsOn: 1 });
  const thisWeekEnd = endOfWeek(storeNow, { weekStartsOn: 1 });
  const lastWeekStart = subWeeks(thisWeekStart, 1);
  const lastWeekEnd = subDays(thisWeekStart, 1);

  const thisWeekAppointments = appointments?.filter((apt: any) => {
    const localDate = toStoreLocal(apt.date, timezone);
    return isWithinInterval(localDate, { start: thisWeekStart, end: thisWeekEnd });
  }) || [];

  const lastWeekAppointments = appointments?.filter((apt: any) => {
    const localDate = toStoreLocal(apt.date, timezone);
    return isWithinInterval(localDate, { start: lastWeekStart, end: lastWeekEnd });
  }) || [];

  const getRevenue = (appts: any[]) => {
    return appts.reduce((sum: number, apt: any) => {
      const paid = parseFloat(apt.totalPaid || "0");
      return sum + (isNaN(paid) ? 0 : paid);
    }, 0);
  };

  const thisWeekRevenue = getRevenue(thisWeekAppointments);
  const lastWeekRevenue = getRevenue(lastWeekAppointments);
  const revenueChange = lastWeekRevenue > 0
    ? Math.round(((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100)
    : 0;

  const totalCustomers = customers?.length || 0;

  const last7Days = Array.from({ length: 7 }, (_, i) => subDays(storeNow, 6 - i));
  const newClientsThisWeek = customers?.filter((c: any) => {
    if (!c.createdAt) return false;
    const created = new Date(c.createdAt);
    return isWithinInterval(created, { start: thisWeekStart, end: thisWeekEnd });
  })?.length || 0;

  const completedAppointments = appointments?.filter((apt: any) =>
    apt.status === "completed" && parseFloat(apt.totalPaid || "0") > 0
  ) || [];
  const avgTicket = completedAppointments.length > 0
    ? getRevenue(completedAppointments) / completedAppointments.length
    : 0;

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const chartData = last7Days.map(day => {
    const dayAppts = appointments?.filter((apt: any) => {
      const localDate = toStoreLocal(apt.date, timezone);
      return isSameDay(localDate, day);
    }) || [];
    return {
      name: dayNames[day.getDay()],
      revenue: getRevenue(dayAppts),
    };
  });

  const todayCount = todayAppointments.length;
  const yesterdayCount = yesterdayAppointments.length;
  const appointmentTrend = yesterdayCount > 0
    ? `${todayCount >= yesterdayCount ? "+" : ""}${Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100)}% from yesterday`
    : todayCount > 0 ? `${todayCount} today` : "No appointments yet";

  const revenueTrendText = lastWeekRevenue > 0
    ? `${revenueChange >= 0 ? "+" : ""}${revenueChange}% from last week`
    : thisWeekRevenue > 0 ? `$${thisWeekRevenue.toFixed(0)} this week` : "No revenue yet";

  return (
    <AppLayout>
      <div className="flex flex-col gap-2 mb-8">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground" data-testid="text-welcome-title">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-muted-foreground">Here's what's happening at {selectedStore?.name || "your salon"} today.</p>
          </div>
          <Badge variant="secondary" className="no-default-active-elevate gap-1.5 text-xs" data-testid="badge-dashboard-timezone">
            <Globe className="w-3 h-3" />
            {formatInTz(storeNow, timezone, "h:mm a")} {tzAbbr}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Today's Appointments" 
          value={todayCount.toString()} 
          icon={Calendar}
          trend={appointmentTrend}
          color="text-primary"
        />
        <StatCard 
          title="Total Revenue" 
          value={`$${thisWeekRevenue.toFixed(0)}`}
          icon={DollarSign}
          trend={revenueTrendText}
          color="text-emerald-500"
        />
        <StatCard 
          title="Total Clients" 
          value={totalCustomers.toString()} 
          icon={Users}
          trend={newClientsThisWeek > 0 ? `+${newClientsThisWeek} this week` : "No new clients this week"}
          color="text-blue-500"
        />
        <StatCard 
          title="Avg. Ticket" 
          value={avgTicket > 0 ? `$${avgTicket.toFixed(0)}` : "$0"}
          icon={TrendingUp}
          trend={completedAppointments.length > 0 ? `Based on ${completedAppointments.length} completed` : "No completed appointments yet"}
          color="text-accent"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    cursor={{fill: 'hsla(var(--foreground), 0.05)'}}
                    contentStyle={{borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    labelStyle={{color: 'hsl(var(--foreground))'}}
                    itemStyle={{color: 'hsl(var(--foreground))'}}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle>Upcoming Today</CardTitle>
            <span className="text-xs text-muted-foreground">{tzAbbr}</span>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {todayAppointments.length === 0 ? (
                <p className="text-muted-foreground text-sm" data-testid="text-no-appointments">No appointments scheduled for today.</p>
              ) : (
                todayAppointments.slice(0, 5).map((apt: any) => (
                  <div key={apt.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0" data-testid={`dashboard-appointment-${apt.id}`}>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center text-primary shrink-0">
                      <span className="text-xs font-bold uppercase">{formatInTz(apt.date, timezone, 'MMM')}</span>
                      <span className="text-lg font-bold leading-none">{formatInTz(apt.date, timezone, 'd')}</span>
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-sm">{apt.service?.name || "Service"}</p>
                      <p className="text-xs text-muted-foreground">with {apt.staff?.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                          {formatInTz(apt.date, timezone, 'h:mm a')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

function StatCard({ title, value, icon: Icon, trend, color }: any) {
  return (
    <Card className="shadow-sm border-border/50" data-testid={`card-stat-${title.toLowerCase().replace(/[^a-z]/g, '-')}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-1 mb-4">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <div className={`p-2 rounded-lg bg-background ${color} bg-opacity-10`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-bold" data-testid={`text-stat-value-${title.toLowerCase().replace(/[^a-z]/g, '-')}`}>{value}</h3>
          <p className="text-xs text-muted-foreground">{trend}</p>
        </div>
      </CardContent>
    </Card>
  );
}

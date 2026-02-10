import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppointments } from "@/hooks/use-appointments";
import { useAuth } from "@/hooks/use-auth";
import { useSelectedStore } from "@/hooks/use-store";
import { formatInTz, toStoreLocal, getTimezoneAbbr, getNowInTimezone } from "@/lib/timezone";
import { isSameDay } from "date-fns";
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

const mockData = [
  { name: 'Mon', revenue: 400 },
  { name: 'Tue', revenue: 300 },
  { name: 'Wed', revenue: 550 },
  { name: 'Thu', revenue: 450 },
  { name: 'Fri', revenue: 800 },
  { name: 'Sat', revenue: 950 },
  { name: 'Sun', revenue: 200 },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { selectedStore } = useSelectedStore();
  const timezone = selectedStore?.timezone || "UTC";
  const tzAbbr = getTimezoneAbbr(timezone);
  const storeNow = getNowInTimezone(timezone);

  const { data: appointments } = useAppointments();

  const todayAppointments = appointments?.filter((apt: any) => {
    const localDate = toStoreLocal(apt.date, timezone);
    return isSameDay(localDate, storeNow);
  }) || [];

  return (
    <AppLayout>
      <div className="flex flex-col gap-2 mb-8">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Today's Appointments" 
          value={todayAppointments.length.toString()} 
          icon={Calendar}
          trend="+12% from yesterday"
          color="text-primary"
        />
        <StatCard 
          title="Total Revenue" 
          value="$1,240" 
          icon={DollarSign}
          trend="+8% from last week"
          color="text-emerald-500"
        />
        <StatCard 
          title="New Clients" 
          value="12" 
          icon={Users}
          trend="+2 this week"
          color="text-blue-500"
        />
        <StatCard 
          title="Avg. Ticket" 
          value="$85" 
          icon={TrendingUp}
          trend="+5% increase"
          color="text-accent"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    cursor={{fill: 'rgba(0,0,0,0.05)'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Appointments List */}
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
    <Card className="shadow-sm border-border/50 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-1 mb-4">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <div className={`p-2 rounded-lg bg-background ${color} bg-opacity-10`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-bold">{value}</h3>
          <p className="text-xs text-muted-foreground">{trend}</p>
        </div>
      </CardContent>
    </Card>
  );
}

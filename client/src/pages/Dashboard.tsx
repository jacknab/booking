import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppointments } from "@/hooks/use-appointments";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { Users, Calendar, DollarSign, TrendingUp } from "lucide-react";
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
  const today = new Date().toISOString();
  
  // In a real app, we would have specific endpoints for stats
  // Here we just fetch list and filter client-side for demo
  const { data: appointments } = useAppointments();

  const todayAppointments = appointments?.filter(apt => 
    new Date(apt.date).toDateString() === new Date().toDateString()
  ) || [];

  return (
    <AppLayout>
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-muted-foreground">Here's what's happening in your salon today.</p>
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
          <CardHeader>
            <CardTitle>Upcoming Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {todayAppointments.length === 0 ? (
                <p className="text-muted-foreground text-sm">No appointments scheduled for today.</p>
              ) : (
                todayAppointments.slice(0, 5).map((apt) => (
                  <div key={apt.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center text-primary shrink-0">
                      <span className="text-xs font-bold uppercase">{format(new Date(apt.date), 'MMM')}</span>
                      <span className="text-lg font-bold leading-none">{format(new Date(apt.date), 'd')}</span>
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-sm">{apt.service?.name || "Service"}</p>
                      <p className="text-xs text-muted-foreground">with {apt.staff?.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                          {format(new Date(apt.date), 'h:mm a')}
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
        <div className="flex items-center justify-between mb-4">
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

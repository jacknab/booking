import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { AppointmentWithDetails } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { AppLayout } from "@/components/layout/AppLayout";
import { Loader2, Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";

export default function StaffDashboard() {
  const { user } = useAuth();

  const { data: appointments, isLoading } = useQuery<AppointmentWithDetails[]>({
    queryKey: ["/api/appointments", { staffId: user?.staffId }],
    enabled: !!user?.staffId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8 p-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-staff-welcome">
            Welcome back, {user?.firstName}
          </h1>
          <p className="text-muted-foreground">
            Here is your personal schedule and upcoming appointments.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Upcoming Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments?.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">No upcoming appointments found.</p>
                ) : (
                  appointments?.map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                      data-testid={`row-appointment-${apt.id}`}
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{apt.customer?.name || "Unknown Client"}</p>
                        <p className="text-sm text-muted-foreground">{apt.service?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{format(new Date(apt.date), "h:mm a")}</p>
                        <p className="text-sm text-muted-foreground">{format(new Date(apt.date), "MMM d, yyyy")}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={new Date()}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

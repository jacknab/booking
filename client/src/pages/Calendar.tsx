import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAppointments, useCreateAppointment } from "@/hooks/use-appointments";
import { useServices } from "@/hooks/use-services";
import { useStaffList } from "@/hooks/use-staff";
import { useCustomers } from "@/hooks/use-customers";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { Plus, ChevronLeft, ChevronRight, Clock, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAppointmentSchema } from "@shared/schema";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data: appointments } = useAppointments();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const startDate = startOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

  // Time slots from 9 AM to 6 PM
  const timeSlots = Array.from({ length: 10 }).map((_, i) => 9 + i);

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Calendar</h1>
          <p className="text-muted-foreground">Manage your schedule and appointments.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-card rounded-lg border shadow-sm p-1">
            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addDays(currentDate, -7))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="px-4 font-medium text-sm w-32 text-center">
              {format(currentDate, "MMMM yyyy")}
            </span>
            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addDays(currentDate, 7))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4 mr-2" />
                New Appointment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Appointment</DialogTitle>
              </DialogHeader>
              <CreateAppointmentForm onSuccess={() => setIsCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="overflow-hidden border shadow-sm">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header Row */}
            <div className="grid grid-cols-8 border-b bg-muted/20">
              <div className="p-4 border-r font-medium text-sm text-muted-foreground text-center">Time</div>
              {weekDays.map((day) => (
                <div key={day.toString()} className={`p-4 border-r text-center ${isSameDay(day, new Date()) ? 'bg-primary/5' : ''}`}>
                  <div className="font-bold text-lg">{format(day, "d")}</div>
                  <div className="text-xs text-muted-foreground uppercase">{format(day, "EEE")}</div>
                </div>
              ))}
            </div>

            {/* Time Grid */}
            <div className="bg-card">
              {timeSlots.map((hour) => (
                <div key={hour} className="grid grid-cols-8 border-b last:border-0 h-24">
                  <div className="p-2 border-r text-xs text-muted-foreground text-center font-medium">
                    {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                  </div>
                  {weekDays.map((day) => {
                    // Find appointments for this day and hour
                    const dayApts = appointments?.filter(apt => {
                      const aptDate = new Date(apt.date);
                      return isSameDay(aptDate, day) && aptDate.getHours() === hour;
                    }) || [];

                    return (
                      <div key={day.toString()} className="border-r relative p-1 transition-colors hover:bg-muted/10">
                        {dayApts.map(apt => (
                          <div 
                            key={apt.id} 
                            className="text-xs p-2 rounded-md bg-primary/10 text-primary border border-primary/20 shadow-sm cursor-pointer hover:bg-primary/20 transition-colors mb-1 truncate"
                          >
                            <span className="font-bold block truncate">{apt.customer?.name || "Client"}</span>
                            <span className="opacity-80 truncate">{apt.service?.name}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </AppLayout>
  );
}

function CreateAppointmentForm({ onSuccess }: { onSuccess: () => void }) {
  const { mutate, isPending } = useCreateAppointment();
  const { data: services } = useServices();
  const { data: staffList } = useStaffList();
  const { data: customers } = useCustomers();

  const formSchema = insertAppointmentSchema.extend({
    serviceId: z.coerce.number(),
    staffId: z.coerce.number(),
    customerId: z.coerce.number(),
    date: z.string(), // HTML datetime-local input returns string
    duration: z.coerce.number(),
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const selectedServiceId = watch("serviceId");
  
  // Auto-set duration when service changes
  const handleServiceChange = (val: string) => {
    setValue("serviceId", Number(val));
    const service = services?.find(s => s.id === Number(val));
    if (service) {
      setValue("duration", service.duration);
    }
  };

  return (
    <form onSubmit={handleSubmit((data) => mutate(data as any, { onSuccess }))} className="space-y-4">
      <div className="space-y-2">
        <Label>Client</Label>
        <Select onValueChange={(val) => setValue("customerId", Number(val))}>
          <SelectTrigger>
            <SelectValue placeholder="Select Client" />
          </SelectTrigger>
          <SelectContent>
            {customers?.map(c => (
              <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.customerId && <span className="text-xs text-destructive">Client is required</span>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Service</Label>
          <Select onValueChange={handleServiceChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select Service" />
            </SelectTrigger>
            <SelectContent>
              {services?.map(s => (
                <SelectItem key={s.id} value={String(s.id)}>{s.name} ({s.duration}m)</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.serviceId && <span className="text-xs text-destructive">Service is required</span>}
        </div>

        <div className="space-y-2">
          <Label>Staff</Label>
          <Select onValueChange={(val) => setValue("staffId", Number(val))}>
            <SelectTrigger>
              <SelectValue placeholder="Select Staff" />
            </SelectTrigger>
            <SelectContent>
              {staffList?.map(s => (
                <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.staffId && <span className="text-xs text-destructive">Staff is required</span>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date & Time</Label>
        <Input 
          id="date" 
          type="datetime-local" 
          {...register("date")} 
        />
        {errors.date && <span className="text-xs text-destructive">Date is required</span>}
      </div>
      
      {/* Hidden duration field, managed by service selection */}
      <input type="hidden" {...register("duration")} />

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" {...register("notes")} placeholder="Any special requests?" />
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90">
          {isPending ? "Booking..." : "Book Appointment"}
        </Button>
      </div>
    </form>
  );
}

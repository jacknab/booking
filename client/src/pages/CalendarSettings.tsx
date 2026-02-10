import { useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCalendarSettings, useUpdateCalendarSettings, DEFAULT_CALENDAR_SETTINGS } from "@/hooks/use-calendar-settings";
import { useToast } from "@/hooks/use-toast";
import { useForm, Controller } from "react-hook-form";
import { Save, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type CalendarSettingsForm = {
  startOfWeek: string;
  timeSlotInterval: number;
  nonWorkingHoursDisplay: number;
  allowBookingOutsideHours: boolean;
  autoCompleteAppointments: boolean;
};

function InfoTooltip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help inline-block ml-1" />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[260px]">
        <p className="text-xs">{text}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default function CalendarSettings() {
  const { data: settings, isLoading } = useCalendarSettings();
  const updateSettings = useUpdateCalendarSettings();
  const { toast } = useToast();

  const { control, handleSubmit, reset } = useForm<CalendarSettingsForm>({
    defaultValues: DEFAULT_CALENDAR_SETTINGS,
  });

  useEffect(() => {
    if (settings) {
      reset({
        startOfWeek: settings.startOfWeek,
        timeSlotInterval: settings.timeSlotInterval,
        nonWorkingHoursDisplay: settings.nonWorkingHoursDisplay,
        allowBookingOutsideHours: settings.allowBookingOutsideHours,
        autoCompleteAppointments: settings.autoCompleteAppointments,
      });
    }
  }, [settings, reset]);

  const onSubmit = (data: CalendarSettingsForm) => {
    updateSettings.mutate(data, {
      onSuccess: () => {
        toast({ title: "Settings saved", description: "Calendar settings have been updated." });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
      },
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">Loading...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-3xl font-display font-bold" data-testid="text-page-title">Calendar Settings</h1>
          <Button type="submit" disabled={updateSettings.isPending} data-testid="button-save-settings">
            <Save className="w-4 h-4 mr-2" />
            {updateSettings.isPending ? "Saving..." : "Save"}
          </Button>
        </div>

        <Card>
          <CardContent className="p-6 space-y-8">
            <h2 className="text-xl font-semibold">Calendar Settings</h2>

            <div className="space-y-2">
              <Label className="flex items-center">
                Calendar start of week
                <InfoTooltip text="Choose which day the calendar week starts on." />
              </Label>
              <Controller
                name="startOfWeek"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger data-testid="select-start-of-week">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monday">Monday</SelectItem>
                      <SelectItem value="sunday">Sunday</SelectItem>
                      <SelectItem value="saturday">Saturday</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center">
                Time slot intervals
                <InfoTooltip text="The time interval between each slot on the calendar grid." />
              </Label>
              <Controller
                name="timeSlotInterval"
                control={control}
                render={({ field }) => (
                  <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                    <SelectTrigger data-testid="select-time-slot-interval">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 min</SelectItem>
                      <SelectItem value="10">10 min</SelectItem>
                      <SelectItem value="15">15 min</SelectItem>
                      <SelectItem value="20">20 min</SelectItem>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="60">60 min</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center">
                Non-working hours displayed in calendar
                <InfoTooltip text="How many non-working hours to show before and after business hours on the calendar." />
              </Label>
              <Controller
                name="nonWorkingHoursDisplay"
                control={control}
                render={({ field }) => (
                  <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                    <SelectTrigger data-testid="select-non-working-hours">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">None</SelectItem>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="2">2 hours</SelectItem>
                      <SelectItem value="3">3 hours</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex items-center justify-between gap-4 py-2 border-t pt-6">
              <div>
                <Label className="text-base font-medium">Allow staff to be booked outside opening hours</Label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  You are able to allow appointments to be made via your booking page beyond your closing time.
                </p>
              </div>
              <Controller
                name="allowBookingOutsideHours"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="switch-allow-outside-hours"
                  />
                )}
              />
            </div>

            <div className="flex items-center justify-between gap-4 py-2 border-t pt-6">
              <div>
                <Label className="text-base font-medium">Set appointments to auto-complete</Label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Set your appointments to completed status at the end of working day. This enables reporting and client satisfaction surveys to be sent.
                </p>
              </div>
              <Controller
                name="autoCompleteAppointments"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="switch-auto-complete"
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>
      </form>
    </AppLayout>
  );
}

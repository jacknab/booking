import { useParams, useLocation } from "react-router-dom";
import { useBooking, useCancelBooking } from "@/hooks/use-public-booking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function BookingConfirmation() {
  const params = useParams();
  const location = useLocation();
  const confirmationNumber = params?.confirmationNumber;
  const searchParams = new URLSearchParams(location.search);
  const slug = searchParams.get("slug") || undefined;
  const { data: bookings, isLoading, error } = useBooking(confirmationNumber, slug);
  const cancelBooking = useCancelBooking();

  const handleCancel = (appointmentId: number) => {
    if (!confirmationNumber) return;
    cancelBooking.mutate({ confirmationNumber, appointmentId, slug });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading booking.</div>;
  }

  if (!bookings || bookings.length === 0) {
    return <div>Booking not found.</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Booking Confirmation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bookings.map((booking) => (
              <div key={booking.id} className="border rounded-md p-3 bg-white">
                <div className="text-sm font-medium">
                  {format(new Date(booking.date), "MMMM d, yyyy 'at' h:mm a")}
                </div>
                <div className="text-sm text-muted-foreground">
                  {booking.service?.name || "Service"}
                </div>
                {booking.status === "cancelled" ? (
                  <div className="text-xs text-red-600 mt-1">Cancelled</div>
                ) : (
                  <Button
                    variant="destructive"
                    className="w-full mt-3"
                    onClick={() => handleCancel(booking.id)}
                    disabled={cancelBooking.isPending}
                  >
                    {cancelBooking.isPending ? "Cancelling..." : "Cancel Appointment"}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

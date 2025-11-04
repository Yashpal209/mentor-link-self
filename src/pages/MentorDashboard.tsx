import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Clock, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const MentorDashboard = () => {
  const { user, signOut } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        mentee:profiles!mentee_id(full_name)
      `)
      .eq("mentor_id", user.id)
      .order("session_date", { ascending: true });

    if (error) {
      toast.error("Failed to load bookings");
    } else {
      setBookings(data || []);
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (bookingId: string, status: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", bookingId);

    if (error) {
      toast.error("Failed to update booking");
    } else {
      toast.success(`Booking ${status}`);
      fetchBookings();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Mentor Dashboard</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/profile")}>
              Profile
            </Button>
            <Button variant="outline" onClick={() => navigate("/availability")}>
              Availability
            </Button>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Total Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{bookings.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-accent" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {bookings.filter(b => b.status === "pending").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-success" />
                Confirmed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {bookings.filter(b => b.status === "confirmed").length}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Session Requests</CardTitle>
            <CardDescription>Manage your upcoming mentorship sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : bookings.length === 0 ? (
              <p className="text-muted-foreground">No bookings yet</p>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-semibold">
                        {booking.mentee?.full_name || "Unknown"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(booking.session_date).toLocaleDateString()} at{" "}
                        {booking.start_time}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        booking.status === "confirmed" ? "bg-success/20 text-success" :
                        booking.status === "pending" ? "bg-yellow-500/20 text-yellow-700" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    {booking.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(booking.id, "confirmed")}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusUpdate(booking.id, "cancelled")}
                        >
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MentorDashboard;

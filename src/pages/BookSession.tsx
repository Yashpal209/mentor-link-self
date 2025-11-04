import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { ArrowLeft, Clock, Calendar as CalendarIcon, User } from "lucide-react";
import { format, addDays, isToday, isBefore, startOfDay } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const BookSession = () => {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (mentorId) {
      fetchMentorDetails();
    }
  }, [mentorId]);

  useEffect(() => {
    if (selectedDate && mentorId) {
      fetchAvailableSlots();
    }
  }, [selectedDate, mentorId]);

  const fetchMentorDetails = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
        mentor_skills(skill, category)
      `)
      .eq("user_id", mentorId)
      .single();

    if (error) {
      toast.error("Failed to load mentor details");
      navigate("/browse-mentors");
    } else {
      setMentor(data);
    }
    setLoading(false);
  };

  const fetchAvailableSlots = async () => {
    if (!selectedDate) return;

    const dayOfWeek = selectedDate.getDay();
    
    // Fetch mentor's availability for this day
    const { data: availability, error: availError } = await supabase
      .from("mentor_availability")
      .select("*")
      .eq("mentor_id", mentorId)
      .eq("day_of_week", dayOfWeek)
      .eq("is_available", true);

    if (availError || !availability || availability.length === 0) {
      setAvailableSlots([]);
      return;
    }

    // Fetch existing bookings for this date
    const { data: existingBookings, error: bookError } = await supabase
      .from("bookings")
      .select("start_time, end_time")
      .eq("mentor_id", mentorId)
      .eq("session_date", format(selectedDate, "yyyy-MM-dd"))
      .neq("status", "cancelled");

    if (bookError) {
      toast.error("Failed to check availability");
      return;
    }

    // Generate time slots
    const slots: string[] = [];
    availability.forEach((avail) => {
      const startHour = parseInt(avail.start_time.split(':')[0]);
      const endHour = parseInt(avail.end_time.split(':')[0]);
      
      for (let hour = startHour; hour < endHour; hour++) {
        const slotStart = `${hour.toString().padStart(2, '0')}:00`;
        const slotEnd = `${(hour + 1).toString().padStart(2, '0')}:00`;
        
        // Check if slot is already booked
        const isBooked = existingBookings?.some((booking: any) => {
          return booking.start_time === slotStart;
        });

        if (!isBooked) {
          slots.push(`${slotStart} - ${slotEnd}`);
        }
      }
    });

    setAvailableSlots(slots);
    setSelectedSlot("");
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot || !mentorId) {
      toast.error("Please select a date and time slot");
      return;
    }

    setBooking(true);

    const [startTime] = selectedSlot.split(' - ');
    const endTime = `${(parseInt(startTime.split(':')[0]) + 1).toString().padStart(2, '0')}:00`;

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Please login to book a session");
      navigate("/auth");
      return;
    }

    // Generate unique room ID for video call
    const roomId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const { error } = await supabase
      .from("bookings")
      .insert({
        mentor_id: mentorId,
        mentee_id: user.id,
        session_date: format(selectedDate, "yyyy-MM-dd"),
        start_time: startTime,
        end_time: endTime,
        notes: notes || null,
        status: "pending",
        room_id: roomId
      });

    setBooking(false);

    if (error) {
      toast.error("Failed to book session. Please try again.");
    } else {
      toast.success("Session booked successfully! Mentor will confirm shortly.");
      navigate("/mentee-dashboard");
    }
  };

  const disabledDays = (date: Date) => {
    return isBefore(startOfDay(date), startOfDay(new Date()));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/browse-mentors")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Mentors
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Mentor Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{mentor?.full_name}</CardTitle>
                  <CardDescription>Book a mentoring session</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">About</h3>
                <p className="text-sm text-muted-foreground">
                  {mentor?.bio || "No bio provided"}
                </p>
              </div>
              
              {mentor?.mentor_skills && mentor.mentor_skills.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {mentor.mentor_skills.map((skill: any, idx: number) => (
                      <span
                        key={idx}
                        className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full"
                      >
                        {skill.skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="notes">Session Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="What would you like to discuss in this session?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-2"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Booking Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Select Date & Time
              </CardTitle>
              <CardDescription>
                Choose an available slot for your mentoring session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={disabledDays}
                  className="rounded-md border"
                />
              </div>

              {selectedDate && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Available Times for {format(selectedDate, "MMM dd, yyyy")}
                  </h3>
                  
                  {availableSlots.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No available slots for this date
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {availableSlots.map((slot) => (
                        <Button
                          key={slot}
                          variant={selectedSlot === slot ? "default" : "outline"}
                          onClick={() => setSelectedSlot(slot)}
                          className="w-full"
                        >
                          {slot}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <Button
                onClick={handleBooking}
                disabled={!selectedSlot || booking}
                className="w-full"
                size="lg"
              >
                {booking ? "Booking..." : "Confirm Booking"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default BookSession;

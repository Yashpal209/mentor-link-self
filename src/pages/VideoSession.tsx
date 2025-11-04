import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import VideoCall from "@/components/VideoCall";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const VideoSession = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<{
    id: string;
    room_id: string;
    mentor_id: string;
    mentee_id: string;
    status: string;
  } | null>(null);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Please login to join the session");
      navigate("/auth");
      return;
    }

    const { data: bookingData, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingError || !bookingData) {
      toast.error("Session not found");
      navigate("/");
      return;
    }

    // Check if user is part of this booking
    if (bookingData.mentor_id !== user.id && bookingData.mentee_id !== user.id) {
      toast.error("You are not authorized to join this session");
      navigate("/");
      return;
    }

    // Check if session is confirmed
    if (bookingData.status !== "confirmed") {
      toast.error("This session has not been confirmed yet");
      navigate("/");
      return;
    }

    setBooking(bookingData);

    // Fetch user profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .single();

    setUserName(profileData?.full_name || "User");
    setLoading(false);
  };

  const handleLeaveCall = async () => {
    // Update booking status to completed
    if (booking) {
      await supabase
        .from("bookings")
        .update({ status: "completed" })
        .eq("id", booking.id);
    }

    toast.success("You left the session");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <VideoCall
      roomId={booking.room_id}
      userName={userName}
      onLeave={handleLeaveCall}
    />
  );
};

export default VideoSession;

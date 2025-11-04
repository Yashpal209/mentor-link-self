import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Clock, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AvailabilitySlot {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

const Availability = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const daysOfWeek = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
  ];

  useEffect(() => {
    fetchAvailability();
  }, [user]);

  const fetchAvailability = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("mentor_availability")
      .select("*")
      .eq("mentor_id", user.id)
      .order("day_of_week");

    if (error) {
      toast.error("Failed to load availability");
    } else {
      setAvailability(data || []);
    }
    setLoading(false);
  };

  const addTimeSlot = () => {
    setAvailability([...availability, {
      day_of_week: 1,
      start_time: "09:00",
      end_time: "17:00",
      is_available: true
    }]);
  };

  const updateSlot = (index: number, field: keyof AvailabilitySlot, value: any) => {
    const updated = [...availability];
    updated[index] = { ...updated[index], [field]: value };
    setAvailability(updated);
  };

  const removeSlot = (index: number) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  const saveAvailability = async () => {
    if (!user) return;

    setSaving(true);

    try {
      // Delete existing availability
      await supabase
        .from("mentor_availability")
        .delete()
        .eq("mentor_id", user.id);

      // Insert new availability
      if (availability.length > 0) {
        const { error } = await supabase
          .from("mentor_availability")
          .insert(
            availability.map(slot => ({
              mentor_id: user.id,
              day_of_week: slot.day_of_week,
              start_time: slot.start_time,
              end_time: slot.end_time,
              is_available: slot.is_available
            }))
          );

        if (error) throw error;
      }

      toast.success("Availability updated successfully");
    } catch (error) {
      toast.error("Failed to save availability");
    }

    setSaving(false);
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
          <Button variant="ghost" onClick={() => navigate("/mentor-dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Set Your Availability
              </CardTitle>
              <CardDescription>
                Define when you're available for mentoring sessions. Mentees will only be able to book slots during your available times.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {availability.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No availability set</p>
                  <Button onClick={addTimeSlot}>Add Time Slot</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {availability.map((slot, index) => (
                    <div key={index} className="flex items-end gap-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <Label>Day of Week</Label>
                        <Select
                          value={slot.day_of_week.toString()}
                          onValueChange={(value) => updateSlot(index, "day_of_week", parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {daysOfWeek.map((day) => (
                              <SelectItem key={day.value} value={day.value.toString()}>
                                {day.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex-1">
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          value={slot.start_time}
                          onChange={(e) => updateSlot(index, "start_time", e.target.value)}
                        />
                      </div>

                      <div className="flex-1">
                        <Label>End Time</Label>
                        <Input
                          type="time"
                          value={slot.end_time}
                          onChange={(e) => updateSlot(index, "end_time", e.target.value)}
                        />
                      </div>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeSlot(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}

                  <Button onClick={addTimeSlot} variant="outline">
                    Add Another Time Slot
                  </Button>
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={saveAvailability} disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Saving..." : "Save Availability"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Availability;

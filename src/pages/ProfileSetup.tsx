import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Plus, X } from "lucide-react";

const ProfileSetup = () => {
  const { user } = useAuth();
  const { role } = useUserRole();
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const addSkill = () => setSkills([...skills, ""]);
  const removeSkill = (index: number) => setSkills(skills.filter((_, i) => i !== index));
  const updateSkill = (index: number, value: string) => {
    const newSkills = [...skills];
    newSkills[index] = value;
    setSkills(newSkills);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ bio })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      // Add skills if mentor
      if (role === "mentor" && skills.filter(s => s.trim()).length > 0) {
        const skillsData = skills
          .filter(s => s.trim())
          .map(skill => ({
            mentor_id: user.id,
            skill: skill.trim(),
          }));

        const { error: skillsError } = await supabase
          .from("mentor_skills")
          .insert(skillsData);

        if (skillsError) throw skillsError;
      }

      toast.success("Profile setup complete!");
      navigate(role === "mentor" ? "/mentor-dashboard" : "/mentee-dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to setup profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                required
              />
            </div>

            {role === "mentor" && (
              <div className="space-y-2">
                <Label>Your Skills</Label>
                {skills.map((skill, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="e.g., React, Leadership, Marketing"
                      value={skill}
                      onChange={(e) => updateSkill(index, e.target.value)}
                    />
                    {skills.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSkill(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addSkill} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Skill
                </Button>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Complete Setup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSetup;

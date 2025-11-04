import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, User, Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Skill {
  id?: string;
  skill: string;
  category: string;
}

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    bio: "",
    avatar_url: ""
  });
  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkill, setNewSkill] = useState({ skill: "", category: "" });
  const [userRole, setUserRole] = useState<string>("");

  const skillCategories = [
    "Technology",
    "Business",
    "Design",
    "Marketing",
    "Finance",
    "Healthcare",
    "Education",
    "Engineering",
    "Other"
  ];

  useEffect(() => {
    fetchProfile();
    fetchUserRole();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      toast.error("Failed to load profile");
    } else {
      setProfile({
        full_name: data.full_name || "",
        bio: data.bio || "",
        avatar_url: data.avatar_url || ""
      });
    }

    // Fetch skills if user is a mentor
    const { data: skillsData, error: skillsError } = await supabase
      .from("mentor_skills")
      .select("*")
      .eq("mentor_id", user.id);

    if (!skillsError && skillsData) {
      setSkills(skillsData);
    }

    setLoading(false);
  };

  const fetchUserRole = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!error && data) {
      setUserRole(data.role);
    }
  };

  const updateProfile = async () => {
    if (!user) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          full_name: profile.full_name,
          bio: profile.bio,
          avatar_url: profile.avatar_url
        });

      if (error) throw error;

      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    }

    setSaving(false);
  };

  const addSkill = async () => {
    if (!user || !newSkill.skill.trim()) return;

    const { error } = await supabase
      .from("mentor_skills")
      .insert({
        mentor_id: user.id,
        skill: newSkill.skill.trim(),
        category: newSkill.category || "Other"
      });

    if (error) {
      toast.error("Failed to add skill");
    } else {
      setSkills([...skills, { ...newSkill, skill: newSkill.skill.trim() }]);
      setNewSkill({ skill: "", category: "" });
      toast.success("Skill added successfully");
    }
  };

  const removeSkill = async (skillId: string) => {
    if (!skillId) return;

    const { error } = await supabase
      .from("mentor_skills")
      .delete()
      .eq("id", skillId);

    if (error) {
      toast.error("Failed to remove skill");
    } else {
      setSkills(skills.filter(skill => skill.id !== skillId));
      toast.success("Skill removed successfully");
    }
  };

  const goBack = () => {
    if (userRole === "mentor") {
      navigate("/mentor-dashboard");
    } else {
      navigate("/mentee-dashboard");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={goBack}>
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
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and bio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="avatar_url">Avatar URL (Optional)</Label>
                  <Input
                    id="avatar_url"
                    value={profile.avatar_url}
                    onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell others about yourself, your experience, and what you can offer..."
                  rows={4}
                />
              </div>

              <Button onClick={updateProfile} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </CardContent>
          </Card>

          {userRole === "mentor" && (
            <Card>
              <CardHeader>
                <CardTitle>Expertise & Skills</CardTitle>
                <CardDescription>
                  Add skills and areas of expertise to help mentees find you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      value={newSkill.skill}
                      onChange={(e) => setNewSkill({ ...newSkill, skill: e.target.value })}
                      placeholder="e.g., React, Python, Leadership"
                    />
                  </div>
                  <Select
                    value={newSkill.category}
                    onValueChange={(value) => setNewSkill({ ...newSkill, category: value })}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {skillCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={addSkill} disabled={!newSkill.skill.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {skills.length > 0 && (
                  <div className="space-y-2">
                    <Label>Your Skills</Label>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, index) => (
                        <div
                          key={skill.id || index}
                          className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                        >
                          <span>{skill.skill}</span>
                          <span className="text-xs opacity-70">({skill.category})</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => removeSkill(skill.id || "")}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;

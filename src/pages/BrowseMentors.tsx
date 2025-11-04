import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const BrowseMentors = () => {
  const [mentors, setMentors] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    const { data: rolesData, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "mentor");

    if (rolesError) {
      toast.error("Failed to load mentors");
      setLoading(false);
      return;
    }

    const mentorIds = rolesData.map(r => r.user_id);

    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select(`
        *,
        mentor_skills(skill, category)
      `)
      .in("user_id", mentorIds);

    if (profilesError) {
      toast.error("Failed to load mentor profiles");
    } else {
      setMentors(profilesData || []);
    }
    setLoading(false);
  };

  const filteredMentors = mentors.filter(mentor =>
    mentor.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.mentor_skills?.some((skill: any) => 
      skill.skill.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-primary">Browse Mentors</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name, skill, or expertise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading mentors...</p>
        ) : filteredMentors.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No mentors found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{mentor.full_name}</CardTitle>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-semibold">4.8</span>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {mentor.bio || "No bio provided"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mentor.mentor_skills && mentor.mentor_skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {mentor.mentor_skills.slice(0, 3).map((skill: any, idx: number) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full"
                          >
                            {skill.skill}
                          </span>
                        ))}
                        {mentor.mentor_skills.length > 3 && (
                          <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full">
                            +{mentor.mentor_skills.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                    <Button 
                      className="w-full" 
                      onClick={() => navigate(`/book-session/${mentor.user_id}`)}
                    >
                      Book Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default BrowseMentors;

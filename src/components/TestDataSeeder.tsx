import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const TestDataSeeder = () => {
  const [seeding, setSeeding] = useState(false);

  const seedData = async () => {
    setSeeding(true);

    try {
      // Create test users (in a real app, these would be created through auth)
      const testUsers = [
        { id: 'mentor-1', email: 'sarah@example.com', name: 'Dr. Sarah Johnson', role: 'mentor' },
        { id: 'mentor-2', email: 'michael@example.com', name: 'Michael Chen', role: 'mentor' },
        { id: 'mentor-3', email: 'priya@example.com', name: 'Dr. Priya Patel', role: 'mentor' },
        { id: 'mentee-1', email: 'alex@example.com', name: 'Alex Rodriguez', role: 'mentee' },
        { id: 'mentee-2', email: 'emma@example.com', name: 'Emma Thompson', role: 'mentee' }
      ];

      // Insert profiles
      const profiles = [
        {
          user_id: 'mentor-1',
          full_name: 'Dr. Sarah Johnson',
          bio: 'Senior Software Engineer at Google with 10+ years experience in full-stack development, mentoring junior developers.',
          avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
        },
        {
          user_id: 'mentor-2',
          full_name: 'Michael Chen',
          bio: 'Product Manager at Microsoft, specializing in agile methodologies and team leadership. Passionate about career development.',
          avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
        },
        {
          user_id: 'mentor-3',
          full_name: 'Dr. Priya Patel',
          bio: 'Data Scientist at Amazon with expertise in machine learning and AI. Loves teaching complex concepts simply.',
          avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
        },
        {
          user_id: 'mentee-1',
          full_name: 'Alex Rodriguez',
          bio: 'Recent computer science graduate looking to break into software development.',
          avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        },
        {
          user_id: 'mentee-2',
          full_name: 'Emma Thompson',
          bio: 'UX designer transitioning to product management, seeking guidance on career pivot.',
          avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
        }
      ];

      // Insert user roles
      const roles = [
        { user_id: 'mentor-1', role: 'mentor' as const },
        { user_id: 'mentor-2', role: 'mentor' as const },
        { user_id: 'mentor-3', role: 'mentor' as const },
        { user_id: 'mentee-1', role: 'mentee' as const },
        { user_id: 'mentee-2', role: 'mentee' as const }
      ];

      // Insert mentor skills
      const skills = [
        { mentor_id: 'mentor-1', skill: 'React', category: 'Technology' },
        { mentor_id: 'mentor-1', skill: 'Node.js', category: 'Technology' },
        { mentor_id: 'mentor-1', skill: 'Python', category: 'Technology' },
        { mentor_id: 'mentor-2', skill: 'Product Strategy', category: 'Business' },
        { mentor_id: 'mentor-2', skill: 'Agile', category: 'Business' },
        { mentor_id: 'mentor-3', skill: 'Machine Learning', category: 'Technology' },
        { mentor_id: 'mentor-3', skill: 'Python', category: 'Technology' }
      ];

      // Insert availability
      const availability = [
        { mentor_id: 'mentor-1', day_of_week: 1, start_time: '09:00', end_time: '17:00', is_available: true },
        { mentor_id: 'mentor-1', day_of_week: 2, start_time: '09:00', end_time: '17:00', is_available: true },
        { mentor_id: 'mentor-2', day_of_week: 1, start_time: '10:00', end_time: '16:00', is_available: true },
        { mentor_id: 'mentor-3', day_of_week: 1, start_time: '14:00', end_time: '18:00', is_available: true }
      ];

      // Execute inserts
      await supabase.from('profiles').upsert(profiles);
      await supabase.from('user_roles').upsert(roles);
      await supabase.from('mentor_skills').upsert(skills);
      await supabase.from('mentor_availability').upsert(availability);

      toast.success("Test data seeded successfully!");
    } catch (error) {
      console.error('Seeding error:', error);
      toast.error("Failed to seed test data");
    }

    setSeeding(false);
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Test Data Seeder</CardTitle>
        <CardDescription>
          Add sample mentors, mentees, and data for testing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={seedData}
          disabled={seeding}
          className="w-full"
        >
          {seeding ? "Seeding..." : "Seed Test Data"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TestDataSeeder;

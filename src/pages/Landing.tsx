import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { UserCircle, Users, Calendar, Video, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Find Expert Mentors",
      description: "Browse and connect with experienced mentors in your field"
    },
    {
      icon: <Calendar className="h-8 w-8 text-primary" />,
      title: "Easy Scheduling",
      description: "Book sessions at times that work for both mentor and mentee"
    },
    {
      icon: <Video className="h-8 w-8 text-primary" />,
      title: "Video Sessions",
      description: "Connect face-to-face with built-in video calling"
    },
    {
      icon: <Star className="h-8 w-8 text-primary" />,
      title: "Feedback System",
      description: "Rate and review your mentorship experiences"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Welcome to <span className="text-primary">Mentor Connect</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect with expert mentors and accelerate your professional growth through 
              personalized one-on-one mentorship sessions
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" onClick={() => navigate("/auth")} className="gap-2">
                <UserCircle className="h-5 w-5" />
                Get Started as Mentee
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/auth")} className="gap-2">
                <Users className="h-5 w-5" />
                Become a Mentor
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Mentor Connect?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="pt-6 text-center space-y-3">
                  <div className="flex justify-center">{feature.icon}</div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Start Your Mentorship Journey?
          </h2>
          <p className="text-lg opacity-90">
            Join thousands of mentors and mentees already growing together
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate("/auth")}>
            Sign Up Now
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Landing;

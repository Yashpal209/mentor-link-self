import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import ProfileSetup from "./pages/ProfileSetup";
import MentorDashboard from "./pages/MentorDashboard";
import MenteeDashboard from "./pages/MenteeDashboard";
import BrowseMentors from "./pages/BrowseMentors";
import BookSession from "./pages/BookSession";
import VideoSession from "./pages/VideoSession";
import Availability from "./pages/Availability";
import Profile from "./pages/Profile";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
            <Route path="/mentor-dashboard" element={<ProtectedRoute><MentorDashboard /></ProtectedRoute>} />
            <Route path="/mentee-dashboard" element={<ProtectedRoute><MenteeDashboard /></ProtectedRoute>} />
            <Route path="/browse-mentors" element={<ProtectedRoute><BrowseMentors /></ProtectedRoute>} />
            <Route path="/book-session/:mentorId" element={<ProtectedRoute><BookSession /></ProtectedRoute>} />
            <Route path="/video-session/:bookingId" element={<ProtectedRoute><VideoSession /></ProtectedRoute>} />
            <Route path="/availability" element={<ProtectedRoute><Availability /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Analysis from "./pages/Analysis";
import AnalyzeURL from "./pages/AnalyzeURL";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import GuestAnalysis from "./pages/GuestAnalysis";

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
  <Route path="/auth" element={<Auth />} />

  {/* Make URL analysis usable without login */}
  <Route path="/analyze-url" element={<AnalyzeURL />} />

  {/* Saved report page (ok to leave public; it will fetch by id if you’re logged in) */}
  <Route path="/analysis/:id" element={<Analysis />} />

  {/* NEW: guest results page (no DB, reads from sessionStorage) */}
  <Route path="/analysis/guest" element={<GuestAnalysis />} />

  <Route path="*" element={<NotFound />} />
</Routes>

        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

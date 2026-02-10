import { Sidebar } from "./Sidebar";
import { ReactNode, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export function AppLayout({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  const needsOnboarding = isAuthenticated && user && !user.onboardingCompleted;

  useEffect(() => {
    if (needsOnboarding) {
      navigate("/onboarding");
    }
  }, [needsOnboarding, navigate]);

  if (isLoading || needsOnboarding) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar />
      <main className="md:pl-64 min-h-screen transition-all duration-300">
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}

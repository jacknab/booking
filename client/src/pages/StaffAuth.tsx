import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scissors, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function StaffAuth() {
  const [, navigate] = useLocation();
  const { isAuthenticated, login, isLoggingIn } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/staff-dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate("/staff-dashboard");
    } catch (error: any) {
      toast({ 
        title: "Login failed", 
        description: error.message || "Invalid credentials", 
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Scissors className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight">Zolmi Clone</span>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-lg">
              Staff Portal Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  data-testid="input-staff-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@example.com"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  data-testid="input-staff-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoggingIn} data-testid="button-staff-login">
                {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Log in to Staff Portal
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

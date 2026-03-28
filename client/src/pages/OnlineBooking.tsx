import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSelectedStore } from "@/hooks/use-store";
import { useAuth } from "@/hooks/use-auth";
import { AppLayout } from "@/components/layout/AppLayout";
import { Globe, Copy, Check, ExternalLink, Link2, QrCode, Loader2, Smartphone, LayoutList, Layout } from "lucide-react";
import { QRCodeImage } from "@/components/ui/qr-code";
import { BookingInstructionsCard } from "@/components/BookingInstructionsCard";
import html2canvas from "html2canvas";
import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function OnlineBooking() {
    const qrRef = useRef<HTMLDivElement>(null);
    const [showInstructions, setShowInstructions] = useState<"Google" | "Instagram" | "Facebook" | null>(null);
  const { isLoading: authLoading } = useAuth();
  const { selectedStore } = useSelectedStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [slug, setSlug] = useState("");
  const [theme, setTheme] = useState("simple");
  const [copied, setCopied] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);

  useEffect(() => {
    if (selectedStore?.bookingSlug) {
      setSlug(selectedStore.bookingSlug);
    } else if (selectedStore?.name) {
      const auto = selectedStore.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setSlug(auto);
    }
    if (selectedStore?.bookingTheme) {
      setTheme(selectedStore.bookingTheme);
    }
  }, [selectedStore]);

  const baseUrl = window.location.origin;
  const bookingUrl = slug ? `${baseUrl}/book/${slug}` : "";
  const subdomainUrl = slug ? `https://${slug}.mysalon.me` : "";
  const displayDomain = slug ? `${slug}.mysalon.me` : "";

  const saveSlug = useMutation({
    mutationFn: async (newSlug: string) => {
      const res = await fetch(`/api/stores/${selectedStore!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingSlug: newSlug }),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to save");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
      toast({ title: "Booking link saved", description: `Your booking page is now live at ${displayDomain}` });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to save", description: err.message, variant: "destructive" });
    },
  });

  const saveThemeMutation = useMutation({
    mutationFn: async (newTheme: string) => {
      const res = await fetch(`/api/stores/${selectedStore!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingTheme: newTheme }),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        const msg = data.details ? `${data.message}: ${data.details}` : (data.message || "Failed to save theme");
        throw new Error(msg);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
      toast({ title: "Theme saved", description: "Your booking page appearance has been updated." });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to save theme", description: err.message, variant: "destructive" });
    },
  });

  const checkSlugAvailability = async (value: string) => {
    if (!value || value === selectedStore?.bookingSlug) {
      setSlugAvailable(null);
      return;
    }
    setCheckingSlug(true);
    try {
      const res = await fetch(`/api/public/check-slug/${value}`);
      const data = await res.json();
      setSlugAvailable(data.available);
    } catch {
      setSlugAvailable(null);
    }
    setCheckingSlug(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (slug && slug !== selectedStore?.bookingSlug) {
        checkSlugAvailability(slug);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [slug]);

  const handleSlugChange = (value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSlug(sanitized);
    setSlugAvailable(null);
  };

  const handleSave = () => {
    if (!slug.trim()) return;
    saveSlug.mutate(slug);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(subdomainUrl);
    setCopied(true);
    toast({ title: "Link copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isSaved = selectedStore?.bookingSlug === slug;

  return (
    <AppLayout>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Online Booking</h1>
        <p className="text-muted-foreground mt-1 mb-6">Set up your online booking page for clients.</p>
      </div>
      <div className="max-w-7xl space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-1" data-testid="text-booking-link-title">Booking Link</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Share your booking link on social media, Google, add as 'Book Now' on website.
          </p>

          {selectedStore?.bookingSlug ? (
            <>
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-2">Your booking URLs:</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <a
                      href={subdomainUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm font-medium break-all"
                      data-testid="link-subdomain-url"
                    >
                      {subdomainUrl}
                    </a>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCopy}
                      data-testid="button-copy-subdomain-link"
                      title="Copy subdomain URL"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">or use: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{bookingUrl}</code></p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <Badge variant="secondary" className="no-default-active-elevate text-green-600">
                  <Check className="w-3 h-3 mr-1" /> Active
                </Badge>
                <div ref={qrRef} className="ml-4">
                  <QRCodeImage value={subdomainUrl} size={128} />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (!qrRef.current) return;
                    const canvas = qrRef.current.querySelector("canvas");
                    if (!canvas) return;
                    const url = canvas.toDataURL("image/png");
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `booking-qr-${slug}.png`;
                    link.click();
                  }}
                  className="ml-2"
                >
                  Download QR
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-2">Customize your link below</p>
              <div className="flex items-center gap-2">
                <div className="flex items-center border rounded-md overflow-visible">
                  <Input
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="border-0 focus-visible:ring-0 w-[200px]"
                    placeholder="your-salon-name"
                    data-testid="input-booking-slug"
                  />
                  <span className="text-sm text-muted-foreground pr-3 whitespace-nowrap">.mysalon.me</span>
                </div>
                <Button
                  onClick={handleSave}
                  disabled={!slug.trim() || saveSlug.isPending || (slugAvailable === false)}
                  data-testid="button-save-slug"
                >
                  {saveSlug.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                </Button>
              </div>
              {slug && slug !== selectedStore?.bookingSlug && (
                <div className="mt-2">
                  {checkingSlug && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Checking availability...
                    </p>
                  )}
                  {!checkingSlug && slugAvailable === true && (
                    <p className="text-xs text-green-600" data-testid="text-slug-available">This name is available</p>
                  )}
                  {!checkingSlug && slugAvailable === false && (
                    <p className="text-xs text-red-500" data-testid="text-slug-taken">This name is already taken</p>
                  )}
                </div>
              )}
            </>
          )}
        </Card>

        {selectedStore?.bookingSlug && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">Booking Page Appearance</h3>
            <p className="text-sm text-muted-foreground mb-4">Choose a layout for your public booking page.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div 
                className={`border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors flex items-start gap-3 ${theme === 'simple' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'bg-card'}`}
                onClick={() => setTheme('simple')}
              >
                <div className={`p-2 rounded-full ${theme === 'simple' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  <LayoutList className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">Simple Theme</div>
                  <div className="text-sm text-muted-foreground mt-1">Clean, list-based layout focused on simplicity.</div>
                </div>
              </div>
              <div 
                className={`border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors flex items-start gap-3 ${theme === 'mobile' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'bg-card'}`}
                onClick={() => setTheme('mobile')}
              >
                <div className={`p-2 rounded-full ${theme === 'mobile' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">Mobile App UI</div>
                  <div className="text-sm text-muted-foreground mt-1">Modern, app-like experience with grid navigation.</div>
                </div>
              </div>
              <div 
                className={`border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors flex items-start gap-3 ${theme === 'classic' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'bg-card'}`}
                onClick={() => setTheme('classic')}
              >
                <div className={`p-2 rounded-full ${theme === 'classic' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  <Layout className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">Classic Theme</div>
                  <div className="text-sm text-muted-foreground mt-1">Traditional stepped booking experience with focus on clarity.</div>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button 
                onClick={() => saveThemeMutation.mutate(theme)} 
                disabled={theme === selectedStore?.bookingTheme || saveThemeMutation.isPending}
              >
                {saveThemeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Appearance
              </Button>
            </div>
          </Card>
        )}

        {selectedStore?.bookingSlug && (
          <>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <BookingInstructionsCard platform="Google" onOpen={() => setShowInstructions("Google")} />
                <BookingInstructionsCard platform="Instagram" onOpen={() => setShowInstructions("Instagram")} />
                <BookingInstructionsCard platform="Facebook" onOpen={() => setShowInstructions("Facebook")} />
              </div>
            </Card>
            {showInstructions && (
              <Card className="p-6 mt-4">
                <h3 className="text-lg font-semibold mb-3">How to add your booking link to {showInstructions}</h3>
                <ol className="list-decimal pl-6 space-y-2 text-sm">
                  {showInstructions === "Google" && (
                    <>
                      <li>Open your Google My Business profile.</li>
                      <li>Go to the Info section.</li>
                      <li>Find the "Website" or "Booking" field.</li>
                      <li>Paste your booking link: <span className="font-mono bg-muted px-1 rounded">{displayDomain}</span></li>
                      <li>Save changes.</li>
                    </>
                  )}
                  {showInstructions === "Instagram" && (
                    <>
                      <li>Open your Instagram profile.</li>
                      <li>Tap "Edit Profile".</li>
                      <li>Find the "Website" field.</li>
                      <li>Paste your booking link: <span className="font-mono bg-muted px-1 rounded">{displayDomain}</span></li>
                      <li>Save changes.</li>
                    </>
                  )}
                  {showInstructions === "Facebook" && (
                    <>
                      <li>Open your Facebook business page.</li>
                      <li>Click "Edit Page Info".</li>
                      <li>Find the "Website" or "Book Now" button settings.</li>
                      <li>Paste your booking link: <span className="font-mono bg-muted px-1 rounded">{displayDomain}</span></li>
                      <li>Save changes.</li>
                    </>
                  )}
                </ol>
                <Button variant="outline" className="mt-4" onClick={() => setShowInstructions(null)}>Close</Button>
              </Card>
            )}
          </>
        )}

        {!selectedStore && (
          <Card className="p-6 text-center">
            <Globe className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Select a store to configure online booking.</p>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSelectedStore } from "@/hooks/use-store";
import { useAuth } from "@/hooks/use-auth";
import { AppLayout } from "@/components/layout/AppLayout";
import { Globe, Copy, Check, ExternalLink, Link2, QrCode, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function OnlineBooking() {
  const { isLoading: authLoading } = useAuth();
  const { selectedStore } = useSelectedStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [slug, setSlug] = useState("");
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
  }, [selectedStore]);

  const baseUrl = window.location.origin;
  const bookingUrl = slug ? `${baseUrl}/book/${slug}` : "";
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
    navigator.clipboard.writeText(bookingUrl);
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
      <div className="max-w-3xl space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-1" data-testid="text-booking-link-title">Booking Link</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Share your booking link on social media, Google, add as 'Book Now' on website.
          </p>

          {selectedStore?.bookingSlug && (
            <div className="flex items-center gap-2 mb-4">
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm font-medium"
                data-testid="link-booking-url"
              >
                {displayDomain}
              </a>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                data-testid="button-copy-link"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          )}

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
              <span className="text-sm text-muted-foreground pr-3 whitespace-nowrap">mysalon.me</span>
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

          {isSaved && (
            <div className="mt-2">
              <Badge variant="secondary" className="no-default-active-elevate text-green-600">
                <Check className="w-3 h-3 mr-1" /> Active
              </Badge>
            </div>
          )}
        </Card>

        {selectedStore?.bookingSlug && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 border rounded-md">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <ExternalLink className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Preview Booking Page</p>
                  <a
                    href={bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                    data-testid="link-preview-booking"
                  >
                    Open in new tab
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 border rounded-md">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Link2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Copy Booking Link</p>
                  <button
                    onClick={handleCopy}
                    className="text-xs text-primary hover:underline"
                    data-testid="button-copy-link-action"
                  >
                    {copied ? "Copied!" : "Copy to clipboard"}
                  </button>
                </div>
              </div>
            </div>
          </Card>
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

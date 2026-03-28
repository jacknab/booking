
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import AdminDashboard from "./Dashboard";
import PublicBooking from "./PublicBooking";
import Landing from "./Landing";
import { Routes, Route } from "react-router-dom";

import type { StoreData } from "./public-booking/types";

/**
 * This component checks if the current request is from a subdomain.
 * If it is, it renders the PublicBooking page.
 * Otherwise, it renders the Landing page.
 */
export default function SubdomainRouter() {
  const [subdomain, setSubdomain] = useState<string | null>(null);

  // Detect subdomain from hostname
  useEffect(() => {
    const host = window.location.hostname;
    // Match *.mysalon.me pattern
    if (host.endsWith(".mysalon.me")) {
      const parts = host.split(".");
      // parts = ["slug", "mysalon", "me"]
      if (parts.length >= 3) {
        const potentialSubdomain = parts[0];
        // Exclude www and other common subdomains
        if (potentialSubdomain !== "www" && potentialSubdomain !== "api" && potentialSubdomain !== "app") {
          setSubdomain(potentialSubdomain);
          return;
        }
      }
    }
    // For localhost development: slug.localhost:5005
    if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) {
      const parts = host.split(".");
      if (parts.length > 1) {
        const potentialSubdomain = parts[0];
        if (potentialSubdomain !== "www" && potentialSubdomain !== "localhost" && potentialSubdomain !== "127") {
          setSubdomain(potentialSubdomain);
          return;
        }
      }
    }
    setSubdomain(null);
  }, []);

  // Try to fetch the store by subdomain
  const { data: subdomainStore, isLoading } = useQuery<StoreData>({
    queryKey: ["/api/store/by-subdomain"],
    enabled: subdomain !== null, // Only fetch if we detected a subdomain
    retry: false,
    refetchOnWindowFocus: false,
  });

  return (
    <Routes>
      <Route path="/isAdmin" element={<AdminDashboard />} />
      <Route
        path="/"
        element={(
          isLoading ? (
            <div className="min-h-screen bg-white flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : subdomainStore ? (
            <PublicBooking />
          ) : (
            <Landing />
          )
        )}
      />
    </Routes>
  );
}

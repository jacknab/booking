import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  LogOut,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import axios from "axios";
import { GoogleBusinessProfile } from "@shared/schema";

interface Location {
  name: string;
  title?: string;       // mybusinessbusinessinformation v1 uses "title"
  displayName?: string; // older field
}

interface Account {
  name: string;
  accountName?: string;
  displayName?: string;
}

type SetupStep =
  | "loading"
  | "initial"
  | "auth"
  | "select-account"
  | "select-location"
  | "connected";

interface GoogleBusinessProfileSetupProps {
  storeId?: number | null;
}

export function GoogleBusinessProfileSetup({ storeId: propStoreId }: GoogleBusinessProfileSetupProps = {}) {
  const params = useParams();
  const storeId = propStoreId ?? (params?.storeId ? Number(params.storeId) : null);

  const [profile, setProfile] = useState<GoogleBusinessProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<SetupStep>("loading");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load existing profile on mount
  useEffect(() => {
    if (storeId) {
      loadProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  // Handle OAuth callback code/state in the URL (after Google redirect)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");
    const error = urlParams.get("error");

    if (error) {
      setErrorMsg(`Google authorization was denied: ${error}`);
      setStep("initial");
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (code && step === "loading") {
      // Clean up URL before processing so a refresh doesn't replay the code
      window.history.replaceState({}, document.title, window.location.pathname);
      handleAuthCallback(code, state ?? undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const loadProfile = async () => {
    if (!storeId) return;
    try {
      setStep("loading");
      const response = await axios.get(`/api/google-business/profile/${storeId}`);
      if (response.data.profile) {
        setProfile(response.data.profile);
        setStep("connected");
      } else {
        setStep("initial");
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
      setStep("initial");
    }
  };

  /** Step 1 — redirect to Google's OAuth consent screen */
  const handleStartAuth = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const response = await axios.get("/api/google-business/auth-url");
      // The server embedded a CSRF state token inside the URL.
      // Redirecting the browser preserves the session so the server can verify it.
      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error("Failed to get auth URL:", error);
      setErrorMsg("Failed to start Google authorization. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /** Step 2 — exchange OAuth code for tokens */
  const handleAuthCallback = async (code: string, state?: string) => {
    if (!storeId) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      const response = await axios.post("/api/google-business/callback", {
        code,
        storeId,
        state, // sent back so the server can verify the CSRF state
      });

      setProfileId(response.data.profileId);
      setAccounts(response.data.accounts ?? []);
      setStep("select-account");
    } catch (error: any) {
      console.error("Failed to authenticate:", error);
      const msg =
        error.response?.data?.message ?? "Authentication failed. Please try again.";
      setErrorMsg(msg);
      setStep("initial");
    } finally {
      setLoading(false);
    }
  };

  /** Step 3 — choose a business account and list its locations */
  const handleSelectAccount = async () => {
    if (!selectedAccount || !storeId) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      const response = await axios.post("/api/google-business/locations", {
        profileId,
        accountName: selectedAccount,
      });
      setLocations(response.data.locations ?? []);
      setStep("select-location");
    } catch (error: any) {
      console.error("Failed to load locations:", error);
      setErrorMsg(
        error.response?.data?.message ?? "Failed to load business locations."
      );
    } finally {
      setLoading(false);
    }
  };

  /** Step 4 — connect the chosen location */
  const handleSelectLocation = async () => {
    if (!selectedLocation || !storeId || !profileId) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      await axios.post("/api/google-business/connect-location", {
        profileId,
        locationName: selectedLocation,
        locationId: selectedLocationId,
      });
      await loadProfile();
    } catch (error: any) {
      console.error("Failed to connect location:", error);
      setErrorMsg(
        error.response?.data?.message ?? "Failed to connect location."
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Disconnect — calls DELETE endpoint which:
   * 1. Revokes the OAuth token at Google
   * 2. Deletes all synced reviews from our database
   * 3. Deletes the profile record
   *
   * This is required by Google API policies.
   */
  const handleDisconnect = async () => {
    if (
      !profile ||
      !window.confirm(
        "Disconnect your Google Business Profile?\n\n" +
          "This will revoke our access to your Google account and delete all " +
          "synced reviews from this platform. Your reviews will remain on Google."
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      await axios.delete(`/api/google-business/profile/${storeId}`);
      setProfile(null);
      setStep("initial");
    } catch (error: any) {
      console.error("Failed to disconnect:", error);
      setErrorMsg(
        error.response?.data?.message ??
          "Failed to disconnect. Please try again or revoke access directly in your Google Account settings."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!storeId) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-700">Invalid Store</CardTitle>
          <CardDescription className="text-red-600">
            No store ID found. Please navigate from your store settings.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-blue-600" size={22} />
            <CardTitle>Google Business Profile</CardTitle>
          </div>
          <CardDescription>
            Connect your Google Business Profile to view and respond to customer
            reviews directly from this dashboard.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error banner */}
          {errorMsg && (
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ── LOADING ── */}
          {step === "loading" && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-gray-400" size={24} />
            </div>
          )}

          {/* ── INITIAL / NOT CONNECTED ── */}
          {step === "initial" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Click the button below to authorize Certxa to access your Google
                Business Profile reviews. You will be redirected to Google to
                approve the connection.
              </p>
              <ul className="text-sm text-gray-500 space-y-1 list-disc pl-5">
                <li>We only request permission to read reviews and post responses</li>
                <li>We never access Gmail, Calendar or other Google services</li>
                <li>You can disconnect at any time</li>
              </ul>
              <Button onClick={handleStartAuth} disabled={loading} className="w-full gap-2">
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Redirecting to Google…
                  </>
                ) : (
                  "Connect Google Business Profile"
                )}
              </Button>
              <p className="text-xs text-center text-gray-400">
                By connecting you agree to our{" "}
                <a href="/privacy-policy" className="underline hover:text-gray-600" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          )}

          {/* ── SELECT ACCOUNT ── */}
          {step === "select-account" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 font-medium">
                Select your business account:
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {accounts.map((account) => (
                  <label
                    key={account.name}
                    className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name="account"
                      value={account.name}
                      checked={selectedAccount === account.name}
                      onChange={(e) => setSelectedAccount(e.target.value)}
                    />
                    <span className="flex-1 text-sm">
                      {account.accountName ?? account.displayName ?? account.name}
                    </span>
                  </label>
                ))}
              </div>
              <Button
                onClick={handleSelectAccount}
                disabled={!selectedAccount || loading}
                className="w-full gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Loading locations…
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          )}

          {/* ── SELECT LOCATION ── */}
          {step === "select-location" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 font-medium">
                Select the business location to connect:
              </p>
              {locations.length === 0 ? (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
                  No locations found for this account. Make sure your Google
                  Business Profile has at least one verified location.
                </p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {locations.map((location) => (
                    <label
                      key={location.name}
                      className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="location"
                        value={location.name}
                        checked={selectedLocation === location.name}
                        onChange={(e) => {
                          setSelectedLocation(e.target.value);
                          setSelectedLocationId(
                            location.name.split("/").pop() ?? ""
                          );
                        }}
                      />
                      <span className="flex-1 text-sm">
                        {location.title ?? location.displayName ?? location.name}
                      </span>
                    </label>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep("select-account")}
                  disabled={loading}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSelectLocation}
                  disabled={!selectedLocation || loading}
                  className="flex-1 gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Connecting…
                    </>
                  ) : (
                    "Connect Location"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* ── CONNECTED ── */}
          {step === "connected" && profile && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="font-medium text-green-900 text-sm">Connected</h4>
                  <p className="text-sm text-green-700 mt-0.5">
                    Your Google Business Profile is connected and reviews will
                    sync automatically.
                  </p>
                </div>
              </div>

              <div className="rounded-lg border bg-gray-50 p-4 space-y-2 text-sm">
                {profile.googleAccountEmail && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Google Account</span>
                    <span className="font-medium">{profile.googleAccountEmail}</span>
                  </div>
                )}
                {profile.businessName && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Business Name</span>
                    <span className="font-medium">{profile.businessName}</span>
                  </div>
                )}
                {profile.locationId && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Location ID</span>
                    <span className="font-medium font-mono text-xs">{profile.locationId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Synced</span>
                  <span className="font-medium">
                    {profile.lastSyncedAt
                      ? new Date(profile.lastSyncedAt).toLocaleString()
                      : "Not yet synced"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <Badge
                    variant={profile.isConnected ? "default" : "outline"}
                    className="text-xs"
                  >
                    {profile.isConnected ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={loadProfile}
                  disabled={loading}
                  className="flex-1 gap-2"
                >
                  <RefreshCw size={14} />
                  Refresh Status
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDisconnect}
                  disabled={loading}
                  className="flex-1 gap-2"
                >
                  {loading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <LogOut size={14} />
                  )}
                  Disconnect
                </Button>
              </div>

              <p className="text-xs text-gray-400 text-center">
                Disconnecting will revoke our access and delete all synced reviews
                from this platform. Your reviews remain on Google.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

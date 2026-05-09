import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { GoogleConnectGate } from "@/components/GoogleConnectGate";
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
  const [selectedLocationTitle, setSelectedLocationTitle] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showNoLocModal, setShowNoLocModal] = useState(false);

  // On mount: check for OAuth result params in the URL, or load the existing profile.
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const googleConnected = urlParams.get("google_connected");
    const googleError     = urlParams.get("google_error");
    const code            = urlParams.get("code");   // legacy frontend-mediated flow
    const stateParm       = urlParams.get("state");

    // Always clean up URL params so a refresh doesn't replay
    if (googleConnected || googleError || code) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (googleError) {
      const messages: Record<string, string> = {
        access_denied:    "Google access was denied. Please try again and accept the permissions.",
        csrf_mismatch:    "Security token mismatch. Please start the connection flow again.",
        missing_store:    "Could not identify which store to connect. Please try again.",
        quota_exceeded:   "Google Business Profile API quota exceeded. Request a quota increase at https://support.google.com/business/contact/api_default_quota_increase",
        no_access_token:  "Google did not return an access token. Ensure offline access is enabled.",
        server_error:     "An unexpected error occurred. Check server logs for details.",
        missing_params:   "Google redirect was missing required parameters.",
        invalid_state:    "Invalid OAuth state token. Please try again.",
      };
      setErrorMsg(messages[googleError] ?? `Google authorization error: ${googleError}`);
      setStep("initial");
      return;
    }

    if (googleConnected === "1" && storeId) {
      // Server-side callback handled the token exchange.
      // Pick up the result from the server session.
      handlePickupConnectionResult();
      return;
    }

    if (code && step === "loading" && storeId) {
      // Legacy: frontend-mediated flow where redirect_uri pointed at a frontend page.
      handleAuthCallback(code, stateParm ?? undefined);
      return;
    }

    // No OAuth params — load existing profile normally.
    if (storeId) loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

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

  /**
   * Pick up the Google connection result stored in the server session by
   * the GET /api/google-business/callback redirect handler.
   * Called when the page loads with ?google_connected=1.
   */
  const handlePickupConnectionResult = async () => {
    if (!storeId) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      setStep("loading");
      const response = await axios.get("/api/google-business/connection-result");
      const { accounts = [], profileId: pid, email } = response.data;

      if (!accounts.length) {
        setErrorMsg(
          "Google authentication succeeded but no Business Profile accounts were found. " +
          "Make sure your Google account has a Business Profile at business.google.com."
        );
        setStep("initial");
        return;
      }

      setProfileId(pid);
      setAccounts(accounts);
      setStep("select-account");
    } catch (error: any) {
      console.error("Failed to pick up Google connection result:", error);
      const msg = error.response?.data?.message ?? "Failed to complete Google sign-in. Please try again.";
      setErrorMsg(msg);
      setStep("initial");
    } finally {
      setLoading(false);
    }
  };

  /** Step 1 — redirect to Google's OAuth consent screen */
  const handleStartAuth = async () => {
    if (!storeId) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      // Pass storeId so the server can embed it in the OAuth state for the
      // server-side callback to restore context after the redirect.
      const response = await axios.get(`/api/google-business/auth-url?storeId=${storeId}`);
      // Redirect the browser — session cookie travels with it, preserving CSRF state.
      window.location.href = response.data.authUrl;
    } catch (error: any) {
      console.error("Failed to get auth URL:", error);
      const msg = error.response?.data?.message ?? "Failed to start Google authorization. Please try again.";
      setErrorMsg(msg);
      setLoading(false);
    }
  };

  /** Step 2 (legacy) — exchange OAuth code for tokens via POST (frontend-mediated flow) */
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
      const locs = response.data.locations ?? [];
      setLocations(locs);
      setStep("select-location");
      if (locs.length === 0) setShowNoLocModal(true);
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
        businessName: selectedLocationTitle,
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

  // Derived: display name for the currently-selected Google account (used in the "No Locations" modal)
  const noLocAcctName = (() => {
    const acct = accounts.find(a => a.name === selectedAccount);
    return acct?.accountName ?? acct?.displayName ?? "your Google account";
  })();

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

  // Show the full connect gate screen when not yet connected
  if (step === "initial") {
    return (
      <div className="space-y-4">
        {errorMsg && (
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
        <GoogleConnectGate
          onConnect={handleStartAuth}
          loading={loading}
          subtitle="We only request read access to your reviews. You can disconnect at any time."
        />
      </div>
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
                <div />
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
                          setSelectedLocationTitle(
                            location.title ?? location.displayName ?? null
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

      {/* ── No Locations Found modal ────────────────────────── */}
      {showNoLocModal && (
        <div
          onClick={() => { setShowNoLocModal(false); setStep("select-account"); }}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: "32px 36px",
              maxWidth: 520,
              width: "90%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
            }}
          >
            <h3 style={{ margin: "0 0 14px", fontSize: "1.2rem", fontWeight: 700, color: "#111" }}>
              No Locations Found
            </h3>
            <p style={{ margin: "0 0 32px", fontSize: "0.95rem", color: "#4b5563", lineHeight: 1.65 }}>
              It looks like you don't have any locations associated with{" "}
              <strong>{noLocAcctName}</strong>. Please add a location to your Google Business Profile to enable bookings and manage your business details.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => { setShowNoLocModal(false); setStep("select-account"); }}
                style={{
                  background: "#1a73e8", color: "#fff",
                  border: "none", borderRadius: 999,
                  padding: "10px 28px", fontSize: "0.95rem",
                  fontWeight: 700, cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

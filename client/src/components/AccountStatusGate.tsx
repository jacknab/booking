/**
 * AccountStatusGate
 * -----------------
 * Wraps all authenticated app routes. Checks the billing account status
 * once per session and intercepts if the account is suspended or locked.
 *
 * States:
 *   active    → children rendered normally
 *   suspended → AccountSuspended page shown (Stripe sub alive, no data deleted)
 *   locked    → AccountLocked page shown (sub canceled, 30 days past due)
 *   loading   → spinner while fetching
 *   error / no billing profile → allow through (don't block fresh accounts)
 */

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import AccountSuspended from "@/pages/AccountSuspended";
import AccountLocked from "@/pages/AccountLocked";

interface AccountStatusGateProps {
  children: React.ReactNode;
}

export function AccountStatusGate({ children }: AccountStatusGateProps) {
  const { data, isLoading, isError } = useQuery<{
    accountStatus: string | null;
    suspendedAt: string | null;
    lockedAt: string | null;
    suspendedReason: string | null;
    salonId: number | null;
  }>({
    queryKey: ["/api/billing/account-status"],
    queryFn: () =>
      fetch("/api/billing/account-status", { credentials: "include" }).then((r) => {
        if (!r.ok) throw new Error("unauthorized");
        return r.json();
      }),
    retry: false,
    // Refetch every 5 minutes in case the admin restores the account
    refetchInterval: 5 * 60 * 1000,
    // Stale immediately so it always checks on mount
    staleTime: 0,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  // If the request failed or no billing profile exists yet, allow through.
  // We never want to accidentally block a legitimate active user.
  if (isError || !data || !data.accountStatus) {
    return <>{children}</>;
  }

  if (data.accountStatus === "locked") {
    return <AccountLocked />;
  }

  if (data.accountStatus === "suspended") {
    return <AccountSuspended />;
  }

  // accountStatus === 'active' (or any unrecognized value → allow through)
  return <>{children}</>;
}

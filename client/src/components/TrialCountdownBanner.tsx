import React, { useState } from "react";
import { X, Clock, AlertTriangle, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TrialCountdownBannerProps {
  daysRemaining: number | null;
  subscriptionStatus: string;
}

function getTier(subscriptionStatus: string, daysRemaining: number | null) {
  if (subscriptionStatus === "expired") return "expired";
  if (subscriptionStatus === "inactive") return "inactive";
  if (subscriptionStatus !== "trial" || daysRemaining === null) return null;
  if (daysRemaining > 7) return "info";
  if (daysRemaining > 2) return "warning";
  return "urgent";
}

const TIER_STYLES = {
  info: {
    bar: "bg-indigo-600",
    text: "text-white",
    btnBg: "bg-white/20 hover:bg-white/30 text-white border-white/30",
    xBtn: "text-white/70 hover:text-white hover:bg-white/20",
    icon: Clock,
  },
  warning: {
    bar: "bg-amber-500",
    text: "text-white",
    btnBg: "bg-white/20 hover:bg-white/30 text-white border-white/30",
    xBtn: "text-white/70 hover:text-white hover:bg-white/20",
    icon: AlertTriangle,
  },
  urgent: {
    bar: "bg-red-600",
    text: "text-white",
    btnBg: "bg-white/20 hover:bg-white/30 text-white border-white/30",
    xBtn: "text-white/70 hover:text-white hover:bg-white/20",
    icon: AlertTriangle,
  },
  expired: {
    bar: "bg-red-700",
    text: "text-white",
    btnBg: "bg-white/20 hover:bg-white/30 text-white border-white/30",
    xBtn: "text-white/70 hover:text-white hover:bg-white/20",
    icon: AlertTriangle,
  },
  inactive: {
    bar: "bg-gray-700",
    text: "text-white",
    btnBg: "bg-white/20 hover:bg-white/30 text-white border-white/30",
    xBtn: "text-white/70 hover:text-white hover:bg-white/20",
    icon: Zap,
  },
};

function getMessage(tier: string, daysRemaining: number | null) {
  if (tier === "info") {
    return (
      <>
        Your free trial ends in{" "}
        <strong className="font-semibold">{daysRemaining} days</strong>.
        {" "}Upgrade to keep your bookings, booking page, and website running after the trial.
      </>
    );
  }
  if (tier === "warning") {
    return (
      <>
        <strong className="font-semibold">{daysRemaining} days left</strong> in your free trial.
        {" "}Subscribe now to avoid any interruption to your business.
      </>
    );
  }
  if (tier === "urgent") {
    return (
      <>
        <strong className="font-semibold">
          Trial expires in {daysRemaining} day{daysRemaining === 1 ? "" : "s"}!
        </strong>{" "}
        Your booking page and website will go offline when it ends.
      </>
    );
  }
  if (tier === "expired") {
    return (
      <>
        <strong className="font-semibold">Your free trial has ended.</strong>{" "}
        Subscribe now to restore your booking page, website, and full dashboard access.
      </>
    );
  }
  if (tier === "inactive") {
    return (
      <>
        Your subscription is inactive. Activate to start accepting bookings.
      </>
    );
  }
  return null;
}

function getCtaLabel(tier: string) {
  if (tier === "expired" || tier === "inactive") return "Reactivate Account";
  return "Subscribe Now";
}

export const TrialCountdownBanner: React.FC<TrialCountdownBannerProps> = ({
  daysRemaining,
  subscriptionStatus,
}) => {
  const navigate = useNavigate();
  const tier = getTier(subscriptionStatus, daysRemaining);

  const dismissKey = tier ? `trial-banner-dismissed-${tier}` : null;
  const [dismissed, setDismissed] = useState(
    () => dismissKey ? sessionStorage.getItem(dismissKey) === "1" : false
  );

  if (!tier || dismissed) return null;

  const styles = TIER_STYLES[tier as keyof typeof TIER_STYLES];
  const Icon = styles.icon;

  const handleDismiss = () => {
    if (dismissKey) sessionStorage.setItem(dismissKey, "1");
    setDismissed(true);
  };

  const handleCta = () => navigate("/manage/billing");

  return (
    <div className={`w-full ${styles.bar} ${styles.text} flex-shrink-0`} role="alert">
      <div className="flex items-center justify-between px-4 py-2.5 gap-4">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Icon className="h-4 w-4 flex-shrink-0 opacity-90" />
          <p className="text-sm leading-snug truncate sm:whitespace-normal sm:overflow-visible">
            {getMessage(tier, daysRemaining)}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {(tier === "expired" || tier === "inactive" || (daysRemaining !== null && daysRemaining <= 10)) && (
            <button
              onClick={handleCta}
              className={`
                text-xs font-medium px-3 py-1.5 rounded border
                transition-colors whitespace-nowrap
                ${styles.btnBg}
              `}
            >
              {getCtaLabel(tier)}
            </button>
          )}

          {tier !== "expired" && (
            <button
              onClick={handleDismiss}
              aria-label="Dismiss banner"
              className={`
                rounded p-1 transition-colors
                ${styles.xBtn}
              `}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

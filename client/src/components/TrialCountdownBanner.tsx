import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Crown, Clock, AlertTriangle, CreditCard } from 'lucide-react';

interface TrialCountdownBannerProps {
  daysRemaining: number | null;
  subscriptionStatus: string;
  onUpgrade?: () => void;
}

export const TrialCountdownBanner: React.FC<TrialCountdownBannerProps> = ({
  daysRemaining,
  subscriptionStatus,
  onUpgrade
}) => {
  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      window.location.href = '/billing';
    }
  };

  // Trial is active
  if (subscriptionStatus === 'trial' && daysRemaining !== null) {
    if (daysRemaining > 7) {
      // Normal notice (7+ days)
      return (
        <Alert className="bg-blue-50 border-blue-200 text-blue-800">
          <Clock className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              Your free trial ends in <strong>{daysRemaining} days</strong>. 
              Upgrade now to keep your bookings running.
            </span>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleUpgrade}
              className="ml-4 bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
            >
              Upgrade Now
            </Button>
          </AlertDescription>
        </Alert>
      );
    } else if (daysRemaining > 2) {
      // Warning (3-7 days)
      return (
        <Alert className="bg-orange-50 border-orange-200 text-orange-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              <strong>{daysRemaining} days</strong> left in your free trial. 
              Upgrade now to avoid interruption.
            </span>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleUpgrade}
              className="ml-4 bg-orange-600 text-white hover:bg-orange-700 border-orange-600"
            >
              Upgrade Now
            </Button>
          </AlertDescription>
        </Alert>
      );
    } else {
      // Urgent (1-2 days)
      return (
        <Alert className="bg-red-50 border-red-200 text-red-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              <strong>Your trial expires in {daysRemaining} day{daysRemaining === 1 ? '' : 's'}!</strong> 
              Upgrade now to avoid interruption.
            </span>
            <Button 
              size="sm" 
              onClick={handleUpgrade}
              className="ml-4 bg-red-600 text-white hover:bg-red-700"
            >
              Upgrade Now
            </Button>
          </AlertDescription>
        </Alert>
      );
    }
  }

  // Trial expired
  if (subscriptionStatus === 'expired') {
    return (
      <Alert className="bg-red-50 border-red-200 text-red-800">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            <strong>Your free trial has ended.</strong> 
            Upgrade your account to continue accepting bookings.
          </span>
          <Button 
            size="sm" 
            onClick={handleUpgrade}
            className="ml-4 bg-red-600 text-white hover:bg-red-700"
          >
            Upgrade Account
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Inactive subscription
  if (subscriptionStatus === 'inactive') {
    return (
      <Alert className="bg-gray-50 border-gray-200 text-gray-800">
        <Crown className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            Activate your subscription to start accepting bookings.
          </span>
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleUpgrade}
            className="ml-4"
          >
            Activate
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Active subscription or other status - no banner needed
  return null;
};

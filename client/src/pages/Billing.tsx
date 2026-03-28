import React, { useState, useEffect } from 'react';
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Crown, CreditCard, Check, X, Clock, AlertTriangle } from 'lucide-react';
import { useTrial } from '@/hooks/use-trial';
import { format } from 'date-fns';

export default function Billing() {
  const { trialStatus, loading } = useTrial();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly');

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  const plans = [
    {
      name: 'Monthly',
      price: '$29',
      period: '/month',
      interval: 'monthly' as const,
      features: [
        'Unlimited appointments',
        'Customer management',
        'Staff scheduling',
        'SMS reminders',
        'Email notifications',
        'Online booking widget',
        'Basic reporting'
      ]
    },
    {
      name: 'Annual',
      price: '$290',
      period: '/year',
      interval: 'annual' as const,
      features: [
        'Everything in Monthly',
        '2 months free',
        'Advanced analytics',
        'Priority support',
        'Custom branding',
        'API access',
        'Multi-location support'
      ]
    }
  ];

  const getStatusBadge = () => {
    if (!trialStatus) return null;

    switch (trialStatus.subscriptionStatus) {
      case 'trial':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 mr-1" />
            Free Trial ({trialStatus.daysRemaining} days left)
          </Badge>
        );
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800">
            <Check className="w-3 h-3 mr-1" />
            Active Subscription
          </Badge>
        );
      case 'expired':
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Trial Expired
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <X className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="text-gray-600">Choose the plan that works best for your business</p>
          {getStatusBadge()}
        </div>

        {/* Current Status */}
        {trialStatus && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-600" />
                Current Subscription Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium capitalize">{trialStatus.subscriptionStatus}</p>
                </div>
                {trialStatus.trialStartedAt && (
                  <div>
                    <p className="text-sm text-gray-500">Trial Started</p>
                    <p className="font-medium">
                      {format(new Date(trialStatus.trialStartedAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                )}
                {trialStatus.trialEndsAt && (
                  <div>
                    <p className="text-sm text-gray-500">Trial Ends</p>
                    <p className="font-medium">
                      {format(new Date(trialStatus.trialEndsAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <Card 
              key={plan.interval}
              className={`relative ${selectedPlan === plan.interval ? 'border-blue-500 shadow-lg' : 'border-gray-200'}`}
            >
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-gray-500 ml-1">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full"
                  variant={selectedPlan === plan.interval ? "default" : "outline"}
                  onClick={() => setSelectedPlan(plan.interval)}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {trialStatus?.subscriptionStatus === 'active' ? 'Switch Plan' : 'Upgrade Now'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trial Expired Notice */}
        {trialStatus?.subscriptionStatus === 'expired' && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Your free trial has ended.</strong> Upgrade now to continue accepting bookings and managing your business without interruption.
            </AlertDescription>
          </Alert>
        )}

        {/* Features Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-gray-500">
              <p>Detailed feature comparison will be available here.</p>
              <p className="text-sm">This page is ready for Stripe payment integration.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

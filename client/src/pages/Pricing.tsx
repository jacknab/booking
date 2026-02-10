import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Scissors,
  Check,
  Minus,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";

const START_BASE = 20;
const START_PER_STAFF = 3;
const PRO_BASE = 30;
const PRO_PER_STAFF = 5;

const startFeatures = [
  "Online Calendar",
  "Appointment Reminders",
  "Online Booking",
  "Staff & Client Management",
  "Up to 10 products in stock",
];

const proFeatures = [
  "Business Reporting",
  "Stock Management",
  "Google Review Booster",
  "Marketing SMS",
  "Commission Tracking",
];

interface FeatureRow {
  label: string;
  category?: string;
  start: boolean;
  pro: boolean;
}

const comparisonFeatures: FeatureRow[] = [
  { category: "The Essentials", label: "", start: false, pro: false },
  { label: "Free Online Booking Platform", start: true, pro: true },
  { label: "No Contract, Cancel Anytime", start: true, pro: true },
  { label: "No Setup Costs", start: true, pro: true },
  { label: "Live Chat Support 24/7", start: true, pro: true },
  { label: "SMS Notifications Available", start: true, pro: true },

  { category: "No-Show & Cancellation Protection", label: "", start: false, pro: false },
  { label: "SMS Notifications", start: true, pro: true },
  { label: "In-App & Email Notifications", start: true, pro: true },
  { label: "Ability to Block Clients from Online Booking", start: false, pro: true },

  { category: "Client Excellence", label: "", start: false, pro: false },
  { label: "Stay Open 24/7 with Online Booking", start: true, pro: true },
  { label: "Embed Booking Page on Your Website", start: true, pro: true },

  { category: "Business Management", label: "", start: false, pro: false },
  { label: "Multi-Store Management", start: true, pro: true },
  { label: "Timezone-Aware Calendar", start: true, pro: true },
  { label: "POS Checkout with Split Tender", start: true, pro: true },
  { label: "Cash Drawer & Z Report", start: true, pro: true },
  { label: "Thermal Receipt Printing", start: true, pro: true },
  { label: "Services & Add-Ons Management", start: true, pro: true },
  { label: "Staff Availability & Scheduling", start: true, pro: true },

  { category: "Growth & Analytics", label: "", start: false, pro: false },
  { label: "Dashboard Analytics", start: true, pro: true },
  { label: "Commission Tracking & Payouts", start: false, pro: true },
  { label: "Product Inventory Management", start: true, pro: true },
  { label: "Advanced Business Reporting", start: false, pro: true },
  { label: "Google Review Booster", start: false, pro: true },
  { label: "Marketing SMS Campaigns", start: false, pro: true },
];

export default function Pricing() {
  const [staffCount, setStaffCount] = useState(1);

  const startTotal = START_BASE + Math.max(0, staffCount - 1) * START_PER_STAFF;
  const proTotal = PRO_BASE + Math.max(0, staffCount - 1) * PRO_PER_STAFF;
  const additionalStaff = Math.max(0, staffCount - 1);

  return (
    <div className="min-h-screen bg-background font-body">
      <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer" data-testid="link-home">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-display font-bold text-xl tracking-tight">Zolmi Clone</span>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/pricing">
                <Button variant="ghost" className="font-medium" data-testid="link-pricing">Pricing</Button>
              </Link>
              <Link href="/auth">
                <Button variant="ghost" className="font-medium" data-testid="link-login">Log in</Button>
              </Link>
              <Link href="/auth">
                <Button data-testid="link-get-started">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground mb-4">
              Simple, transparent pricing
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start with one user included. Add more staff as your business grows. No hidden fees, no contracts.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col items-center mb-12"
          >
            <p className="text-sm font-medium text-muted-foreground mb-3">Choose bookable staff</p>
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="outline"
                onClick={() => setStaffCount(Math.max(1, staffCount - 1))}
                disabled={staffCount <= 1}
                data-testid="button-staff-minus"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-12 text-center text-2xl font-bold font-display" data-testid="text-staff-count">
                {staffCount}
              </span>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setStaffCount(staffCount + 1)}
                data-testid="button-staff-plus"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-24">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="relative overflow-visible" data-testid="card-plan-start">
                <div className="absolute -top-3 left-6">
                  <span className="inline-block bg-primary text-primary-foreground text-xs font-bold uppercase px-3 py-1 rounded-full">
                    Start
                  </span>
                </div>
                <CardContent className="p-6 pt-8">
                  <div className="text-center mb-6">
                    <div className="flex items-baseline justify-center gap-1 mb-1">
                      <span className="text-lg text-muted-foreground">$</span>
                      <span className="text-5xl font-display font-bold" data-testid="text-start-price">{startTotal}</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">1st staff</span>
                      <span className="font-medium">1 x ${START_BASE}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Additional staff</span>
                      <span className="font-medium">{additionalStaff} x ${START_PER_STAFF}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold">Total ${startTotal} / month</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Billed monthly</p>
                    </div>
                  </div>

                  <div className="border-t pt-4 mb-6">
                    <div className="flex items-center justify-between text-sm mb-4">
                      <span className="text-muted-foreground">SMS Pricing From</span>
                      <span className="font-medium">$0.02</span>
                    </div>

                    <div className="space-y-2.5">
                      {startFeatures.map((feature) => (
                        <div key={feature} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link href="/auth">
                    <Button className="w-full" data-testid="button-start-plan">
                      Get Started
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="relative overflow-visible border-accent" data-testid="card-plan-pro">
                <div className="absolute -top-3 left-6">
                  <span className="inline-block bg-accent text-accent-foreground text-xs font-bold uppercase px-3 py-1 rounded-full">
                    Pro
                  </span>
                </div>
                <div className="absolute -top-3 right-6">
                  <span className="inline-block bg-accent/10 text-accent text-xs font-bold px-3 py-1 rounded-full">
                    Free Trial
                  </span>
                </div>
                <CardContent className="p-6 pt-8">
                  <div className="text-center mb-6">
                    <div className="flex items-baseline justify-center gap-1 mb-1">
                      <span className="text-lg text-muted-foreground">$</span>
                      <span className="text-5xl font-display font-bold" data-testid="text-pro-price">{proTotal}</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">1st staff</span>
                      <span className="font-medium">1 x ${PRO_BASE}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Additional staff</span>
                      <span className="font-medium">{additionalStaff} x ${PRO_PER_STAFF}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold">Total ${proTotal} / month</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Billed monthly</p>
                    </div>
                  </div>

                  <div className="border-t pt-4 mb-6">
                    <div className="flex items-center justify-between text-sm mb-4">
                      <span className="text-muted-foreground">SMS Pricing From</span>
                      <span className="font-medium">$0.02</span>
                    </div>

                    <div className="space-y-2.5">
                      {proFeatures.map((feature) => (
                        <div key={feature} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-accent flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link href="/auth">
                    <Button className="w-full bg-accent text-accent-foreground border-accent" data-testid="button-pro-plan">
                      Start Free Trial
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-display font-bold text-center mb-8">Compare all features</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="table-feature-comparison">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 pr-4 font-normal text-muted-foreground w-1/2"></th>
                      <th className="py-3 px-4 w-1/4">
                        <span className="inline-block bg-primary text-primary-foreground text-xs font-bold uppercase px-3 py-1 rounded-full">
                          Start
                        </span>
                      </th>
                      <th className="py-3 px-4 w-1/4">
                        <span className="inline-block bg-accent text-accent-foreground text-xs font-bold uppercase px-3 py-1 rounded-full">
                          Pro
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((row, idx) => {
                      if (row.category) {
                        return (
                          <tr key={`cat-${idx}`} className="border-b">
                            <td colSpan={3} className="py-4 font-bold font-display text-foreground">
                              {row.category}
                            </td>
                          </tr>
                        );
                      }
                      return (
                        <tr key={`feat-${idx}`} className="border-b last:border-b-0">
                          <td className="py-3 pr-4 text-muted-foreground">{row.label}</td>
                          <td className="py-3 px-4 text-center">
                            {row.start ? (
                              <Check className="w-5 h-5 text-primary mx-auto" />
                            ) : (
                              <span className="text-muted-foreground/40">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {row.pro ? (
                              <Check className="w-5 h-5 text-accent mx-auto" />
                            ) : (
                              <span className="text-muted-foreground/40">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-display font-bold mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Try the Pro plan free for 14 days. No credit card required.
          </p>
          <Link href="/auth">
            <Button size="lg" className="rounded-full" data-testid="link-cta-bottom">
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>

      <footer className="bg-card border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Scissors className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">Zolmi Clone</span>
          </div>
          <p className="text-muted-foreground text-sm">
            2025 Zolmi Clone. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

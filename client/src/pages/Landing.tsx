import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight, Calendar, BarChart3, Scissors, Users, DollarSign,
  Banknote, Clock, ShoppingBag, Puzzle, Receipt, Building2, UserCircle
} from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    window.location.href = "/dashboard";
    return null;
  }

  return (
    <div className="min-h-screen bg-background font-body">
      <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Scissors className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">Zolmi Clone</span>
            </div>
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

      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-6xl font-display font-bold tracking-tight text-foreground mb-6"
            >
              Salon software that <br />
              <span className="text-gradient">actually works for you</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-10 leading-relaxed"
            >
              Streamline your booking, manage staff, and grow your business with the all-in-one platform loved by beauty professionals.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/auth">
                <Button size="lg" className="rounded-full" data-testid="link-free-trial">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="rounded-full" data-testid="button-view-demo">
                View Demo
              </Button>
            </motion.div>
          </div>
        </div>

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl -z-10" />
      </div>

      <div className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold mb-4">Everything you need to run your salon</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From booking to checkout, we've got every aspect of your business covered with powerful, easy-to-use tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Calendar className="w-6 h-6 text-primary" />}
              title="Timezone-Aware Calendar"
              description="Visual day-view calendar with staff columns, current-time indicator, and auto-scroll. Appointments display with color-coded staff blocks."
            />
            <FeatureCard
              icon={<Scissors className="w-6 h-6 text-primary" />}
              title="Services & Add-Ons"
              description="Organize services by category with flexible pricing. Attach add-ons to appointments for upselling with inline batch editing."
            />
            <FeatureCard
              icon={<UserCircle className="w-6 h-6 text-primary" />}
              title="Staff Management"
              description="Staff profiles with role assignments, calendar colors, weekly availability rules, and service-level permissions."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6 text-primary" />}
              title="Client Records"
              description="Full client profiles with appointment history, contact details, and notes. On-screen keyboard for quick client lookup at the desk."
            />
            <FeatureCard
              icon={<DollarSign className="w-6 h-6 text-primary" />}
              title="POS Checkout"
              description="Full-featured point-of-sale with split tender support, tip presets, discount management, and tax calculation built right into the calendar."
            />
            <FeatureCard
              icon={<Banknote className="w-6 h-6 text-primary" />}
              title="Cash Drawer & Z Report"
              description="Open and close cash drawer sessions, track cash in/out actions, denomination counting, and end-of-day Z report reconciliation."
            />
            <FeatureCard
              icon={<Receipt className="w-6 h-6 text-primary" />}
              title="Thermal Receipt Printing"
              description="Generate and print 80mm thermal receipts directly from checkout with transaction details, itemized totals, and payment breakdown."
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6 text-primary" />}
              title="Commission Tracking"
              description="Per-staff commission rates with detailed payout reports. Filter by date range and track service revenue vs. commission earned."
            />
            <FeatureCard
              icon={<ShoppingBag className="w-6 h-6 text-primary" />}
              title="Product Inventory"
              description="Track retail products with stock levels, pricing, and categories. Inline editing for quick batch updates across your catalog."
            />
            <FeatureCard
              icon={<Clock className="w-6 h-6 text-primary" />}
              title="Appointment Workflows"
              description="Status-based booking lifecycle: pending, confirmed, started, completed, cancelled, and no-show with cancellation reasons."
            />
            <FeatureCard
              icon={<Building2 className="w-6 h-6 text-primary" />}
              title="Multi-Store Support"
              description="Manage multiple locations with independent business hours, timezone settings, and store-scoped data across all features."
            />
            <FeatureCard
              icon={<Puzzle className="w-6 h-6 text-primary" />}
              title="Business-Type Onboarding"
              description="Choose your business type on signup and get auto-created services, categories, and add-ons tailored to your salon type."
            />
          </div>
        </div>
      </div>

      <div className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-display font-bold mb-6">Ready to transform your salon?</h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            Join thousands of beauty professionals who trust Zolmi Clone to manage their business, from scheduling to checkout.
          </p>
          <Link href="/auth">
            <Button size="lg" className="rounded-full" data-testid="link-cta-bottom">
              Get Started Free
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

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="hover-elevate transition-shadow">
      <CardContent className="p-6">
        <div className="mb-4 p-2.5 bg-primary/10 rounded-lg w-fit">{icon}</div>
        <h3 className="text-lg font-bold mb-2 font-display">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

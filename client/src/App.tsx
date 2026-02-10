import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreProvider } from "@/components/StoreProvider";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Services from "@/pages/Services";
import Staff from "@/pages/Staff";
import Customers from "@/pages/Customers";
import Calendar from "@/pages/Calendar";
import Products from "@/pages/Products";
import NewBooking from "@/pages/NewBooking";
import ClientLookup from "@/pages/ClientLookup";
import POSInterface from "@/pages/POSInterface";
import ClientProfile from "@/pages/ClientProfile";
import StaffDetail from "@/pages/StaffDetail";
import CalendarSettingsPage from "@/pages/CalendarSettings";
import BusinessSettings from "@/pages/BusinessSettings";
import CashDrawer from "@/pages/CashDrawer";
import AddonsPage from "@/pages/Addons";
import CommissionReport from "@/pages/CommissionReport";
import OnlineBooking from "@/pages/OnlineBooking";
import SmsSettings from "@/pages/SmsSettings";
import Auth from "@/pages/Auth";
import Onboarding from "@/pages/Onboarding";
import PublicBooking from "@/pages/PublicBooking";
import Pricing from "@/pages/Pricing";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/book/:slug" component={PublicBooking} />
      <Route path="/auth" component={Auth} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/services" component={Services} />
      <Route path="/staff" component={Staff} />
      <Route path="/staff/:id" component={StaffDetail} />
      <Route path="/customers" component={Customers} />
      <Route path="/calendar" component={Calendar} />
      <Route path="/appointments" component={Calendar} />
      <Route path="/booking/new" component={NewBooking} />
      <Route path="/client-lookup" component={ClientLookup} />
      <Route path="/pos" component={POSInterface} />
      <Route path="/client/:id" component={ClientProfile} />
      <Route path="/products" component={Products} />
      <Route path="/addons" component={AddonsPage} />
      <Route path="/commission-report" component={CommissionReport} />
      <Route path="/calendar-settings" component={CalendarSettingsPage} />
      <Route path="/business-settings" component={BusinessSettings} />
      <Route path="/online-booking" component={OnlineBooking} />
      <Route path="/sms-settings" component={SmsSettings} />
      <Route path="/cash-drawer" component={CashDrawer} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <StoreProvider>
          <Toaster />
          <Router />
        </StoreProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;


import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreProvider } from "@/components/StoreProvider";
import { useTheme } from "@/hooks/use-theme";
import SubdomainRouter from "@/pages/SubdomainRouter";
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
import Analytics from "@/pages/Analytics";
import Waitlist from "@/pages/Waitlist";
import GiftCards from "@/pages/GiftCards";
import IntakeForms from "@/pages/IntakeForms";
import Loyalty from "@/pages/Loyalty";
import OnlineBooking from "@/pages/OnlineBooking";
import SmsSettings from "@/pages/SmsSettings";
import MailSettings from "@/pages/MailSettings";
import { AdminDashboard } from "@/pages/Admin/AdminDashboard";
import Auth from "@/pages/Auth";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import StaffAuth from "@/pages/StaffAuth";
import StaffPasswordChange from "@/pages/StaffPasswordChange";
import StaffDashboard from "@/pages/StaffDashboard";
import Onboarding from "@/pages/Onboarding";
import PublicBooking from "@/pages/PublicBooking";
import BookingWidgetPage from "@/pages/BookingWidgetPage";
import BookingConfirmation from "@/pages/public-booking/BookingConfirmation";
import Pricing from "@/pages/Pricing";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import StaffCalendar from "@/pages/StaffCalendar";
import NotFound from "@/pages/not-found";
import BarberLanding from "@/pages/BarberLanding";
import SpaLanding from "@/pages/SpaLanding";
import NailSalonLanding from "@/pages/NailSalonLanding";
import TattooLanding from "@/pages/TattooLanding";
import WalkInLanding from "@/pages/WalkInLanding";
import HairSalonLanding from "@/pages/HairSalonLanding";
import PetGroomerLanding from "@/pages/PetGroomerLanding";
import EstheticianLanding from "@/pages/EstheticianLanding";
import HouseCleaningLanding from "@/pages/HouseCleaningLanding";
import HandymanLanding from "@/pages/HandymanLanding";
import RideServiceLanding from "@/pages/RideServiceLanding";
import SnowRemovalLanding from "@/pages/SnowRemovalLanding";
import LawnCareLanding from "@/pages/LawnCareLanding";
import TutoringLanding from "@/pages/TutoringLanding";
import DogWalkingLanding from "@/pages/DogWalkingLanding";

// List of authenticated routes that require StoreProvider
const authenticatedPaths = [
  "/onboarding",
  "/dashboard",
  "/analytics",
  "/services",
  "/staff",
  "/customers",
  "/waitlist",
  "/loyalty",
  "/calendar",
  "/appointments",
  "/booking",
  "/client-lookup",
  "/pos",
  "/client",
  "/products",
  "/addons",
  "/gift-cards",
  "/intake-forms",
  "/commission-report",
  "/calendar-settings",
  "/business-settings",
  "/online-booking",
  "/sms-settings",
  "/mail-settings",
  "/admin",
  "/cash-drawer",
];

function App() {
  useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function AppRoutes() {
  const location = useLocation();
  const isPublicConfirmation = location.pathname.startsWith("/booking/") && !location.pathname.startsWith("/booking/new");

  const isAuthenticatedRoute = authenticatedPaths.some(path =>
    location.pathname === path || location.pathname.startsWith(path + "/")
  ) && !isPublicConfirmation;

  const routes = (
    <Routes>
      <Route path="/" element={<SubdomainRouter />} />
      <Route path="/barbers" element={<BarberLanding />} />
      <Route path="/spa" element={<SpaLanding />} />
      <Route path="/nails" element={<NailSalonLanding />} />
      <Route path="/tattoo" element={<TattooLanding />} />
      <Route path="/haircuts" element={<WalkInLanding />} />
      <Route path="/hair-salons" element={<HairSalonLanding />} />
      <Route path="/groomers" element={<PetGroomerLanding />} />
      <Route path="/estheticians" element={<EstheticianLanding />} />
      <Route path="/house-cleaning" element={<HouseCleaningLanding />} />
      <Route path="/handyman" element={<HandymanLanding />} />
      <Route path="/ride-service" element={<RideServiceLanding />} />
      <Route path="/snow-removal" element={<SnowRemovalLanding />} />
      <Route path="/lawn-care" element={<LawnCareLanding />} />
      <Route path="/tutoring" element={<TutoringLanding />} />
      <Route path="/dog-walking" element={<DogWalkingLanding />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/widget" element={<BookingWidgetPage />} />
      <Route path="/book/:slug" element={<PublicBooking />} />
      <Route path="/booking/:confirmationNumber" element={<BookingConfirmation />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/staff-auth" element={<StaffAuth />} />
      <Route path="/staff-change-password" element={<StaffPasswordChange />} />
      <Route path="/staff-dashboard" element={<StaffDashboard />} />
      <Route path="/staff-calendar" element={<StaffCalendar />} />
      <Route path="/isadmin/*" element={<AdminDashboard />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/services" element={<Services />} />
      <Route path="/staff" element={<Staff />} />
      <Route path="/staff/:id" element={<StaffDetail />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/calendar" element={<Calendar />} />
      <Route path="/appointments" element={<Calendar />} />
      <Route path="/booking/new" element={<NewBooking />} />
      <Route path="/client-lookup" element={<ClientLookup />} />
      <Route path="/pos" element={<POSInterface />} />
      <Route path="/client/:id" element={<ClientProfile />} />
      <Route path="/products" element={<Products />} />
      <Route path="/addons" element={<AddonsPage />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/waitlist" element={<Waitlist />} />
      <Route path="/gift-cards" element={<GiftCards />} />
      <Route path="/intake-forms" element={<IntakeForms />} />
      <Route path="/loyalty" element={<Loyalty />} />
      <Route path="/commission-report" element={<CommissionReport />} />
      <Route path="/calendar-settings" element={<CalendarSettingsPage />} />
      <Route path="/business-settings" element={<BusinessSettings />} />
      <Route path="/online-booking" element={<OnlineBooking />} />
      <Route path="/sms-settings" element={<SmsSettings />} />
      <Route path="/mail-settings" element={<MailSettings />} />
      <Route path="/cash-drawer" element={<CashDrawer />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );

  if (isAuthenticatedRoute) {
    return <StoreProvider>{routes}</StoreProvider>;
  }

  return routes;
}

export default App;

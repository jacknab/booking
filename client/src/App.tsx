
import { Routes, Route, useLocation } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreProvider } from "@/components/StoreProvider";
import { useTheme } from "@/hooks/use-theme";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { TrainingProvider } from "@/contexts/TrainingContext";
import { HelpBubble } from "@/components/training/HelpBubble";
import { GraduationNotifier } from "@/components/training/GraduationNotifier";
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
import Reports from "@/pages/Reports";
import IndustriesHub from "@/pages/IndustriesHub";
import Waitlist from "@/pages/Waitlist";
import QueueDashboard from "@/pages/queue/QueueDashboard";
import QueueSettings from "@/pages/queue/QueueSettings";
import PublicCheckIn from "@/pages/queue/PublicCheckIn";
import QueueDisplay from "@/pages/queue/QueueDisplay";
import GiftCards from "@/pages/GiftCards";
import IntakeForms from "@/pages/IntakeForms";
import Loyalty from "@/pages/Loyalty";
import Reviews from "@/pages/Reviews";
import GoogleBusiness from "@/pages/GoogleBusiness";
import ReviewSubmit from "@/pages/ReviewSubmit";
import OnlineBooking from "@/pages/OnlineBooking";
import SmsSettings from "@/pages/SmsSettings";
import MailSettings from "@/pages/MailSettings";
import { AdminDashboard } from "@/pages/Admin/AdminDashboard";
import SeoRegionsAdmin from "@/pages/admin/SeoRegionsAdmin";
import AccountsAdmin from "@/pages/admin/AccountsAdmin";
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
import TermsOfService from "@/pages/TermsOfService";
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
import HVACLanding from "@/pages/HVACLanding";
import PlumbingLanding from "@/pages/PlumbingLanding";
import ElectricalLanding from "@/pages/ElectricalLanding";
import CarpetCleaningLanding from "@/pages/CarpetCleaningLanding";
import PressureWashingLanding from "@/pages/PressureWashingLanding";
import WindowCleaningLanding from "@/pages/WindowCleaningLanding";
import ProHub from "@/pages/pro/ProHub";
import ProIndustryPage from "@/pages/pro/ProIndustryPage";
import QueueLanding from "@/pages/QueueLanding";
import Landing from "@/pages/Landing";
import GetStarted from "@/pages/GetStarted";
import ProDashboardLayout from "@/pages/pro-dashboard/ProDashboardLayout";
import DispatchDashboard from "@/pages/pro-dashboard/DispatchDashboard";
import JobsBoard from "@/pages/pro-dashboard/JobsBoard";
import JobDetail from "@/pages/pro-dashboard/JobDetail";
import NewJob from "@/pages/pro-dashboard/NewJob";
import EstimatesPage from "@/pages/pro-dashboard/EstimatesPage";
import CustomersPage from "@/pages/pro-dashboard/CustomersPage";
import CrewsPage from "@/pages/pro-dashboard/CrewsPage";
import InvoicesPage from "@/pages/pro-dashboard/InvoicesPage";
import ReportsPage from "@/pages/pro-dashboard/ReportsPage";
import SettingsPage from "@/pages/pro-dashboard/SettingsPage";
import GoogleReviewsPage from "@/pages/pro-dashboard/GoogleReviewsPage";
import SchedulePage from "@/pages/pro-dashboard/SchedulePage";
import MapPage from "@/pages/pro-dashboard/MapPage";
import ProFeaturesSetup from "@/pages/ProFeaturesSetup";
import SeoManager from "@/components/SeoManager";
import TeamPermissions from "@/pages/TeamPermissions";
import TrainingAdmin from "@/pages/TrainingAdmin";
import { RequirePermission } from "@/components/RequirePermission";
import { PERMISSIONS } from "@shared/permissions";

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
  "/reviews",
  "/google-business",
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
  "/reports",
  "/commission-report",
  "/calendar-settings",
  "/business-settings",
  "/team-permissions",
  "/dashboard/training",
  "/online-booking",
  "/sms-settings",
  "/mail-settings",
  "/admin",
  "/cash-drawer",
  "/pro-dashboard",
  "/pro-setup",
  "/dashboard/queue",
];

function App() {
  useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <ErrorBoundary>
          <TrainingProvider>
            <AppRoutes />
            <HelpBubble />
            <GraduationNotifier />
          </TrainingProvider>
        </ErrorBoundary>
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
    <>
    <SeoManager />
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
      <Route path="/industries" element={<IndustriesHub />} />
      <Route path="/house-cleaning" element={<HouseCleaningLanding />} />
      <Route path="/handyman" element={<HandymanLanding />} />
      <Route path="/ride-service" element={<RideServiceLanding />} />
      <Route path="/snow-removal" element={<SnowRemovalLanding />} />
      <Route path="/lawn-care" element={<LawnCareLanding />} />
      <Route path="/tutoring" element={<TutoringLanding />} />
      <Route path="/dog-walking" element={<DogWalkingLanding />} />
      <Route path="/hvac" element={<HVACLanding />} />
      <Route path="/plumbing" element={<PlumbingLanding />} />
      <Route path="/electrical" element={<ElectricalLanding />} />
      <Route path="/carpet-cleaning" element={<CarpetCleaningLanding />} />
      <Route path="/pressure-washing" element={<PressureWashingLanding />} />
      <Route path="/window-cleaning" element={<WindowCleaningLanding />} />
      <Route path="/pro" element={<ProHub />} />
      <Route path="/pro/:industry" element={<ProIndustryPage />} />
      <Route path="/queue" element={<QueueLanding />} />
      <Route path="/booking" element={<Landing />} />
      <Route path="/get-started" element={<GetStarted />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/widget" element={<BookingWidgetPage />} />
      <Route path="/book/:slug" element={<PublicBooking />} />
      <Route path="/booking/:confirmationNumber" element={<BookingConfirmation />} />
      <Route path="/review/:appointmentId" element={<ReviewSubmit />} />
      <Route path="/q/:slug" element={<PublicCheckIn />} />
      <Route path="/q/:slug/display" element={<QueueDisplay />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/staff-auth" element={<StaffAuth />} />
      <Route path="/staff-change-password" element={<StaffPasswordChange />} />
      <Route path="/staff-dashboard" element={<StaffDashboard />} />
      <Route path="/staff-calendar" element={<StaffCalendar />} />
      <Route path="/isadmin/*" element={<AdminDashboard />} />
      <Route path="/admin/seo-regions" element={<SeoRegionsAdmin />} />
      <Route path="/admin/accounts" element={<AccountsAdmin />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/pro-setup" element={<ProFeaturesSetup />} />
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
      <Route path="/dashboard/training" element={<TrainingAdmin />} />
      <Route path="/dashboard/queue" element={<QueueDashboard />} />
      <Route path="/dashboard/queue/settings" element={<QueueSettings />} />
      <Route path="/gift-cards" element={<GiftCards />} />
      <Route path="/intake-forms" element={<IntakeForms />} />
      <Route path="/loyalty" element={<Loyalty />} />
      <Route path="/reviews" element={<Reviews />} />
      <Route path="/google-business" element={<GoogleBusiness />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/commission-report" element={<CommissionReport />} />
      <Route path="/calendar-settings" element={<CalendarSettingsPage />} />
      <Route path="/business-settings" element={<BusinessSettings />} />
      <Route
        path="/team-permissions"
        element={
          <RequirePermission permission={PERMISSIONS.STAFF_MANAGE}>
            <TeamPermissions />
          </RequirePermission>
        }
      />
      <Route path="/online-booking" element={<OnlineBooking />} />
      <Route path="/sms-settings" element={<SmsSettings />} />
      <Route path="/mail-settings" element={<MailSettings />} />
      <Route path="/cash-drawer" element={<CashDrawer />} />

      {/* Certxa Pro Dashboard */}
      <Route path="/pro-dashboard" element={<ProDashboardLayout><DispatchDashboard /></ProDashboardLayout>} />
      <Route path="/pro-dashboard/schedule" element={<ProDashboardLayout><SchedulePage /></ProDashboardLayout>} />
      <Route path="/pro-dashboard/jobs" element={<ProDashboardLayout><JobsBoard /></ProDashboardLayout>} />
      <Route path="/pro-dashboard/jobs/new" element={<ProDashboardLayout><NewJob /></ProDashboardLayout>} />
      <Route path="/pro-dashboard/jobs/:id" element={<ProDashboardLayout><JobDetail /></ProDashboardLayout>} />
      <Route path="/pro-dashboard/estimates" element={<ProDashboardLayout><EstimatesPage /></ProDashboardLayout>} />
      <Route path="/pro-dashboard/customers" element={<ProDashboardLayout><CustomersPage /></ProDashboardLayout>} />
      <Route path="/pro-dashboard/invoices" element={<ProDashboardLayout><InvoicesPage /></ProDashboardLayout>} />
      <Route path="/pro-dashboard/crews" element={<ProDashboardLayout><CrewsPage /></ProDashboardLayout>} />
      <Route path="/pro-dashboard/map" element={<ProDashboardLayout><MapPage /></ProDashboardLayout>} />
      <Route path="/pro-dashboard/reports" element={<ProDashboardLayout><ReportsPage /></ProDashboardLayout>} />
      <Route path="/pro-dashboard/settings" element={<ProDashboardLayout><SettingsPage /></ProDashboardLayout>} />
      <Route path="/pro-dashboard/google-reviews" element={<ProDashboardLayout><GoogleReviewsPage /></ProDashboardLayout>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
    </>
  );

  if (isAuthenticatedRoute) {
    return <StoreProvider>{routes}</StoreProvider>;
  }

  return routes;
}

export default App;

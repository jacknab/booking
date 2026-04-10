import { useContext } from "react";
import { StoreContext } from "@/hooks/use-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoogleBusinessProfileSetup } from "@/components/GoogleBusinessProfileSetup";
import { GoogleReviewsManager } from "@/components/GoogleReviewsManager";
import { Building2, Star } from "lucide-react";

export default function GoogleReviewsPage() {
  const ctx = useContext(StoreContext);
  const store = ctx?.selectedStore;
  const storeId = store?.id ?? null;

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-white">Google Business Profile</h1>
        <p className="text-white/40 text-xs mt-0.5">
          Connect your Google Business Profile to manage and respond to customer reviews
        </p>
      </div>

      {!storeId ? (
        <div className="bg-amber-900/20 border border-amber-700/40 rounded-2xl p-5 text-amber-300 text-sm">
          No store found. Complete onboarding to connect your Google Business Profile.
        </div>
      ) : (
        <Tabs defaultValue="setup">
          <TabsList className="mb-6 bg-white/5 border border-white/10">
            <TabsTrigger value="setup" className="gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50">
              <Building2 size={14} />
              Connection
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50">
              <Star size={14} />
              Reviews
            </TabsTrigger>
          </TabsList>

          <TabsContent value="setup">
            <GoogleBusinessProfileSetup storeId={storeId} />
          </TabsContent>

          <TabsContent value="reviews">
            <GoogleReviewsManager storeId={storeId} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

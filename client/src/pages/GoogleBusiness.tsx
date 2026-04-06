import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoogleBusinessProfileSetup } from "@/components/GoogleBusinessProfileSetup";
import { GoogleReviewsManager } from "@/components/GoogleReviewsManager";
import { useSelectedStore } from "@/hooks/use-store";
import { Building2, Star } from "lucide-react";

export default function GoogleBusiness() {
  const { selectedStore } = useSelectedStore();
  const storeId = selectedStore?.id ?? null;

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Google Business Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Connect your Google Business Profile to manage and respond to customer reviews
          </p>
        </div>

        <Tabs defaultValue="setup">
          <TabsList className="mb-4">
            <TabsTrigger value="setup" className="gap-2">
              <Building2 size={15} />
              Connection
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-2">
              <Star size={15} />
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
      </div>
    </AppLayout>
  );
}

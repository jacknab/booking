import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useServices, useCreateService, useDeleteService } from "@/hooks/use-services";
import { Plus, Trash2, Clock, DollarSign } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertServiceSchema } from "@shared/schema";
import { z } from "zod";

type ServiceFormValues = z.infer<typeof insertServiceSchema>;

export default function Services() {
  const { data: services, isLoading } = useServices();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Services</h1>
          <p className="text-muted-foreground">Manage your service menu and pricing.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Service</DialogTitle>
            </DialogHeader>
            <CreateServiceForm onSuccess={() => setIsCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services?.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
          {services?.length === 0 && (
            <div className="col-span-full text-center py-12 bg-card rounded-2xl border border-dashed">
              <p className="text-muted-foreground">No services added yet.</p>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}

function ServiceCard({ service }: { service: any }) {
  const { mutate: deleteService } = useDeleteService();

  return (
    <Card className="hover:shadow-md transition-shadow group">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 rounded-lg bg-secondary text-primary">
            <Clock className="w-5 h-5" />
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => {
              if (confirm('Are you sure you want to delete this service?')) {
                deleteService(service.id);
              }
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        <h3 className="font-bold text-lg mb-1">{service.name}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{service.description || "No description provided."}</p>
        
        <div className="flex items-center gap-4 text-sm font-medium pt-4 border-t">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>{service.duration} min</span>
          </div>
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span>${Number(service.price).toFixed(2)}</span>
          </div>
          <span className="ml-auto text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground capitalize">
            {service.category}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateServiceForm({ onSuccess }: { onSuccess: () => void }) {
  const { mutate, isPending } = useCreateService();
  
  // Extend schema to handle string inputs for numbers (form behavior)
  const formSchema = insertServiceSchema.extend({
    duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
    price: z.coerce.number().min(0, "Price must be positive"),
  });

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // Format price as string for decimal type in DB if needed, 
    // but schema expects number or string that can parse to decimal
    mutate(data as any, {
      onSuccess: () => onSuccess(),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Service Name</Label>
        <Input id="name" {...register("name")} placeholder="e.g. Women's Haircut" />
        {errors.name && <span className="text-xs text-destructive">{errors.name.message}</span>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select onValueChange={(val) => register("category").onChange({ target: { value: val, name: "category" } })}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Hair">Hair</SelectItem>
            <SelectItem value="Nails">Nails</SelectItem>
            <SelectItem value="Face">Face</SelectItem>
            <SelectItem value="Massage">Massage</SelectItem>
          </SelectContent>
        </Select>
        {errors.category && <span className="text-xs text-destructive">{errors.category.message}</span>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (min)</Label>
          <Input id="duration" type="number" {...register("duration")} placeholder="60" />
          {errors.duration && <span className="text-xs text-destructive">{errors.duration.message}</span>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price ($)</Label>
          <Input id="price" type="number" step="0.01" {...register("price")} placeholder="80.00" />
          {errors.price && <span className="text-xs text-destructive">{errors.price.message}</span>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" {...register("description")} placeholder="Brief description..." />
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90">
          {isPending ? "Creating..." : "Create Service"}
        </Button>
      </div>
    </form>
  );
}

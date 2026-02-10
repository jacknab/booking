import { useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStaffList, useCreateStaff } from "@/hooks/use-staff";
import { Plus, Mail, Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStaffSchema } from "@shared/schema";
import type { Staff } from "@shared/schema";
import { z } from "zod";

export default function StaffPage() {
  const { data: staffList, isLoading } = useStaffList();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <AppLayout>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Staff Members</h1>
          <p className="text-muted-foreground">Manage your team and their roles.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-staff">
              <Plus className="w-4 h-4 mr-2" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
            </DialogHeader>
            <CreateStaffForm onSuccess={() => setIsCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffList?.map((staff: Staff) => (
            <StaffCard key={staff.id} staff={staff} />
          ))}
          {staffList?.length === 0 && (
            <div className="col-span-full text-center py-12 bg-card rounded-md border border-dashed">
              <p className="text-muted-foreground">No staff members added yet.</p>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}

function StaffCard({ staff }: { staff: Staff }) {
  const [, navigate] = useLocation();

  return (
    <Card
      className="cursor-pointer hover-elevate group overflow-visible"
      onClick={() => navigate(`/staff/${staff.id}`)}
      data-testid={`card-staff-${staff.id}`}
    >
      <div className="h-24 bg-gradient-to-r from-primary/20 to-secondary/50 rounded-t-md" />
      <CardContent className="p-6 relative pt-0">
        <div className="flex justify-between items-start">
          <div className="-mt-10 mb-4 p-1 bg-card rounded-md inline-block">
            <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center text-2xl font-bold text-muted-foreground uppercase">
              {staff.avatarUrl ? (
                <img src={staff.avatarUrl} alt={staff.name} className="w-full h-full object-cover rounded-md" />
              ) : (
                staff.name.slice(0, 2)
              )}
            </div>
          </div>
        </div>
        
        <h3 className="font-bold text-lg mb-0.5" data-testid={`text-staff-name-${staff.id}`}>{staff.name}</h3>
        <p className="text-primary text-sm font-medium mb-4 capitalize">{staff.role}</p>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          {staff.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>{staff.email}</span>
            </div>
          )}
          {staff.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>{staff.phone}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CreateStaffForm({ onSuccess }: { onSuccess: () => void }) {
  const { mutate, isPending } = useCreateStaff();
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof insertStaffSchema>>({
    resolver: zodResolver(insertStaffSchema),
  });

  return (
    <form onSubmit={handleSubmit((data) => mutate(data, { onSuccess }))} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" {...register("name")} placeholder="e.g. Sarah Smith" data-testid="input-new-staff-name" />
        {errors.name && <span className="text-xs text-destructive">{errors.name.message}</span>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} placeholder="sarah@example.com" data-testid="input-new-staff-email" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" {...register("phone")} placeholder="(555) 123-4567" data-testid="input-new-staff-phone" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Input id="role" {...register("role")} placeholder="stylist" defaultValue="stylist" data-testid="input-new-staff-role" />
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isPending} data-testid="button-submit-new-staff">
          {isPending ? "Adding..." : "Add Staff Member"}
        </Button>
      </div>
    </form>
  );
}

import { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStaffList, useCreateStaff } from "@/hooks/use-staff";
import { Plus, Mail, Phone, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStaffSchema } from "@shared/schema";
import type { Staff } from "@shared/schema";
import { z } from "zod";

export default function StaffPage() {
  const { data: staffList, isLoading } = useStaffList();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStaff = staffList?.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Staff</h1>
          <p className="text-muted-foreground">View and manage your team members.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
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

      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search staff..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Loading...</td></tr>
              ) : filteredStaff?.length === 0 ? (
                <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No staff found.</td></tr>
              ) : (
                filteredStaff?.map((staff) => (
                  <tr key={staff.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {staff.avatarUrl ? (
                            <img src={staff.avatarUrl} alt={staff.name} className="w-8 h-8 object-cover rounded-full" />
                          ) : (
                            staff.name.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <Link to={`/staff/${staff.id}`} className="text-black font-normal underline-offset-4 hover:underline cursor-pointer" data-testid={`link-staff-profile-${staff.id}`}>{staff.name}</Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{staff.email || "-"}</td>
                    <td className="px-6 py-4 text-muted-foreground">{staff.phone || "-"}</td>
                    <td className="px-6 py-4 text-muted-foreground">{staff.role || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}

function StaffCard({ staff }: { staff: Staff }) {
  const navigate = useNavigate();

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

import { Camera } from "lucide-react";

function CreateStaffForm({ onSuccess }: { onSuccess: () => void }) {
  const { mutate, isPending } = useCreateStaff();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<z.infer<typeof insertStaffSchema>>({
    resolver: zodResolver(insertStaffSchema),
  });
  const avatarUrl = watch("avatarUrl");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setValue("avatarUrl", reader.result as string);
    };
    reader.onerror = () => {
      // Optionally show a toast error
    };
    reader.readAsDataURL(file);
  };

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
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register("password")} placeholder="******" data-testid="input-new-staff-password" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" {...register("phone")} placeholder="(555) 123-4567" data-testid="input-new-staff-phone" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Input id="role" {...register("role")} placeholder="stylist" defaultValue="stylist" data-testid="input-new-staff-role" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="avatarUrl">Avatar</Label>
        <div className="flex gap-4 items-center">
          <div className="relative shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Preview" className="w-16 h-16 rounded object-cover border" />
            ) : (
              <div className="w-16 h-16 rounded border bg-muted flex items-center justify-center">
                <Camera className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="staff-avatar-upload"
              onChange={handleFileChange}
            />
            <label
              htmlFor="staff-avatar-upload"
              className="absolute inset-0 cursor-pointer"
              title="Upload Avatar"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isPending} data-testid="button-submit-new-staff">
          {isPending ? "Adding..." : "Add Staff Member"}
        </Button>
      </div>
    </form>
  );
}

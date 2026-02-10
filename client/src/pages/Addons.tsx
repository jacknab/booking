import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAddons, useCreateAddon, useUpdateAddon, useDeleteAddon } from "@/hooks/use-addons";
import { Plus, Pencil, Search, Save, X, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAddonSchema } from "@shared/schema";
import type { Addon } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

export default function AddonsPage() {
  const { data: addons, isLoading } = useAddons();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editedRows, setEditedRows] = useState<Record<number, Partial<Addon>>>({});
  const { mutate: updateAddon } = useUpdateAddon();
  const { mutate: deleteAddon } = useDeleteAddon();
  const { toast } = useToast();

  const filtered = (addons || []).filter((a: Addon) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFieldChange = (id: number, field: string, value: string | number) => {
    setEditedRows(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const saveAllChanges = () => {
    const entries = Object.entries(editedRows);
    if (entries.length === 0) {
      setEditMode(false);
      return;
    }

    let completed = 0;
    entries.forEach(([idStr, changes]) => {
      const id = Number(idStr);
      updateAddon({ id, ...changes } as any, {
        onSuccess: () => {
          completed++;
          if (completed === entries.length) {
            toast({ title: "All changes saved" });
            setEditedRows({});
            setEditMode(false);
          }
        },
        onError: () => {
          toast({ title: "Failed to save some changes", variant: "destructive" });
        },
      });
    });
  };

  const cancelEdit = () => {
    setEditedRows({});
    setEditMode(false);
  };

  const getFieldValue = (addon: Addon, field: keyof Addon) => {
    if (editedRows[addon.id] && field in editedRows[addon.id]!) {
      return (editedRows[addon.id] as any)[field];
    }
    return addon[field];
  };

  return (
    <AppLayout>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Add-Ons</h1>
          <p className="text-muted-foreground">Manage add-on services that can be attached to appointments.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search add-ons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[220px]"
              data-testid="input-search-addons"
            />
          </div>
          <Button
            variant={editMode ? "default" : "outline"}
            onClick={() => editMode ? saveAllChanges() : setEditMode(true)}
            data-testid="button-addon-edit-mode"
          >
            {editMode ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save All
              </>
            ) : (
              <>
                <Pencil className="w-4 h-4 mr-2" />
                Edit Mode
              </>
            )}
          </Button>
          {editMode && (
            <Button variant="ghost" onClick={cancelEdit} data-testid="button-addon-cancel-edit">
              <X className="w-4 h-4" />
            </Button>
          )}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-addon">
                <Plus className="w-4 h-4 mr-2" />
                Add Add-On
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Add-On</DialogTitle>
              </DialogHeader>
              <CreateAddonForm onSuccess={() => setIsCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading add-ons...</p>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="addons-table">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground w-[50px]">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground min-w-[200px]">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground min-w-[200px]">Description</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground w-[100px]">Duration</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground w-[100px]">Price</th>
                  {editMode && <th className="py-3 px-4 w-[60px]"></th>}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={editMode ? 6 : 5} className="py-12 text-center text-muted-foreground">
                      {searchQuery ? "No add-ons match your search." : "No add-ons added yet."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((addon: Addon) => (
                    <tr
                      key={addon.id}
                      className="border-b last:border-b-0 hover-elevate"
                      data-testid={`row-addon-${addon.id}`}
                    >
                      <td className="py-2 px-4 text-muted-foreground font-mono text-xs">{addon.id}</td>
                      <td className="py-2 px-4">
                        {editMode ? (
                          <Input
                            value={String(getFieldValue(addon, "name"))}
                            onChange={(e) => handleFieldChange(addon.id, "name", e.target.value)}
                            className="h-8"
                            data-testid={`input-addon-name-${addon.id}`}
                          />
                        ) : (
                          <span className="font-medium" data-testid={`text-addon-name-${addon.id}`}>{addon.name}</span>
                        )}
                      </td>
                      <td className="py-2 px-4">
                        {editMode ? (
                          <Input
                            value={String(getFieldValue(addon, "description") || "")}
                            onChange={(e) => handleFieldChange(addon.id, "description", e.target.value)}
                            className="h-8"
                            data-testid={`input-addon-desc-${addon.id}`}
                          />
                        ) : (
                          <span className="text-muted-foreground text-xs">{addon.description || "-"}</span>
                        )}
                      </td>
                      <td className="py-2 px-4">
                        {editMode ? (
                          <Input
                            type="number"
                            value={String(getFieldValue(addon, "duration"))}
                            onChange={(e) => handleFieldChange(addon.id, "duration", Number(e.target.value))}
                            className="h-8 w-20"
                            data-testid={`input-addon-duration-${addon.id}`}
                          />
                        ) : (
                          <span className="text-muted-foreground">{addon.duration} min</span>
                        )}
                      </td>
                      <td className="py-2 px-4 text-right">
                        {editMode ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={String(getFieldValue(addon, "price"))}
                            onChange={(e) => handleFieldChange(addon.id, "price", e.target.value)}
                            className="h-8 w-24 ml-auto"
                            data-testid={`input-addon-price-${addon.id}`}
                          />
                        ) : (
                          <span className="font-semibold text-primary">${Number(addon.price).toFixed(2)}</span>
                        )}
                      </td>
                      {editMode && (
                        <td className="py-2 px-4 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm("Delete this add-on?")) deleteAddon(addon.id);
                            }}
                            data-testid={`button-delete-addon-${addon.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-muted/30 border-t px-4 py-2 flex items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground">{filtered.length} records</span>
            {editMode && Object.keys(editedRows).length > 0 && (
              <span className="text-xs text-primary font-medium">{Object.keys(editedRows).length} modified</span>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function CreateAddonForm({ onSuccess }: { onSuccess: () => void }) {
  const { mutate, isPending } = useCreateAddon();

  const formSchema = insertAddonSchema.extend({
    duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
    price: z.coerce.number().min(0, "Price must be positive"),
  });

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    mutate(data as any, { onSuccess });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Add-On Name</Label>
        <Input id="name" {...register("name")} placeholder="e.g. Deep Conditioning" data-testid="input-new-addon-name" />
        {errors.name && <span className="text-xs text-destructive">{errors.name.message}</span>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (min)</Label>
          <Input id="duration" type="number" {...register("duration")} placeholder="15" data-testid="input-new-addon-duration" />
          {errors.duration && <span className="text-xs text-destructive">{errors.duration.message}</span>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price ($)</Label>
          <Input id="price" type="number" step="0.01" {...register("price")} placeholder="15.00" data-testid="input-new-addon-price" />
          {errors.price && <span className="text-xs text-destructive">{errors.price.message}</span>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" {...register("description")} placeholder="Brief description..." data-testid="input-new-addon-desc" />
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isPending} data-testid="button-submit-new-addon">
          {isPending ? "Creating..." : "Create Add-On"}
        </Button>
      </div>
    </form>
  );
}

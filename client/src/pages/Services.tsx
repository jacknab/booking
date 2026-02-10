import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useServices, useCreateService, useUpdateService, useDeleteService } from "@/hooks/use-services";
import { useServiceCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/use-addons";
import { useSelectedStore } from "@/hooks/use-store";
import { Plus, Pencil, Search, Save, X, Trash2, FolderOpen, ChevronDown, ChevronUp } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertServiceSchema } from "@shared/schema";
import type { Service } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

type ServiceFormValues = z.infer<typeof insertServiceSchema>;

export default function Services() {
  const { data: services, isLoading } = useServices();
  const { data: categories = [] } = useServiceCategories();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editedRows, setEditedRows] = useState<Record<number, Partial<Service>>>({});
  const [showCategories, setShowCategories] = useState(false);
  const { mutate: updateService, isPending: isUpdating } = useUpdateService();
  const { mutate: deleteService } = useDeleteService();
  const { toast } = useToast();

  const filtered = (services || []).filter((s: Service) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
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
      updateService({ id, ...changes } as any, {
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

  const getFieldValue = (service: Service, field: keyof Service) => {
    if (editedRows[service.id] && field in editedRows[service.id]!) {
      return (editedRows[service.id] as any)[field];
    }
    return service[field];
  };

  return (
    <AppLayout>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Services</h1>
          <p className="text-muted-foreground">Manage your service menu and pricing.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[220px]"
              data-testid="input-search-services"
            />
          </div>
          <Button
            variant={editMode ? "default" : "outline"}
            onClick={() => editMode ? saveAllChanges() : setEditMode(true)}
            data-testid="button-edit-mode"
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
            <Button variant="ghost" onClick={cancelEdit} data-testid="button-cancel-edit">
              <X className="w-4 h-4" />
            </Button>
          )}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-service">
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Service</DialogTitle>
              </DialogHeader>
              <CreateServiceForm onSuccess={() => setIsCreateOpen(false)} categories={categories} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowCategories(!showCategories)}
          className="text-muted-foreground"
          data-testid="button-toggle-categories"
        >
          <FolderOpen className="w-4 h-4 mr-2" />
          Manage Categories ({categories.length})
          {showCategories ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
        </Button>
        {showCategories && <CategoryManager categories={categories} />}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading services...</p>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="services-table">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground w-[50px]">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground min-w-[200px]">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground min-w-[140px]">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground w-[100px]">Duration</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground w-[100px]">Price</th>
                  {editMode && <th className="py-3 px-4 w-[60px]"></th>}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={editMode ? 6 : 5} className="py-12 text-center text-muted-foreground">
                      {searchQuery ? "No services match your search." : "No services added yet."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((service: Service) => (
                    <tr
                      key={service.id}
                      className="border-b last:border-b-0 hover-elevate"
                      data-testid={`row-service-${service.id}`}
                    >
                      <td className="py-2 px-4 text-muted-foreground font-mono text-xs">{service.id}</td>
                      <td className="py-2 px-4">
                        {editMode ? (
                          <Input
                            value={String(getFieldValue(service, "name"))}
                            onChange={(e) => handleFieldChange(service.id, "name", e.target.value)}
                            className="h-8"
                            data-testid={`input-service-name-${service.id}`}
                          />
                        ) : (
                          <span className="font-medium" data-testid={`text-service-name-${service.id}`}>{service.name}</span>
                        )}
                      </td>
                      <td className="py-2 px-4">
                        {editMode ? (
                          <Input
                            value={String(getFieldValue(service, "category"))}
                            onChange={(e) => handleFieldChange(service.id, "category", e.target.value)}
                            className="h-8"
                            data-testid={`input-service-category-${service.id}`}
                          />
                        ) : (
                          <Badge variant="secondary" className="no-default-active-elevate capitalize" data-testid={`badge-service-category-${service.id}`}>
                            {service.category}
                          </Badge>
                        )}
                      </td>
                      <td className="py-2 px-4">
                        {editMode ? (
                          <Input
                            type="number"
                            value={String(getFieldValue(service, "duration"))}
                            onChange={(e) => handleFieldChange(service.id, "duration", Number(e.target.value))}
                            className="h-8 w-20"
                            data-testid={`input-service-duration-${service.id}`}
                          />
                        ) : (
                          <span className="text-muted-foreground" data-testid={`text-service-duration-${service.id}`}>{service.duration} min</span>
                        )}
                      </td>
                      <td className="py-2 px-4 text-right">
                        {editMode ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={String(getFieldValue(service, "price"))}
                            onChange={(e) => handleFieldChange(service.id, "price", e.target.value)}
                            className="h-8 w-24 ml-auto"
                            data-testid={`input-service-price-${service.id}`}
                          />
                        ) : (
                          <span className="font-semibold text-primary" data-testid={`text-service-price-${service.id}`}>
                            ${Number(service.price).toFixed(2)}
                          </span>
                        )}
                      </td>
                      {editMode && (
                        <td className="py-2 px-4 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm("Delete this service?")) deleteService(service.id);
                            }}
                            data-testid={`button-delete-service-${service.id}`}
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

function CategoryManager({ categories }: { categories: any[] }) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutate: updateCategory } = useUpdateCategory();
  const { mutate: deleteCategory } = useDeleteCategory();
  const { selectedStore } = useSelectedStore();
  const { toast } = useToast();

  const startEdit = (cat: any) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const saveEdit = () => {
    if (!editingId || !editName.trim()) return;
    updateCategory({ id: editingId, name: editName.trim() }, {
      onSuccess: () => {
        toast({ title: "Category updated" });
        setEditingId(null);
        setEditName("");
      },
      onError: () => toast({ title: "Failed to update", variant: "destructive" }),
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this category? Services in this category will keep their current category text.")) {
      deleteCategory(id, {
        onSuccess: () => toast({ title: "Category deleted" }),
        onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
      });
    }
  };

  const handleCreate = () => {
    if (!newCategoryName.trim()) return;
    createCategory({ name: newCategoryName.trim() }, {
      onSuccess: () => {
        toast({ title: "Category created" });
        setNewCategoryName("");
      },
      onError: () => toast({ title: "Failed to create", variant: "destructive" }),
    });
  };

  return (
    <div className="mt-3 border rounded-md p-4 space-y-3" data-testid="category-manager">
      <div className="flex items-center gap-2">
        <Input
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="New category name..."
          className="max-w-[240px]"
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          data-testid="input-new-category"
        />
        <Button
          size="sm"
          onClick={handleCreate}
          disabled={isCreating || !newCategoryName.trim() || !selectedStore}
          data-testid="button-create-category"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>
      {categories.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">No categories yet. Add one above.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {categories.map((cat: any) => (
            <div key={cat.id} className="flex items-center gap-1.5 border rounded-md px-3 py-1.5 bg-muted/30" data-testid={`category-item-${cat.id}`}>
              {editingId === cat.id ? (
                <>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-7 w-[140px] text-sm"
                    onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                    autoFocus
                    data-testid={`input-edit-category-${cat.id}`}
                  />
                  <Button size="icon" variant="ghost" onClick={saveEdit} className="h-7 w-7" data-testid={`button-save-category-${cat.id}`}>
                    <Save className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setEditingId(null)} className="h-7 w-7" data-testid={`button-cancel-category-${cat.id}`}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="text-sm font-medium" data-testid={`text-category-name-${cat.id}`}>{cat.name}</span>
                  <Button size="icon" variant="ghost" onClick={() => startEdit(cat)} className="h-7 w-7" data-testid={`button-edit-category-${cat.id}`}>
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(cat.id)} className="h-7 w-7" data-testid={`button-delete-category-${cat.id}`}>
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateServiceForm({ onSuccess, categories }: { onSuccess: () => void; categories: any[] }) {
  const { mutate, isPending } = useCreateService();

  const formSchema = insertServiceSchema.extend({
    duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
    price: z.coerce.number().min(0, "Price must be positive"),
  });

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const uniqueCategories = categories.length > 0
    ? categories.map((c: any) => c.name)
    : ["Hair", "Nails", "Face", "Massage"];

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    mutate(data as any, { onSuccess });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Service Name</Label>
        <Input id="name" {...register("name")} placeholder="e.g. Women's Haircut" data-testid="input-new-service-name" />
        {errors.name && <span className="text-xs text-destructive">{errors.name.message}</span>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select onValueChange={(val) => setValue("category", val)}>
          <SelectTrigger data-testid="select-new-service-category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {uniqueCategories.map((cat: string) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && <span className="text-xs text-destructive">{errors.category.message}</span>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (min)</Label>
          <Input id="duration" type="number" {...register("duration")} placeholder="60" data-testid="input-new-service-duration" />
          {errors.duration && <span className="text-xs text-destructive">{errors.duration.message}</span>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price ($)</Label>
          <Input id="price" type="number" step="0.01" {...register("price")} placeholder="80.00" data-testid="input-new-service-price" />
          {errors.price && <span className="text-xs text-destructive">{errors.price.message}</span>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" {...register("description")} placeholder="Brief description..." data-testid="input-new-service-desc" />
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isPending} data-testid="button-submit-new-service">
          {isPending ? "Creating..." : "Create Service"}
        </Button>
      </div>
    </form>
  );
}

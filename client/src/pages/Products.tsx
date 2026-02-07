import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProducts, useCreateProduct, useDeleteProduct } from "@/hooks/use-products";
import { Plus, Trash2, Package } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema } from "@shared/schema";
import { z } from "zod";

export default function Products() {
  const { data: products, isLoading } = useProducts();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { mutate: deleteProduct } = useDeleteProduct();

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Inventory</h1>
          <p className="text-muted-foreground">Track retail products and stock.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <CreateProductForm onSuccess={() => setIsCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <div>Loading...</div>
        ) : products?.map((product) => (
          <div key={product.id} className="bg-card rounded-xl border p-5 shadow-sm hover:shadow-md transition-shadow relative group">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive h-8 w-8"
              onClick={() => {
                if(confirm('Delete product?')) deleteProduct(product.id);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4 text-muted-foreground">
              <Package className="w-6 h-6" />
            </div>
            
            <h3 className="font-bold text-lg mb-1">{product.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{product.brand || "Generic"}</p>
            
            <div className="flex items-center justify-between pt-4 border-t">
              <span className="font-bold text-primary">${Number(product.price).toFixed(2)}</span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${product.stock && product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {product.stock} in stock
              </span>
            </div>
          </div>
        ))}
        {!isLoading && products?.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
            No products in inventory.
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function CreateProductForm({ onSuccess }: { onSuccess: () => void }) {
  const { mutate, isPending } = useCreateProduct();
  
  const formSchema = insertProductSchema.extend({
    price: z.coerce.number().min(0),
    stock: z.coerce.number().min(0),
  });

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  return (
    <form onSubmit={handleSubmit((data) => mutate(data as any, { onSuccess }))} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name</Label>
        <Input id="name" {...register("name")} placeholder="e.g. Moroccan Oil" />
        {errors.name && <span className="text-xs text-destructive">{errors.name.message}</span>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="brand">Brand</Label>
        <Input id="brand" {...register("brand")} placeholder="e.g. L'Oreal" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price ($)</Label>
          <Input id="price" type="number" step="0.01" {...register("price")} placeholder="24.99" />
          {errors.price && <span className="text-xs text-destructive">{errors.price.message}</span>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock">Stock Quantity</Label>
          <Input id="stock" type="number" {...register("stock")} placeholder="10" />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90">
          {isPending ? "Adding..." : "Add Product"}
        </Button>
      </div>
    </form>
  );
}

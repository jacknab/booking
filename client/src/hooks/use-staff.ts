import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { InsertStaff } from "@shared/schema";
import { useSelectedStore } from "@/hooks/use-store";

export function useStaffList() {
  const { selectedStore } = useSelectedStore();
  const storeId = selectedStore?.id;

  return useQuery({
    queryKey: [api.staff.list.path, storeId],
    queryFn: async () => {
      const url = storeId
        ? `${api.staff.list.path}?storeId=${storeId}`
        : api.staff.list.path;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch staff");
      return res.json();
    },
    enabled: !!storeId,
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  const { selectedStore } = useSelectedStore();

  return useMutation({
    mutationFn: async (data: InsertStaff) => {
      const payload = { ...data, storeId: selectedStore?.id ?? null };
      const res = await fetch(api.staff.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create staff member");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.staff.list.path] }),
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertStaff>) => {
      const url = buildUrl(api.staff.update.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update staff member");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.staff.list.path] }),
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.staff.delete.path, { id });
      const res = await fetch(url, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete staff member");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.staff.list.path] }),
  });
}

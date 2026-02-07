import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertAppointment } from "@shared/routes";
import { z } from "zod";

type AppointmentFilters = z.infer<typeof api.appointments.list.input>;

export function useAppointments(filters?: AppointmentFilters) {
  const queryKey = [api.appointments.list.path, filters];
  return useQuery({
    queryKey,
    queryFn: async () => {
      let url = api.appointments.list.path;
      if (filters) {
        const params = new URLSearchParams();
        if (filters.from) params.append("from", filters.from);
        if (filters.to) params.append("to", filters.to);
        if (filters.staffId) params.append("staffId", String(filters.staffId));
        url += `?${params.toString()}`;
      }
      
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch appointments");
      return api.appointments.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertAppointment) => {
      // Ensure date is properly serialized or handled
      const payload = {
        ...data,
        date: new Date(data.date).toISOString() // Ensure ISO string for JSON
      };
      
      const res = await fetch(api.appointments.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to create appointment");
      // Note: Backend returns Date object after Zod parse, but JSON response has string
      const raw = await res.json();
      return api.appointments.create.responses[201].parse({
        ...raw,
        date: new Date(raw.date)
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.appointments.list.path] }),
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertAppointment>) => {
      const url = buildUrl(api.appointments.update.path, { id });
      const payload = { ...updates };
      if (payload.date) {
        payload.date = new Date(payload.date).toISOString() as any;
      }

      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update appointment");
      const raw = await res.json();
      return api.appointments.update.responses[200].parse({
        ...raw,
        date: new Date(raw.date)
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.appointments.list.path] }),
  });
}

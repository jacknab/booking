import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { Store } from "@shared/schema";

export function useStores() {
  return useQuery({
    queryKey: [api.stores.list.path],
    queryFn: async () => {
      const res = await fetch(api.stores.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stores");
      return res.json() as Promise<Store[]>;
    },
  });
}

interface StoreContextType {
  selectedStore: Store | null;
  setSelectedStoreId: (id: number) => void;
  stores: Store[];
  isLoading: boolean;
}

export const StoreContext = createContext<StoreContextType>({
  selectedStore: null,
  setSelectedStoreId: () => {},
  stores: [],
  isLoading: true,
});

export function useSelectedStore() {
  return useContext(StoreContext);
}

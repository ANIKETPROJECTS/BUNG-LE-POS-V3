import { useQuery } from "@tanstack/react-query";
import { DEFAULT_TAX_SETTINGS, type TaxSettings } from "@shared/tax";

export function useTaxSettings() {
  return useQuery<TaxSettings>({
    queryKey: ["/api/settings/tax"],
    initialData: DEFAULT_TAX_SETTINGS,
  });
}

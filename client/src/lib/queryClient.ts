import { QueryClient, QueryFunction } from "@tanstack/react-query";

const fallbackPollIntervalByRoute: Record<string, number> = {
  "/api/orders": 60_000,
  "/api/orders/active": 60_000,
  "/api/orders/completed": 60_000,
  "/api/orders/delivery": 60_000,
  "/api/tables": 60_000,
  "/api/reservations": 60_000,
  "/api/digital-menu/orders": 15_000,
  "/api/customers": 60_000,
  "/api/customers/with-stats": 60_000,
  "/api/customers/loyalty-stats": 60_000,
  "/api/purchase-orders": 60_000,
  "/api/wastage": 60_000,
  "/api/feedbacks": 60_000,
  "/api/inventory-usage": 60_000,
  "/api/inventory-usage/most-used": 60_000,
  "/api/settings/tax": 60_000,
  "/api/printers": 300_000,
  "/api/suppliers": 300_000,
  "/api/delivery-persons": 300_000,
};

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey, signal }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
      signal,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: (query) => {
        const route = query.queryKey[0];
        return typeof route === "string"
          ? fallbackPollIntervalByRoute[route] ?? false
          : false;
      },
      refetchOnWindowFocus: true,
      staleTime: 45_000,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

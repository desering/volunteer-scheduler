"use client";

import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toast";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  }

  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export const ClientProviders = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const queryClient = getQueryClient();

  return (
    <>
      <Toaster />
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </>
  );
};

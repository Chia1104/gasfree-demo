import { Outlet, createRootRoute, HeadContent } from "@tanstack/react-router";

import { RootProvider } from "@/components/root-provider";

export const Route = createRootRoute({
  component: () => (
    <RootProvider>
      <HeadContent />
      <Outlet />
    </RootProvider>
  ),
  notFoundComponent: () => (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <span>Not Found</span>
    </div>
  ),
  errorComponent: () => (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <span>Error</span>
    </div>
  ),
});

import { Typography } from "@heroui/react";
import { createFileRoute } from "@tanstack/react-router";

import { GasFreeDemo } from "@/components/gasfree/gasfree-demo";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center gap-8 p-6">
      <Typography type="h1">GasFree Demo</Typography>
      <GasFreeDemo />
    </main>
  );
}

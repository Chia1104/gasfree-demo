import { Typography } from "@heroui/react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="flex h-screen w-full flex-col items-center justify-center gap-4">
      <section className="flex flex-col items-center justify-center">
        <Typography type="h1">Hello "/"!</Typography>
      </section>
    </main>
  );
}

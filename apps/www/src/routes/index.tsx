import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="flex h-screen w-full flex-col items-center justify-center gap-4">
      <section className="flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">Hello "/"!</h1>
      </section>
    </main>
  );
}

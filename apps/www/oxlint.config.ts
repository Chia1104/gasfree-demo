import { defineConfig } from "oxlint";

import { react } from "@chiastack/oxlint/react";

export default defineConfig({
  extends: [react],
  ignorePatterns: ["**/*.d.ts", ".output", "scripts", "__tests__/**"],
});

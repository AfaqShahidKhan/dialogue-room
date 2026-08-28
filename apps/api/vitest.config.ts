import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    hookTimeout: 60000,
    testTimeout: 30000,
    // Each test file gets its own worker process (and thus its own in-memory
    // Mongo instance + fresh module registry for the zod-validated env
    // singleton in config/env.ts). Files run sequentially within a worker to
    // keep memory bounded; separate files still run in parallel across workers.
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: false,
      },
    },
  },
});

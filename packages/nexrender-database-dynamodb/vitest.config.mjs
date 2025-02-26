import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        setupFiles: ["vitest-dynamodb-lite"],
        env: {
            AWS_REGION: "local",
        },
    },
});

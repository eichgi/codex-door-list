import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    useTypeScriptCli: false,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  webpack(config) {
    const addTailwindLoader = (rules: typeof config.module.rules) => {
      for (const rule of rules) {
        if (!rule || typeof rule !== "object") continue;
        if ("oneOf" in rule && Array.isArray(rule.oneOf)) {
          addTailwindLoader(rule.oneOf);
        }
        if (
          "test" in rule &&
          rule.test instanceof RegExp &&
          rule.test.test("styles.css") &&
          "use" in rule &&
          Array.isArray(rule.use)
        ) {
          rule.use.push("@tailwindcss/turbopack");
        }
      }
    };

    addTailwindLoader(config.module.rules);

    return config;
  },
};

export default nextConfig;

import nextConfig from "eslint-config-next/core-web-vitals";
import prettierConfig from "eslint-config-prettier";
import tsPlugin from "@typescript-eslint/eslint-plugin";

const eslintConfig = [
  ...nextConfig,
  prettierConfig,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    plugins: { "@typescript-eslint": tsPlugin },
    rules: {
      "@typescript-eslint/no-unused-vars": "error",
    },
  },
];

export default eslintConfig;

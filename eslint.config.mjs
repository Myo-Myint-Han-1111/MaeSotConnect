import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Ignore patterns - this replaces .eslintignore
  {
    ignores: [
      // Build outputs
      ".next/**/*",
      ".vercel/**/*",
      "out/**/*",
      "dist/**/*",
      "build/**/*",

      // Dependencies
      "node_modules/**/*",

      // Backup and scripts (non-critical for main app)
      "backup-scripts/**/*",
      "scripts/**/*",
      "backups/**/*",

      // Cache and temp files
      ".npm/**/*",
      ".yarn/**/*",
      ".pnpm/**/*",
      "*.tsbuildinfo",
      "*.log",

      // Environment and config files
      ".env*",

      // IDE and OS files
      ".vscode/**/*",
      ".idea/**/*",
      "*.swp",
      "*.swo",
      ".DS_Store",
      "Thumbs.db",

      // Generated TypeScript files
      "next-env.d.ts",
    ],
  },

  // Apply Next.js config
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Custom rules for your project
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    rules: {
      // Allow unused variables that start with underscore
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // Relax some rules for development
      "react-hooks/exhaustive-deps": "warn",
      "@next/next/no-img-element": "warn",
    },
  },
];

export default eslintConfig;

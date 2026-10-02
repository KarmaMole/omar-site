import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...coreWebVitals,
  ...typescript,
  {
    ignores: [".next/**", "node_modules/**", "payload-types.ts", "next-env.d.ts", ".claude/**"],
  },
  {
    // eslint-plugin-react-hooks 7 (bundled with eslint-config-next 16) adds
    // React Compiler rules that flag long-standing, working patterns. Kept as
    // warnings so they stay visible without blocking CI; fix them in a
    // dedicated pass rather than during the Next 16 upgrade.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/error-boundaries": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/refs": "warn",
    },
  },
];

export default eslintConfig;

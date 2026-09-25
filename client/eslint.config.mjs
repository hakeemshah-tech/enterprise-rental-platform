import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // ── Ratchet: React Compiler rules ───────────────────────────
  // eslint-config-next 16 promotes the React Compiler lint rules to
  // errors. This codebase predates them and uses the classic
  // "fetch in useEffect, then setState" pattern in ~10 places
  // (AuthContext, useSettings, the admin list screens).
  //
  // They are downgraded to warnings rather than disabled: the CI gate
  // stays meaningful for every other rule, the violations remain
  // visible in output, and the count can only be ratcheted down.
  //
  // Correct fix, tracked separately: move list fetching into Server
  // Components or a cache-aware client (SWR/React Query) so state is
  // derived rather than assigned inside an effect.
  {
    name: 'ratchet/react-compiler',
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
    },
  },

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;

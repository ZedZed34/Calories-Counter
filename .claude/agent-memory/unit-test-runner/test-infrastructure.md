---
name: test-infrastructure
description: Vitest configuration and setup files required for this project's test suite
metadata:
  type: reference
---

## Test infrastructure

- **Test runner**: Vitest 4.x, configured in `vite.config.js` under `test` key
- **Environment**: `jsdom`
- **Globals**: `true` (describe, it, expect available without import)
- **Setup file**: `src/test/setup.js` (imports `@testing-library/jest-dom/vitest`)
- **Test scripts**: `npm test` (vitest run), `npm run test:watch` (vitest)
- **Test file pattern**: `**/*.{test,spec}.?(c|m)[jt]s?(x)` (Vitest default)

## Relevant configuration in vite.config.js

```js
test: {
  environment: 'jsdom',
  globals: true,
  setupFiles: ['src/test/setup.js'],
},
```

## Installed devDependencies

- vitest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, jsdom

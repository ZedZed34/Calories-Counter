---
name: testing-component-dependencies
description: Components that depend on React Context providers and the patterns needed to test them in isolation
metadata:
  type: reference
---

## Components with Context dependencies

Several components require multiple Context providers to render:

- **UserForm** depends on both `UserContext` (from `src/context/context.js`) AND `AuthCtx` (from `src/context/auth.js`). Tests must wrap with both providers.
- **UserContext** provides `{ user, setUser }` and is accessed via `useUser()` hook.
- **AuthCtx** provides `{ isAuthenticated, profile, updateProfile }` and is accessed via `useAuth()` hook.

## Test wrapper pattern

Create a `TestWrapper` component that nests both providers:

```jsx
function TestWrapper({ children, initialUser = {}, setUser = vi.fn(), auth = null }) {
  const defaultAuth = {
    isAuthenticated: false,
    profile: null,
    updateProfile: vi.fn().mockResolvedValue(undefined),
  };
  return (
    <AuthCtx.Provider value={auth || defaultAuth}>
      <UserContext.Provider value={{ user: initialUser, setUser: setUser || vi.fn() }}>
        {children}
      </UserContext.Provider>
    </AuthCtx.Provider>
  );
}
```

## Number input selection gotchas

The UserForm has multiple `<input type="number">` fields (age, height, weight, target) with no accessible labels (no `<label htmlFor>` + no `aria-label`), making `getByRole('spinbutton', { name: '...' })` ambiguous. Instead, use `getAllByRole('spinbutton')` and filter by parent `.field-group` text content:

```js
const inputs = screen.getAllByRole('spinbutton');
const ageField = inputs.find((el) =>
  el.closest('.field-group')?.textContent?.includes('Age')
);
```

## Activity level chip clicking

`screen.getByText('Active (6-7 days/week)')` returns the inner `<span class="activity-label">`, not the `<button class="activity-chip">`. Use `.closest('.activity-chip')` to get the button for class assertions.

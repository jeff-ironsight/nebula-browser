# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (proxies /api and /ws to localhost:3000)
npm run build        # Type-check then build for production
npm run typecheck    # Run vue-tsc type checking
npm run lint         # Run ESLint
npm run lint:fix     # Run ESLint with auto-fix
npm test             # Run all tests
```

## Architecture

This is a Discord-inspired test client for [nebula-gateway](https://github.com/jeff-ironsight/nebula-gateway). It
validates gateway WebSocket behavior through a minimal Vue 3 UI.

### Application Flow

`main.ts` initializes Auth0 and Pinia, then mounts `App.vue` which gates all content behind authentication. The app
renders one of four pages based on auth state: Loading → Login/Error → Chat.

### WebSocket Message Flow

1. Connect and acquire Auth0 access token
2. Send `Identify` with token
3. Receive `Hello` with heartbeat interval
4. Handle `Dispatch` events (READY, MESSAGE_CREATE, ERROR)
5. Send `Subscribe` to join channels, `MessageCreate` to send messages

Types are in `src/types/ws/`.

## Environment Variables

Defined in `src/vite-env.d.ts`:

- `VITE_AUTH0_DOMAIN` - Auth0 tenant domain
- `VITE_AUTH0_APP_CLIENT_ID` - Auth0 application client ID
- `VITE_AUTH0_AUDIENCE` - Auth0 API audience (optional)
- `VITE_GATEWAY_WS_URL` - WebSocket URL override (optional, defaults to /ws proxy)

## Testing

Tests use Vitest with `@testing-library/vue`. Test files live in `tests/` subdirectories alongside their source (e.g.,
`src/store/tests/auth.store.test.ts`).

## Type Augmentation

When using `pinia-plugin-persistedstate`, add a side-effect import in store files for vue-tsc to recognize the `persist`
option:

```typescript
import 'pinia-plugin-persistedstate'
```

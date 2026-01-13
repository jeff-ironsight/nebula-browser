# AGENTS.md

## Project
- Vite + Vue 3 client for the Nebula gateway.
- Talks to the gateway via `/api/**` for REST and `/ws` for Websocket connection.

## Dev Commands
- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`

## Local Gateway
- Gateway default: `http://127.0.0.1:3000`
- Vite proxy forwards `/api` and `/ws` to the gateway during development.

## Environment Overrides
- `VITE_GATEWAY_HTTP_URL` for the REST base URL.
- `VITE_GATEWAY_WS_URL` for the WebSocket URL.

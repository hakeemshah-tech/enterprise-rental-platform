# client: Next.js presentation layer

This workspace is the Next.js 16 (App Router) front end of
**Enterprise Rental Platform**. It is not standalone: it consumes the
Node.js Property API in [`../server`](../server) and is booted together with
it from the repository root.

```bash
# from the repository root, not from here
npm install
npm run dev          # starts this client on :3000 and the API on :5000
```

| Topic                                         | Where                                                    |
| --------------------------------------------- | -------------------------------------------------------- |
| Architecture, rendering strategy, local setup | [`../README.md`](../README.md)                           |
| Client/server type contract                   | [`src/types/index.ts`](src/types/index.ts)               |
| Image upload flow                             | [`../docs/ASSET_PIPELINE.md`](../docs/ASSET_PIPELINE.md) |
| Environment variables                         | [`.env.example`](.env.example) → copy to `.env.local`    |

Workspace-local scripts: `npm run dev`, `build`, `start`, `lint`, `typecheck`.

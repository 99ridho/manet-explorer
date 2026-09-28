# MANET Interactive Explorer

Step-by-step simulator for the mobile ad hoc network mechanisms in Weeks 1–8 of *Integrasi Jaringan Mandiri/Mobile* (Universitas Negeri Jakarta): multihop links and bridges, DSDV, AODV and DSR, flooding and MPR, geographic routing, LCA clustering, address allocation, mobility models, network models and evaluation, QoS and ETX routing, and routing attacks with the watchdog. Every operation runs on a small network against Python-like pseudocode with play, pause, step, and scrub controls, and three case studies compare a chosen design with a naive one on the same seed.

Status: baseline built with two topics, Multihop Links and Bridges (Week 1) and Reactive Routing: AODV and DSR (Week 2). See `SPEC.md` §15 for the roadmap and `CLAUDE.md` for the working rules. The Indonesian slides in `references/id/` are the frozen source for the English references in `references/en/`.

## Develop

```sh
npm install
npm run dev        # http://localhost:5173
npm test           # vitest
npm run test:e2e   # playwright layout checks (once: npx playwright install chromium)
npm run build      # tsc -b && vite build, outputs dist/
```

## Deploy

```sh
docker build -t manet-explorer .
docker run -p 8080:80 manet-explorer
```

Pushes to `main` build and publish `ghcr.io/<owner>/manet-explorer` through GitHub Actions.

References: Loo, J., Lloret, J. & Ortiz, J. H. (2012), *Mobile Ad Hoc Networks: Current Status and Future Trends*; Misra, S., Woungang, I. & Misra, S. C. (2009), *Guide to Wireless Ad Hoc Networks*.

# MANET Interactive Explorer

Step-by-step simulator for the mobile ad hoc network mechanisms in Weeks 1–8 of *Integrasi Jaringan Mandiri/Mobile* (Universitas Negeri Jakarta): multihop links and bridges, DSDV, AODV and DSR, flooding and MPR, geographic routing, LCA clustering, address allocation, mobility models, network models and evaluation, QoS and ETX routing, and routing attacks with the watchdog. Every operation runs on a small network against Python-like pseudocode with play, pause, step, and scrub controls, three case studies compare a chosen design with a naive one on the same seed, and each topic ships an ns-3 script that builds the same network over a modeled radio.

Status: all eleven topics and three case studies are built. See `SPEC.md` §15 for the roadmap, `CLAUDE.md` for the working rules, and `ADR.md` for the decisions behind them. The Indonesian slides in `references/id/` are the frozen source for the English references in `references/en/`.

## Develop

```sh
npm install
npm run dev        # http://localhost:5173
npm test           # vitest
npm run test:e2e   # playwright layout checks (once: npx playwright install chromium)
npm run build      # tsc -b && vite build, outputs dist/
```

## ns-3 scripts

`ns3/<slug>.cc` holds one self-contained ns-3 script per topic; the topic's ns-3 tab shows it with the output it printed. To run one yourself, save it in the `scratch/` folder of an ns-3 release and run `./ns3 run "<slug> --<variant-arg>=<value>"` from the ns-3 folder; the tab prints the exact command.

```sh
npm run ns3:check                    # build every script against ns-3.49 in Docker and diff the outputs
node scripts/ns3-check.mjs --update  # rewrite ns3/output/ after changing a script
```

## Deploy

```sh
docker build -t manet-explorer .
docker run -p 8080:80 manet-explorer
```

Pushes to `main` build and publish `ghcr.io/<owner>/manet-explorer` through GitHub Actions.

References: Loo, J., Lloret, J. & Ortiz, J. H. (2012), *Mobile Ad Hoc Networks: Current Status and Future Trends*; Misra, S., Woungang, I. & Misra, S. C. (2009), *Guide to Wireless Ad Hoc Networks*.

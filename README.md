# 2026-brics

**Live demo** https://unctad-infovis.github.io/2026-brics/

## About

A network chart showing how trade between BRICS countries has grown since 2003. Two force-directed graphs (2003 and 2024) plot intra-BRICS export flows, with node size scaled to each country's total exports to other BRICS members and edge thickness scaled to bilateral export values.

## Embedding

```html
<script type="module" crossorigin="" src="https://storage.unctad.org/2026-brics/js/2026-brics.min.js?v=1"></script>
<link rel="stylesheet" crossorigin="" href="https://storage.unctad.org/2026-brics/css/2026-brics.min.css?v=1">
<div class="app-root-2026-brics" id="app-root-2026-brics">
  Loading...
</div>
<noscript>Your browser does not support Javascript!</noscript>
```

Update the `?v=` query parameter to match the current build version to bust the cache.

## Rights of usage

Contact Teemo Tebest.

## How to build and develop

This is a Vite + React project.

* `npm install`
* `npm run start`

Project should start at: http://localhost:8080

For developing please refer to `package.json`

## Files and folders

All public assets go to folder `public`.

All source code goes to folder `src`.

### Mount point

Single mount point, mounted in `src/jsx/Index.jsx`:

| DOM id | Component | Content |
|---|---|---|
| `app-root-2026-brics` | `src/jsx/App.jsx` | Chart header, both network figures, chart meta |

### How to update

* Node/edge data for the two figures lives in `src/jsx/figures/data/*.json` (`figure1_data_2003_*` / `figure2_data_2024_*`) — replace these to update the underlying trade flow data.
* Chart title, subtitle, source and note text are hardcoded as props on `<ChartHeader>`/`<ChartMeta>` in `App.jsx`.

## Packages

The following packages are used in this project by default.

### Project specific

* **d3** — force simulation and rendering for the network charts
* **@unctad-infovis/general-tools** — shared `UseIsVisible` hook and base design-token styles (`colors.css`/`basics.css`)

### Build & Dev Server

* **vite** — development server with hot module replacement and production bundler, replaces webpack
* **@vitejs/plugin-react** — adds React and JSX support to Vite

### React

* **react** — UI component library
* **react-dom** — renders React components to the DOM

### Formatter & Linter

* **@biomejs/biome** — formats and lints JS, JSX and CSS files on save, replaces ESLint + Prettier

### Minification

* **terser** — minifies the production JavaScript bundle, removes console.logs in production builds

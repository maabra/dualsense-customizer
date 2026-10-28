# DualSense Studio

A Vue 3 + Three.js controller configurator, built with Vite and ready for static GitHub Pages hosting. Responsive studio stage, mobile bottom sheet, eight interchangeable visual parts, edition palettes, finishes, lighting, camera views, PNG export, saved builds and shareable URLs.

## Run

Requires Node.js 22.12+ (or 20.19+) and npm.

```sh
npm ci
npm run dev
```

```sh
npm run build
npm run preview
```

The low-detail model loads first (7.2 MB). The detail switch downloads the higher-resolution geometry (50.1 MB) and preserves your configuration. It does not automatically spend mobile bandwidth on the large model.

## GitHub Pages

1. Push this project to a GitHub repository with a `main` branch, including `public/models` and `package-lock.json`.
2. In repository **Settings → Pages → Build and deployment**, choose **GitHub Actions**.
3. The included `.github/workflows/deploy.yml` builds and publishes `dist` when you push to `main`. It can also be started manually from Actions.

Vite uses `base: './'` so assets resolve under both project Pages URLs and custom domains. No backend, API keys, or paid hosting needed. Nothing has been pushed or published from this workspace.

## Asset status

Edition selections currently preview approximate colors, not official graphics. See [the asset guide](public/ASSETS.md) for the maps needed to reproduce authentic editions. Catalog is in `src/catalog.js`; rendering is in `src/renderer.js`; reactive controls are in `src/App.vue`.

The source models and texture ZIP remain in `assets/`. Prepared part-separated GLBs are checked into `public/models/` so deployment does not need Python. To regenerate them after editing the originals:

```sh
python scripts/prepare_models.py
```

The source Collada and 4K textures supplied in `assets/original/` match the GLB material layout. Reference albedo and opacity maps are in `public/textures/reference/`. The high-detail GLB includes the original 4K maps.

In restricted Windows environments, Vite's default config bundler may be unable to traverse parent directories. Use `npm run build -- --configLoader runner` and `npm run preview -- --configLoader runner` to verify the production build in that environment. Normal GitHub runners do not require this flag.

Geometry grouping is based on connected surfaces and spatial bounds, not manufacturer CAD. Some small details remain grouped; this is a visual mix-and-match tool, not a guarantee of mechanical interchangeability. Button-symbol colors need edition textures.

## Credits

“Playstation 5 Dualsense” by [AHarmlessPotato](https://sketchfab.com/AHarmlessPotato), licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). [Original model](https://sketchfab.com/3d-models/playstation-5-dualsense-878c1f882808477ab81c2fe86d5a3936). Modified by grouping surfaces and normalizing transforms. Controller art and trademarks belong to their owners. Unofficial fan project.

The layout uses Google Fonts with local system fallbacks; models and app code are hosted with the site.

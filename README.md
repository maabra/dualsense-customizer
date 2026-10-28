# DualSense Studio

An interactive 3D playground for mixing DualSense controller parts, colors, and finishes. Built with Vue 3, Three.js, and Vite, the app runs entirely in the browser and can be hosted as a static website.

## Features

- Orbit, zoom, and switch between front, rear, and perspective views.
- Basic controls for whole groups, or Advanced controls for 25 individual pieces: front and rear shell halves, center trim halves, touchpad, four face buttons, four D-pad directions, two thumbsticks, L1/R1 bumpers, L2/R2 triggers, Create, Options, PS, and mute buttons.
- Independent colors, finishes, and texture imports for each piece.
- Standard-color and limited-edition palettes, custom colors, and randomized combinations.
- Lightweight model loaded first, with an optional high-detail model and 4K textures.
- Responsive desktop layout and expandable mobile customization panel.
- Automatically saved color and finish selections, shareable build links, JSON export, and PNG snapshots.

Switching between Basic and Advanced preserves individual settings. A Basic group displays “Mixed selections” when its pieces differ; applying a palette, finish, or texture to that group updates all its pieces.

## Asset status

The default controller uses the supplied model and its original textures. Limited-edition entries currently preview approximate palettes; they do **not** reproduce official edition graphics. No AI-generated controller artwork is used. The catalog is extensible and does not claim to cover every regional or promotional release.

Imported textures must match the model's UV layout. Imports remain in the current browser session, including when switching model quality, but are not included in saved builds or share links. See [the asset guide](public/ASSETS.md) for material sets and reference maps.

This is a visual configurator. Connected surfaces are separated by geometry and spatial bounds; continuous rear-shell and center-trim surfaces are divided at the center plane. The result does not imply physical seams, replacement-part availability, or mechanical compatibility.

## Local development

Requires Node.js 22.12+ (or 20.19+) and npm.

```sh
npm ci
npm run dev
```

Create and preview a production build:

```sh
npm run build
npm run preview
```

The default model is approximately 7.2 MB. Enabling high detail downloads approximately 50.1 MB; the larger model is not downloaded automatically on mobile.

## Deployment

The included GitHub Actions workflow builds and deploys `dist/` to GitHub Pages on pushes to `main`, or through a manual workflow run. Repositories using this workflow must select **GitHub Actions** as their Pages deployment source.

Vite's relative asset base supports repository Pages paths and custom domains. No backend, API keys, or database are required.

## Project structure

| Path | Purpose |
| --- | --- |
| `src/App.vue` | Reactive controls, build state, persistence, and sharing |
| `src/catalog.js` | Part groups, individual pieces, and palettes |
| `src/renderer.js` | Three.js scene, materials, cameras, and model loading |
| `src/style.css` | Desktop and mobile layouts |
| `public/models/` | Prepared models with configurable part materials |
| `public/textures/reference/` | Original albedo and opacity maps for UV reference |
| `assets/original/` | Source Collada model and matching 4K textures |
| `scripts/prepare_models.py` | Rebuilds the part-separated GLBs |

Prepared models are included so production builds do not require Python. After changing the source models, regenerate them with:

```sh
python scripts/prepare_models.py
```

Older shared builds using grouped selections are migrated to the individual-part format when opened.

## Credits

“Playstation 5 Dualsense” by [AHarmlessPotato](https://sketchfab.com/AHarmlessPotato), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). [Original model](https://sketchfab.com/3d-models/playstation-5-dualsense-878c1f882808477ab81c2fe86d5a3936). Modifications include grouping and splitting surfaces for independent customization and normalizing root transforms.

An unofficial fan project, unaffiliated with Sony Interactive Entertainment. Controller designs, edition artwork, and trademarks belong to their respective owners. Google Fonts are used with system-font fallbacks.

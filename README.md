# DualSense Studio

An interactive 3D playground for mixing DualSense controller parts, colors, and finishes. Built with Vue 3, Three.js, and Vite, the app runs entirely in the browser and can be hosted as a static website.

## Features

- Left-drag to orbit, right-drag to move, and scroll toward the cursor to zoom. Touch controls support one-finger rotation and two-finger movement and zoom. Zoom buttons span 0.75–24 model units; Reset view restores the default framing.
- Console-inspired Customize, Light bar, and Settings menus, including keyboard tab navigation. Choosing a part opens its appearance menu; All parts returns to the overview without losing edits.
- Grouped controls or 25 individual pieces: front and rear shell halves, center trim halves, touchpad, four face buttons, four D-pad directions, two thumbsticks, L1/R1 bumpers, L2/R2 triggers, Create, Options, PS, and mute buttons.
- Independent colors, finishes, and texture imports for each piece.
- Standard-color and limited-edition palettes, custom colors, and randomized combinations.
- Startup model chooser recommending the source Original model, alongside separate High Definition and Low Definition GLB options.
- Studio softbox reflections, area lighting, calibrated material finishes, and real cast shadows on all models.
- Illuminated side light bars with subtle light spill, Player 1–4 color presets, white, and a custom color picker. Player palette references follow [PlayStation's controller color explanation](https://blog.de.playstation.com/?p=157987).
- Transfer progress is bounded below 100% until the model is ready; missing transfer sizes use an indeterminate loading message.
- Responsive desktop layout and expandable mobile customization panel.
- Automatically saved color and finish selections, shareable build links, JSON export, and PNG snapshots.

Switching between Grouped parts and Individual parts preserves each piece's settings. A group displays “Mixed selections” when its pieces differ; applying a palette, finish, or texture to that group updates all its pieces. The overview tiles show each part's current appearance.

## Asset status

The default controller uses the supplied model and its original textures. All 28 listed edition entries include reference-based artwork approximations. Wolverine and fifteen other front layouts use photo-derived contours; complex character illustrations and some logos remain simplified. These are not extracted official texture maps. See the asset documentation for per-edition accuracy limits. The catalog does not claim to cover every regional or promotional release.

Generated part-selector icons are displayed from a transparent 5×5 atlas. The [icon asset notes and exact generation prompt](public/icons/README.md) describe the built-in image-generation step. Controller artwork is drawn in code, not image-generated.

Recreated artwork uses a secondary front-projection UV set with the original normal maps and lighting. Shell halves share a continuous layout; buttons and touchpads use local projection bounds. Imported textures continue to use the supplied model's original UV layout. Choosing an edition changes only the selected part; **Apply to entire controller** previews a complete edition.

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

Original is converted directly from `assets/original/source/model/model.dae` and its matching textures, retaining source geometry and packing the original material channels for the browser (approximately 51.9 MB). High Definition is the previous detailed GLB (50.1 MB), and Low Definition is the lightweight GLB (7.2 MB). No model downloads until a visitor makes a selection. Models can be changed later without losing customization settings.

## Deployment

Production output is written to `docs/` and included in the repository. With branch-based GitHub Pages, the repository-root entry redirects to `docs/`, so visitors receive the compiled app rather than Vue source. Directly serving `docs/` also works. Vite removes the redirect from development and production app HTML to avoid redirect loops.

The included GitHub Actions workflow builds `docs/` and publishes it with the root redirect and 404 page, matching the branch-hosted layout. This keeps model paths consistent whichever deployment runs last. It runs on pushes to `main` or through a manual workflow run. Repositories using this workflow must select **GitHub Actions** as their Pages deployment source.

The HTML includes its own dark startup and failure screen, independent of the JavaScript bundle. A standalone dark 404 page is included as well.

Vite's relative asset base supports repository Pages paths and custom domains. No backend, API keys, or database are required.

## Project structure

| Path | Purpose |
| --- | --- |
| `src/App.vue` | Vue interface, app styles, reactive controls, build state, persistence, and sharing |
| `src/catalog.js` | Part groups, individual pieces, and palettes |
| `src/renderer.js` | Three.js scene, materials, cameras, and model loading |
| `src/edition-artwork.js` | Reference-based artwork canvases, per-part colors, and secondary UV projection |
| `src/PartIcon.vue` | Generated icon-atlas display for individual parts and groups |
| `public/models/` | Prepared models with configurable part materials |
| `public/textures/reference/` | Original albedo and opacity maps for UV reference |
| `assets/original/` | Source Collada model and matching 4K textures |
| `scripts/prepare_models.py` | Rebuilds the part-separated GLBs |

Prepared models are included so production builds do not require Python. After changing the source models, regenerate them with:

```sh
python scripts/prepare_models.py
python scripts/prepare_original.py
```

The original-model conversion requires Python's Pillow package. Its image processing only packs source material channels and converts texture orientation; it does not synthesize artwork.

Older shared builds using grouped selections are migrated to the individual-part format when opened.

## Catalog review

The [catalog audit](public/CATALOG-AUDIT.md) records visual corrections across the 28 listed editions. GTA variants include separate palm/VI relief and iridescent coatings; edition-specific material regions remain configurable.

## Vector artwork and shared mapping

All 28 listed editions include [SVG artwork masters](public/artwork-vectors/manifest.json). Artwork and finish maps are baked into reusable charts from the supplied model?s original UV layout. Desktop Original/High artwork uses 4K maps; mobile sizes adapt to limit memory. Each edition retains its distinct material regions and independent artwork finish. SVG artwork remains a reference-based approximation.

## Whole-controller appearance

Choose **Whole controller** in Customize to apply a color, limited-edition appearance, or finish across every part, then adjust individual pieces. All 28 listed editions include artwork approximations, with fidelity varying by reference quality. Mapped editions also offer an independent **Artwork finish**, including metallic print against a matte shell. See [asset documentation](public/ASSETS.md) for the reference methods and known differences.

## Credits

This is an unofficial testing prototype. The project claims no ownership of third-party controller designs, artwork, logos, trademarks, or promotional photographs. See [asset rights and the testing-purpose notice](public/RIGHTS.md). The supplied model's CC BY 4.0 attribution is preserved.

“Playstation 5 Dualsense” by [AHarmlessPotato](https://sketchfab.com/AHarmlessPotato), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). [Original model](https://sketchfab.com/3d-models/playstation-5-dualsense-878c1f882808477ab81c2fe86d5a3936). Modifications include grouping and splitting surfaces for independent customization and normalizing root transforms.

An unofficial fan project, unaffiliated with Sony Interactive Entertainment. Controller designs, edition artwork, and trademarks belong to their respective owners. Google Fonts are used with system-font fallbacks.

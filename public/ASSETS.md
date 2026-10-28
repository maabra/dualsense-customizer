# Authentic edition assets

The configurator ships with the provided default DualSense models and their original embedded textures. All 24 listed edition entries include artwork approximations. Their fidelity varies: some layouts are photo-traced, while complex illustrations are simplified. These are not exact official replicas. No AI-generated controller artwork is used. The separate UI part icons are image-generated. The catalog is extensible and does not claim to include every promotional or regional release.

## Recreated artwork

`src/edition-artwork.js` draws Gran Turismo racing stripes and badges, both Wolverine claw treatments, the 30th Anniversary colored face-button symbols, both Astro Bot eye treatments and blue detailing, Spider-Man symbiote strokes and emblem, and simplified Ragnarök bear/wolf motifs. These are best-effort approximations; small logos, line placement, finish, and some rear details differ from the official designs.

The renderer retains native UVs and adds a temporary vector-plate UV attribute for baking. Front shells and trim share the controller-wide layout, touchpads have dedicated local bounds, and each face button uses its own local projection. Front and rear artwork use opposite facing masks, with mirrored rear projection so rear markings read correctly. Curved sides retain the selected part color. The original UVs and normal maps are retained. Hand-drawn maps are recreated on demand, cached locally, and restored from edition IDs in saved builds. Texture uploads override recreated artwork for their selected pieces.

The 25-part icon atlas is at `icons/dualsense-parts-atlas-v1.png`; its generation prompt is in `icons/README.md`.

### Official visual references

- Wolverine: https://blog.playstation.com/2026/08/11/first-look-at-marvels-wolverine-limited-edition-ps5-console-bundle-and-accessories
- Gran Turismo: https://www.playstation.com/en-gb/accessories/dualsense-wireless-controller/buy-now/product/gran-turismo-limited-edition/
- 30th Anniversary: https://blog.playstation.com/2024/09/19/celebrating-30-years-of-playstation-with-a-nostalgic-look/
- Astro Bot: https://blog.playstation.com/2024/07/29/first-look-astro-bot-limited-edition-dualsense-wireless-controller/
- Spider-Man 2: https://www.playstation.com/ja-jp/games/marvels-spider-man-2/limited-editions/
- Ragnarök: https://www.youtube.com/watch?v=uvZZvTRFbTs

To finish authentic mixed-edition previews, supply the original base-color textures or licensed scans for each edition. In particular: Gran Turismo touchpad, Wolverine front shell, and 30th Anniversary face-button artwork. Product photos are useful visual references but are not UV-ready texture maps.

## Model and mapping

- Original model: https://sketchfab.com/3d-models/playstation-5-dualsense-878c1f882808477ab81c2fe86d5a3936
- Creator: AHarmlessPotato. License: CC BY 4.0, https://creativecommons.org/licenses/by/4.0/
- Modifications: connected surfaces grouped into selectable parts; root transforms normalized. Original mesh coordinates and UVs retained.
- Both supplied versions use three UV/material sets: `1011`, `1001`, `1002`.
- `1011`: front shell, touchpad, center trim, light surround.
- `1001`: face buttons, D-pad, thumbsticks, shoulder buttons, small details.
- `1002`: rear shell.

An imported map is applied only to the selected part. It must use the corresponding original UV layout. Low and high models retain the supplied UVs. Do not assume a texture from a different controller model aligns with these UVs.

The supplied `ps5_controller_texture-1K.zip` is a separate single-map set; it has not been substituted for the model's embedded three-material maps because matching UVs are unverified.

`assets/original/source/model.zip` contains the original Collada model with the same three material sets. `assets/original/textures/` contains the matching 4K originals. The high-detail GLB already embeds 4K maps; the low-detail GLB embeds 1K maps. Original albedos and opacity masks are copied into `public/textures/reference/` as UV-layout references for creating edition maps. The clear button caps require the matching opacity mask as well as base color; the supplied GLBs already combine these correctly.

## Import now

Choose a part, open Custom, and import a PNG, JPG, or WebP (up to 20 MB). Imports remain local to the current session and survive detail-model switching, but do not persist on reload or travel in build links. Colors and finishes do persist.

## Reference sources

- Current official range: https://www.playstation.com/en-us/accessories/dualsense-wireless-controller/
- Gran Turismo edition: https://blog.playstation.com/2026/10/14/gran-turismo-7s-spec-iv-part-1-launches-today-and-a-first-look-at-dualsense-wireless-controller-gran-turismo-limited-edition/

Official artwork and trademarks remain the property of their owners. This is an unofficial fan configurator. The interface does not verify physical fit or availability of replacement parts.

## Detailed reference pass

Wolverine claw paint and visible scratch contours are traced from an official front photograph, rather than generated randomly. Rear grip tips use the official rear views. Astro controls use white substrates and pale blue markings, with dotted circular eyes for the original edition. Anniversary controls use a cooler gray and colored PS-button regions. Original/high models use 4096-pixel body and touchpad maps on desktop, with 2048-pixel body maps on mobile; Low Definition uses 2048-pixel body maps and 1536-pixel touchpads. Maps are released when no longer used by the current mix.

Rubber sticks, matte rear plastic, glossy button caps, painted touchpads, and metallic trim use separate physical material profiles. Wolverine painted claw regions have a different roughness from their substrate. Surface values are artistic estimates, not measurements. The supplied normal maps remain intact.

The inspected front, top, oblique, and rear image URLs and known limitations are recorded in [texture-references.json](./texture-references.json). Some logos and the Spider-Man/Ragnarok illustrations remain simplified; this project does not claim microscopic accuracy. See [RIGHTS.md](./RIGHTS.md) for ownership, attribution and the testing-purpose notice.

## Full catalog coverage

All 24 current catalog entries support whole-controller or individual-part selection. The new Whole controller option applies a standard color, custom color, edition, or base finish across all 25 selectable parts. The light bar remains independent. Individual parts can then be changed separately.

Fifteen front layouts use deterministic flat-color contour extraction from inspected product photographs: Final Fantasy XVI, Marathon, LISA, 007 First Light, Death Stranding 2, Ghost of Yotei Black, Gray Camouflage, both GTA VI variants, Gran Turismo, Ragnarok, Spider-Man 2, Fortnite, The Last of Us, and Helldivers 2. The extractor is `scripts/trace-catalog.py`. It removes photographic lighting by isolating color regions or local contrast, then reconstructs flat-color contours; it does not recover factory UV maps. Calibration and extraction thresholds are recorded in the script. Original photographs are not shipped as texture maps.

Hogwarts Legacy, LeBron James, Concord, and Ghost of Yotei Gold still have simplified graphic interpretations. Their fine lettering, character illustrations, exact brushwork, and unseen rear art are not authenticated replicas. Astro and Anniversary detailing also remains partly procedural. Photo-derived layouts still have projection and source-resolution limitations. Color-only placeholders have been replaced, but this does not mean every design has equal fidelity.

### Finish regions

Wolverine's gray/silver scratch regions use a reflective metallic response against the matte charcoal substrate. Yellow print remains nonmetallic in Edition materials mode. Final Fantasy XVI, Hogwarts and Yotei Gold use metallic ink regions, while The Last of Us uses glossier print on matte plastic. LISA has a subtle iridescent pearl substrate, 007 uses a gold metallic front, and Concord retains a matte base. Values are artistic estimates from references, not measured material scans.

For these mapped print editions, **Artwork finish** overrides the print separately from the **Finish** of the underlying part. **Edition materials** restores the mixed print finish. Both overrides are saved in local builds and share links. The controls preserve the model's normal maps. Factory micro-embossing, transparent claw windows, measured anisotropy and exact ink thickness have not been reconstructed.

## Second detail pass

Additional front, top, oblique and rear reference views are listed in `texture-references.json`. The rear wordmarks on Marathon, Ghost of Yotei Black, 007 First Light, LISA, and Gran Turismo now use traced layouts. The supplied geometry is shared by every edition, so traced photos are fitted projections rather than recovered production UVs. Camera distortion is reduced using control landmarks and dedicated touchpad homographies for Spider-Man, The Last of Us and Helldivers. Rear projection is mirrored for legibility. The renderer uses a distinct rear-facing shader cache key so rear decals actually render.

Ragnarok's outer shell is blue with a pale center; its bear/wolf silhouette is traced. Fortnite uses blue face controls and traced character/lettering details. The Last of Us no longer uses randomly placed trophy placeholders. Spider-Man's red artwork and emblem and Gran Turismo's badges are traced rather than synthesized curves or typed stand-ins.

### Material data

`src/surface-artwork.js` builds an independent linear-data map from the artwork palette and edition material profile. Roughness and metalness have separate channels; clearcoat and print coverage share a packed channel. Opaque data pixels avoid the loss of substrate values through canvas alpha premultiplication. The maps are separate from base color: silver Wolverine print is metallic, yellow paint is dielectric, and the substrate remains matte. Artwork finish overrides act on print coverage independently of the base finish. LISA's pearl finish and 007's gold material continue onto the rear. Original fine normal maps remain unchanged.

These material values are estimated by eye. They are not measured BRDFs, factory coating specifications, or edition-specific scans. Molded microscopic PlayStation symbols, exact ink thickness, transparent Adamantium windows, exact serial/regulatory lettering, and geometry changes are not newly reconstructed. Photos cannot establish all of those details reliably. Some source images contain small, low-contrast print that is only partially recoverable; contour reconstruction can omit, merge, or displace strokes. No controller textures in this pass were image-generated.

The [testing-purpose rights notice](./RIGHTS.md) applies to these reconstructions as well as earlier assets. The model retains its original CC BY 4.0 attribution.

## Shared native-UV vector workflow

All 24 editions have resolution-independent SVG artwork masters under [artwork-vectors/manifest.json](./artwork-vectors/manifest.json). They are generated from the same drawing functions as the app, using paths, curves, geometric primitives, gradients and vector text. No reference photograph is embedded in an SVG. Photo-derived contours are still approximations of the printed artwork, not authenticated factory designs; complex editions retain their previously documented limitations.

`src/native-uv-baker.js` builds reusable charts from the supplied model's original UV coordinates. Each vector plate and its separate finish-data map is baked into the same native UV chart. The displayed controller samples its original UV coordinates, not a live planar projection. Left/right part customization and all existing edition finish profiles remain independent. Geometry and original UV islands are retained; this does not claim a newly measured factory unwrap.

Only front/rear-facing chart surfaces participate in the bake; steep bevels are not used to project lettering across perpendicular surfaces. Back-facing fragments cannot erase front artwork when UV coverage overlaps. Color and finish targets share coordinates. Premultiplied coverage is decoded after filtering so transparent chart boundaries do not create dark fringes. Factory embossed details remain in the original normal maps. Photographed control-outline components are removed from the vector masters instead of using runtime exclusion masks around D-pad lobes or buttons.

Original and High Definition artwork uses 4096-pixel body/touchpad masters and 1024-pixel controls on desktop. Smaller viewports use 2048-pixel body/touchpad maps and 512-pixel controls to limit GPU memory; Low Definition uses 2048-pixel body maps, 1536-pixel touchpads and 512-pixel controls. Vector masters can be rasterized at higher resolution without enlarging a source bitmap. Original embedded normal maps remain as supplied. Full supported anisotropic filtering is enabled for oblique views. Old native-UV color and finish targets are released when no longer used.

Gran Turismo's touchpad stripes, red circled E, blue/red electrical warning and gray hood-fastener graphics are rebuilt as vector geometry fitted to the inspected front reference. Generic duplicate planar Sony/regulatory labels are not added over the supplied factory embossing. Other small artwork still depends on the reference quality; higher raster resolution does not recover missing source evidence.

The **Artwork finish** control continues to modify print separately from the base part finish. Reusing UV charts does not flatten metallic ink, matte plastic, clearcoat or pearl treatments into one material.

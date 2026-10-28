# Authentic edition assets

The configurator ships with the provided default DualSense models and their original embedded textures. Eight edition entries now include hand-drawn artwork recreations; all other editions remain color previews. Neither mode is an exact official replica. No AI-generated controller artwork is used. The separate UI part icons are image-generated. The catalog is extensible and does not claim to include every promotional or regional release.

## Recreated artwork

`src/edition-artwork.js` draws Gran Turismo racing stripes and badges, both Wolverine claw treatments, the 30th Anniversary colored face-button symbols, both Astro Bot eye treatments and blue detailing, Spider-Man symbiote strokes and emblem, and simplified Ragnarök bear/wolf motifs. These are best-effort approximations; small logos, line placement, finish, and some rear details differ from the official designs.

The renderer adds a secondary front-projection UV attribute. Front shells and trim share the controller-wide layout, touchpads have dedicated local bounds, and each face button uses its own local projection. Front and rear artwork use opposite facing masks, with mirrored rear projection so rear markings read correctly. Curved sides retain the selected part color. The original UVs and normal maps are retained. Hand-drawn maps are recreated on demand, cached locally, and restored from edition IDs in saved builds. Texture uploads override recreated artwork for their selected pieces.

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

Wolverine claw paint and visible scratch contours are traced from an official front photograph, rather than generated randomly. Rear grip tips use the official rear views. Astro controls use white substrates and pale blue markings, with dotted circular eyes for the original edition. Anniversary controls use a cooler gray and colored PS-button regions. Original/high models use 3072-pixel body maps; Low Definition uses 1536 pixels. Maps are released when no longer used by the current mix.

Rubber sticks, matte rear plastic, glossy button caps, painted touchpads, and metallic trim use separate physical material profiles. Wolverine painted claw regions have a different roughness from their substrate. Surface values are artistic estimates, not measurements. The supplied normal maps remain intact.

The inspected front, top, oblique, and rear image URLs and known limitations are recorded in [texture-references.json](./texture-references.json). Some logos and the Spider-Man/Ragnarok illustrations remain simplified; this project does not claim microscopic accuracy. See [RIGHTS.md](./RIGHTS.md) for ownership, attribution and the testing-purpose notice.

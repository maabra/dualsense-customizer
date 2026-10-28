# Authentic edition assets

The configurator currently ships with the provided default DualSense model and its original embedded textures. Edition entries are **color approximations**, not replicas. No AI-generated controller artwork is used. The catalog is extensible and is not a claim to include every promotional or regional release.

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

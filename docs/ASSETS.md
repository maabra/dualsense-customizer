# Controller assets and reference accuracy

DualSense Studio is an unofficial visual configurator. All 28 listed editions have SVG artwork masters; designs are reconstructed from product references and are not authenticated factory maps. No controller artwork is image-generated. The separate part-selector icons are image-generated.

## Shared native-UV workflow

`src/native-uv-baker.js` derives reusable charts from the supplied model's original UV coordinates. Vector color plates, independent finish-data maps and supported relief maps are baked into the same charts. The displayed controller samples its native UVs as it moves. Left/right customization and edition-specific finishes are preserved. Back-facing fragments cannot erase front artwork. Premultiplied chart coverage is decoded after filtering to avoid dark fringes.

The original unwrap and geometry remain in use; this is not a newly measured production-controller mesh. Source-photo control silhouettes are removed from artwork components rather than cut out with runtime control masks. Printed shell designs follow the curved chart surfaces. Factory molded labels and fine plastic grain remain in the supplied normal maps.

## Vector artwork

The [SVG manifest](./artwork-vectors/manifest.json) lists resolution-independent masters for all 28 editions. They use paths, curves, primitives, gradients and vector text, with no embedded reference photographs. Masters are regenerated from the app's drawing code during builds.

Nineteen front layouts now use reference-derived contours: Gran Turismo, Spider-Man, Ragnarok, Final Fantasy XVI, Hogwarts Legacy, LeBron James, Concord, Fortnite, Helldivers, The Last of Us, Death Stranding 2, both Yotei variants, Marathon, 007, both GTA variants, LISA and Gray Camouflage. Both Wolverine variants share photo-derived claw/scratch contours. Astro's two eye expressions and circuit details, and Anniversary's colored control regions, use procedural vector geometry. Gran Turismo's touchpad stripes and safety/fastener graphics have been redrawn as clean vectors.

Rear references are applied where inspected, including GT, Marathon, Yotei, 007, LISA, Concord, Ragnarok and GTA. Hogwarts' castle, LeBron's handwritten lettering, Concord's actual red/teal ship graphics and Yotei Gold's brushwork replace earlier invented approximations. Unknown surfaces retain the appropriate substrate instead of fabricated graphics.

## Materials and molded relief

`src/surface-artwork.js` creates separate linear-data maps for roughness, metalness, clearcoat and print coverage. Edition materials remain distinct: metallic Wolverine marks against matte plastic; gold foil against pale Yotei material; glossier trophy artwork on The Last of Us; glossy Astro blue panels against white plastic; and LISA's pearl coating. The Artwork finish override changes mapped print independently from the base finish.

GTA Black and White share the reference-derived palm/VI mold layout, while retaining different substrate/control colors. Blue-to-violet center trim, pink/purple control markings, purple rear grip tips and back branding follow the inspected views. The substrate/trim use an iridescent clear coating. Separate vector height maps are baked into the native charts and perturb the existing normal-mapped surface, so palm and logo details respond to light rather than being painted-on gray lines. Astro's molded circuits use the same additive relief pipeline. Original normal maps are preserved.

All material and relief depths are visual estimates from references, not measured BRDFs, factory coating specifications or physical scans.

## Resolution and memory

Desktop Original/High artwork is rasterized directly from vectors into 8192-pixel body/touchpad maps and 2048-pixel controls, including the final native-UV render targets. Mobile uses 4096-pixel body/touchpad maps and 1024-pixel controls; Low Definition uses 4096-pixel body maps and 3072-pixel touchpads. Texture dimensions are capped by the device GPU limit. This doubles linear texel density without changing the physical size of strokes or patterns. Desktop finish-data maps use up to 2048 pixels to retain thin metallic etching; smaller maps use up to 1024 pixels. Relief maps use up to 2048 pixels. Original embedded normal maps remain as supplied. Maximum supported anisotropic filtering is used for oblique views. Color, finish and relief render targets are released when no longer used.

Face buttons use the supplied cap and insert surfaces, with a separate printed-symbol plane inside the cap so symbols remain legible across the three model UV layouts. The cap has a smooth, nonmetallic, refractive clear-polymer material; its parameters are visual estimates rather than a measured material specification. The D-pad remains opaque. Mobile refraction renders at a lower intermediate resolution to reduce GPU cost. Gold-ink finishes are assigned independently for FF XVI, Hogwarts, Yōtei Gold and Genshin; LISA's pale metallic details and Helldivers' touchpad dot pattern are reference-derived.

SVG paths can rasterize sharply at higher resolution, but vectorization cannot recover unseen photographic detail. Micro-embossing not present in the base model, exact transparent Adamantium windows/internal components, ink thickness, unreadable regulatory labels and edition-specific physical geometry are not claimed as reconstructed.

## Supplied model and texture sets

?Playstation 5 Dualsense? by [AHarmlessPotato](https://sketchfab.com/AHarmlessPotato), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). [Original model](https://sketchfab.com/3d-models/playstation-5-dualsense-878c1f882808477ab81c2fe86d5a3936).

Modifications include coordinate normalization, grouping/splitting connected surfaces, conversion of supplied geometry, native-UV chart baking and material customization. Original is converted from the supplied Collada source and matching textures; High is the earlier detailed GLB; Low uses the lightweight GLB. No model downloads before selection.

The supplied UV/material sets are `1011` (front, pad, trim/light surround), `1001` (controls and details) and `1002` (rear). Original albedo/opacity references remain under `textures/reference/`. Imported maps use the model's original UV layout and stay local to the session. The separate single-map texture zip is not substituted for these three sets without a verified UV match.

## Reference record and rights

[texture-references.json](./texture-references.json) records source URLs, extraction methods and known limits. [CATALOG-AUDIT.md](./CATALOG-AUDIT.md) records the catalog-wide visual review and corrective work. Promotional photographs are inspected locally and are not bundled as controller textures.

See [RIGHTS.md](./RIGHTS.md) for the no-ownership, testing-purpose notice and preserved model attribution. Controller designs, edition artwork, logos, trademarks and referenced photographs remain the property of their respective rights holders. The interface does not verify physical replacement-part fit or availability.

## Chroma Collection finish

Chroma Pearl, Indigo and Teal use a polished clear coat, lower surface roughness and separate iridescent film ranges on the shell, rear and trim. The underlying normal strength is reduced for the smooth coated appearance. Thumbstick rubber remains matte, and manual finish overrides restore their selected material behavior. References: https://direct.playstation.com/en-us/buy-accessories/dualsense-wireless-controller-chroma-indigo-for-ps5-pc-mac-mobile and https://direct.playstation.com/en-us/buy-accessories/dualsense-wireless-controller-chroma-pearl . These are visual estimates rather than measured coating specifications.

Gran Turismo shell artwork is traced from the official 3840-pixel front render, including the small slogan and red badge. GT shell placement uses a smooth registration fitted to landmarks on the supplied model. Gray Camouflage uses cleaned four-ink vector contours from the high-resolution reference, with independently registered shell and touchpad masters and clipped controller-symbol micro-patterns. LISA uses a separately registered high-resolution eye print and clean grip vectors. Factory controls and photographed highlights are excluded from these artwork masters. Enclosure artwork bakes across the complete native UV islands, including side-facing surfaces, without a camera-facing fade at the corners. GTA artwork uses cleaned relief contours, screen-space bump derivatives, and vertex displacement for molded depth; the base controller geometry remains the supplied DualSense model.


## Ghost of Yōtei Gold artwork

The front artwork is extracted as a single flat gold ink layer from the official [PlayStation controller render](https://gmedia.playstation.com/is/image/SIEPDC/Ghost-of-Yotei-LE-controllers-image-block-01-en-02jul25), with separately registered shell and touchpad contours. Cream photo shading and hardware outlines are excluded. Isolated photographic specks are excluded while long dry-brush gaps and fine bristle channels remain. The cream shell uses a fine plastic finish, with reduced source normal strength; only the gold print is metallic. Tapered molded cuts use a separate approximate relief master. Gray controls and a more textured rear remain independent of the gold print. Additional reference: [official product gallery](https://www.playstation.com/en-us/ps5/ghost-of-yotei-limited-edition-ps5-bundle-and-accessories/).


## Helldivers 2 artwork

Shell and touchpad print are independently registered from the supplied high-resolution front reference. Yellow paint and gray labels are separate vector layers; controls, photographic shading, and broad shoulder reflections are excluded. Deliberate chipped paint is retained. The touchpad dot grid uses evenly spaced vector circles, and the shell uses reduced normal strength with a consistent matte material. Rubber controls and the rear retain their own finishes.


## Concord artwork

The geometric front graphics are reconstructed as clean vector curves, ink panels, clipped hatch bands and small printed marks using the front reference. This replaces low-resolution photographic contours and excludes stray background colors. The intentional radar marking beside Triangle is retained; no duplicate hardware rims are printed. The rear uses its separate reference-derived logo. The front normal strength is reduced for a consistent matte substrate.


## Astro Bot Joyful layout

Joyful uses the reference's individual cyan and dim-blue eye dots, with continuous curved cobalt grip inlays, white bumpers/triggers, and cyan control symbols. White plastic and glossy blue ink have independent finishes. Molded channels around the sticks and handles use separate shell and trim relief masters. Both Astro variants share the corrected body layout while retaining their distinct eye expressions. The layout is self-contained and remains identical before and after downloading other edition artwork. Reference: https://www.playstation.com/en-us/games/astro-bot/ .

## 30th Anniversary PS button

The colored emblem uses the supplied model's raised P and S face boundaries in local artwork coordinates, shared by both model qualities. The native UV bake masks out the recessed backing using the button's sloped cap plane. This preserves the black surround and side walls without projecting a second, differently shaped logo onto the button. Reference: https://www.playstation.com/en-pl/30th-anniversary-collection/ .

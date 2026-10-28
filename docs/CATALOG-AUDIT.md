# Catalog visual audit

This review covers all 24 current catalog appearances. Front render captures were checked across the catalog, with oblique/rear views checked where references were available. Both GTA variants were also exercised on Original. This record identifies concrete corrections; it is not a factory-authenticity certification.

| Edition | Review and corrective work |
|---|---|
| 30th Anniversary | Gray/colored-control layout; matte substrate profile reviewed. |
| Gran Turismo | Pad vectors, traced badges, carbon appearance and rear mark reviewed. |
| Wolverine Battle Yellow | Claw layout; metallic gray versus dielectric yellow print; rear tips reviewed. |
| Wolverine Adamantium | Shared claws and metallic trim reviewed; true transparent windows/internal geometry remain unsupported. |
| Astro Bot | Larger dot-matrix eyes, curved glossy blue grips and molded circuit relief corrected. |
| Astro Bot Joyful | Dot-matrix happy eyes and the same grip/relief corrections. |
| Spider-Man 2 | Reference-derived symbiote contours, emblem and white controls reviewed. |
| God of War Ragnarok | Blue rear restored, rear logo fitted from official high-resolution logo, pale grip tips; front bear/wolf reviewed. |
| Final Fantasy XVI | Gold/blue vector artwork and matte-versus-metallic material separation reviewed. |
| Hogwarts Legacy | Generic castle and repeated waves replaced with traced castle/magic artwork. |
| LeBron James | Invented grip words and generic fonts replaced with the actual reference lettering and graffiti contours. |
| Concord | Incorrect generic bands replaced with the actual red/teal ship artwork; rear emblem/wordmark corrected. |
| Fortnite | Reference-derived Peely/Fishstick graphics and blue controls reviewed. |
| Helldivers 2 | Skull, worn yellow markings and matte armor/paint material separation reviewed. |
| The Last of Us | Reference emblems/trophy artwork and glossy print on matte substrate reviewed. |
| Death Stranding 2 | Orange Drawbridge artwork and matte substrate reviewed. |
| Ghost of Yotei Gold | Incorrect gold substrate/toy silhouette replaced with pale material, traced brushwork/Atsu, gold glyphs and referenced rear branding. |
| Ghost of Yotei Black | Sumi-e artwork, pale substrate, dark printed finish and rear branding reviewed. |
| Marathon | Industrial front markings, lime rear wordmark and substrate finish reviewed. |
| 007 First Light | Gold front/rear material, black controls, radial front and rear wordmark reviewed. |
| GTA VI Black | Deep green-black substrate, palm/VI relief, iridescence, blue/violet trim, pink markings, purple tips and rear branding corrected. |
| GTA VI White | White substrate/controls using the shared GTA relief and separate color profile; same coating/marking/tip corrections. |
| LISA | Pearl profile, reference eyes/signature and rear details reviewed. |
| Gray Camouflage | Reference pattern and matte material profile reviewed. |

The source record is in [texture-references.json](./texture-references.json). Material values and inferred relief remain estimates. Tiny unreadable print and unseen surfaces cannot be verified from these references. Original model geometry is shared across editions, so variant-specific physical construction is not asserted.

## Fine-detail pass

Marathon, Death Stranding 2, LISA, Yotei Black and Gray Camouflage now use 3840-pixel manufacturer reference renders. LeBron uses a larger frontal product reference; Helldivers uses a clean frontal render registered to the existing plate. Astro grip panels are reference-traced and both eye patterns have been revised. All catalog contours retain small counters and sharp corners instead of midpoint smoothing. Gray Camouflage extraction suppresses photographed surface grain, leaving the supplied normal map responsible for plastic texture.

These remain reconstructed artwork plates baked to the original model UV charts, not official production texture files. FF XVI, Hogwarts, Concord, The Last of Us and Yotei Gold retain source-resolution limits despite finer extraction. Edition finish maps are preserved; the mobile control canvas aspect ratio is corrected.

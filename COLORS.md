# Controller color reference audit

Reviewed November 2, 2026 against PlayStation product descriptions and imagery. RGB presets are visual approximations, not measured plastic or paint samples. Lighting, tone mapping, display calibration, and the underlying model affect the rendered appearance.

| Presets | Reference behavior | Preview |
| --- | --- | --- |
| Original White | Factory white plastic with black accents | Default model textures on factory-white parts. |
| Classic White | Original white-and-black controller | Same factory appearance as Original White: white shell, black trim, sticks and triggers, translucent controls. |
| Midnight Black, Cosmic Red, Starlight Blue, Galactic Purple, Nova Pink | Standard molded colors with black center trim and hardware | Whole-controller presets color the shell, touchpad and matching controls, retaining black center trim, sticks, bumpers, triggers, PS and mute buttons. Approximate hues with matte finishes. |
| Cobalt Blue, Volcanic Red, Sterling Silver | Smooth metallic shell with black center trim and hardware | Whole-controller presets keep the same black hardware layout as the molded colors. Metallic shell and matching controls; hues are approximate. |
| Chroma Pearl, Chroma Indigo, Chroma Teal | Iridescent finishes that shift with viewing angle | Iridescence is simulated. Pearl uses a white base with a subtle cream/pink sheen; Indigo blue/purple, and Teal green hues. Not an exact optical match. |
| Techno Red, Remix Green, Rhythm Blue | Glossy black-to-neon gradients wrapping the front and back | Continuous height-based black-to-neon gradient on the front and rear with gloss. |

Replacement paint previously inherited a darkening factor from the original model's color texture. Replacement colors now use their own albedo; geometry, normal maps, and lighting retain the surface detail. This also keeps a white preset from varying with the source part's original color.

Sources:

- [PlayStation controller colors](https://www.playstation.com/en-us/accessories/dualsense-wireless-controller/)
- [Deep Earth metallic collection](https://blog.playstation.com/2023/09/14/introducing-the-deep-earth-collection-a-new-metallic-colorway-for-ps5-accessories-available-starting-later-this-year/)
- [Chroma collection](https://blog.playstation.com/2024/09/25/20240925-chromacollection/)
- [Hyperpop collection](https://blog.playstation.com/2026/01/07/revealing-the-hyperpop-collection-with-three-new-designs-for-ps5-accessories-launching-this-march/)
- [Genshin Impact white, gold, and green palette](https://blog.playstation.com/2025/12/01/step-into-a-new-adventure-with-the-upcoming-dualsense-wireless-controller-genshin-impact-limited-edition/)

Original White and Classic White both preserve the supplied factory materials for the white-and-black controller. Chroma Pearl uses a white base with reduced metalness and a subtle iridescent coating, rather than pink paint.

Applying a named standard color to the whole controller uses its retail layout. Selecting individual parts still permits custom paint combinations. Chroma and Hyperpop retain their distinct coordinated finishes rather than inheriting the standard black trim layout. Version 1 and 2 saved uniform standard colors migrate to the retail layout; version 3 preserves explicit part selections.

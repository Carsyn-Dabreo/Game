# Asset Pipeline

Recommended realistic sources for the next visual pass:

- `Poly Haven` (`CC0`): [https://polyhaven.com/license](https://polyhaven.com/license)
  - Use for HDRIs, concrete, asphalt, debris, rust, and grunge textures.
- `ambientCG` (`CC0`): [https://ambientcg.com/](https://ambientcg.com/)
  - Good for cracked asphalt, damaged concrete, metal panels, and rubble.
- `Adobe Mixamo` (royalty-free for games under Adobe terms): [https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html](https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html)
  - Use for humanoid zombie rigs and walk/attack animations.
- `Kenney` (`CC0`): [https://kenney.nl/assets](https://kenney.nl/assets)
  - Good fallback for props, barricades, crates, and environment set dressing.

Suggested local folder layout:

- `public/models/zombies/`
- `public/models/environment/`
- `public/textures/asphalt/`
- `public/textures/concrete/`
- `public/textures/metal/`

Current code is structured so imported assets can replace code-driven placeholders in:

- `src/components/game/AnimatedZombie.jsx`
- `src/components/game/RuinedCityWorld.jsx`
- `src/components/game/survivalData.js`

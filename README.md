# Eliza Birthday Site — Launch Polish Build

Main entry: `index.html`.

This build is based directly on the October 16, 2026 site package and preserves the current pages, games, interactions, assets, discovery IDs, and 8-discovery final-analysis threshold.

## Launch-only polish
- Preloads the six intro jump frames in JavaScript so the first click animation is less likely to stutter on a cold cache.
- Adds a confirmation prompt before `reset progress` clears local discovery state.
- When a newly found secret crosses the 8-discovery threshold, the toast explicitly announces that Final Analysis is unlocked.
- Removes two confirmed-unused PNGs and internal image-generation prompt notes from the deploy bundle.
- Adds `.nojekyll` so GitHub Pages can serve the static site directly without Jekyll processing.

## Hosting
The project is a static multi-page HTML/CSS/JavaScript site using relative URLs and browser `localStorage`. Upload the *contents of this folder* as the web root so `index.html` is at the published root.
